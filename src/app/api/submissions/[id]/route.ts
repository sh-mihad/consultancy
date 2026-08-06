import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { ContactSubmission } from "@/models/ContactSubmission"
import { requireAdmin } from "@/lib/auth-guard"
import {
  fail,
  handleApiError,
  notFound,
  ok,
  unauthorized,
} from "@/lib/api-response"

/**
 * Admin-only side of the contact form.
 *
 * POST /api/contact writes submissions and is public; everything that reads or
 * changes them lives here behind requireAdmin(). There is deliberately no
 * public GET — a visitor must never be able to read the inbox.
 *
 * Submissions are not editable: the only mutable field is `isRead`.
 */

type Context = { params: Promise<{ id: string }> }

/** PATCH /api/submissions/[id] — mark read or unread. */
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    const { isRead } = body as { isRead?: unknown }
    if (typeof isRead !== "boolean") {
      return fail("isRead must be true or false.", 422, {
        isRead: "Expected a boolean.",
      })
    }

    await dbConnect()

    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      { $set: { isRead } },
      { returnDocument: "after" }
    )
    if (!submission) return notFound("Submission")

    return ok({ id: String(submission._id), isRead: submission.isRead })
  } catch (err) {
    return handleApiError(err)
  }
}

/** DELETE /api/submissions/[id] — remove a message for good. */
export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params
    await dbConnect()

    const submission = await ContactSubmission.findByIdAndDelete(id)
    if (!submission) return notFound("Submission")

    return ok({ id })
  } catch (err) {
    return handleApiError(err)
  }
}
