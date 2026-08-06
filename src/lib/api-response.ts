import { NextResponse } from "next/server"
import { ValidationError } from "yup"
import mongoose from "mongoose"

/**
 * Every API response has the same shape: { success, data, error }.
 * Never return a bare NextResponse.json(doc) from a route handler.
 */
export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: string | null
  /** Field-level messages, keyed by form field name. Present on 422 only. */
  fieldErrors?: Record<string, string>
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, error: null },
    { status }
  )
}

export function created<T>(data: T) {
  return ok(data, 201)
}

export function fail(
  error: string,
  status = 400,
  fieldErrors?: Record<string, string>
) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, data: null, error, ...(fieldErrors ? { fieldErrors } : {}) },
    { status }
  )
}

export const unauthorized = () => fail("You must be signed in.", 401)
export const notFound = (what = "Resource") => fail(`${what} not found.`, 404)

/**
 * Single catch-all for route handlers. Translates the errors we actually expect
 * into useful status codes, and hides everything else behind a 500 so internal
 * details never reach the client.
 */
export function handleApiError(err: unknown) {
  // Yup — server-side validation failed.
  if (err instanceof ValidationError) {
    const fieldErrors: Record<string, string> = {}
    for (const inner of err.inner.length ? err.inner : [err]) {
      if (inner.path && !fieldErrors[inner.path]) {
        fieldErrors[inner.path] = inner.message
      }
    }
    return fail("Validation failed.", 422, fieldErrors)
  }

  // Mongoose schema validation (a safety net behind Yup).
  if (err instanceof mongoose.Error.ValidationError) {
    const fieldErrors: Record<string, string> = {}
    for (const [path, e] of Object.entries(err.errors)) {
      fieldErrors[path] = e.message
    }
    return fail("Validation failed.", 422, fieldErrors)
  }

  if (err instanceof mongoose.Error.CastError) {
    return fail("Invalid identifier.", 400)
  }

  // Duplicate key — the unique index caught a slug collision that slipped past
  // the explicit check (two concurrent requests, for instance).
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    const key = Object.keys(
      (err as { keyPattern?: Record<string, unknown> }).keyPattern ?? {}
    )[0]
    return fail(
      "That value is already taken.",
      409,
      key ? { [key]: "Already in use." } : undefined
    )
  }

  console.error("[api] unhandled error:", err)
  return fail("Something went wrong.", 500)
}
