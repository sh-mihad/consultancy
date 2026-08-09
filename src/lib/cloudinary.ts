import { createHash } from "node:crypto"

/**
 * Cloudinary upload signing. SERVER ONLY — never import this from a
 * `"use client"` component; `node:crypto` does not exist in the browser bundle.
 * Client-safe constants live in `lib/upload.ts`.
 *
 * The browser uploads straight to Cloudinary rather than through this app: a
 * file posted to a route handler would hit the body-size limit and cost double
 * the bandwidth for no benefit. What the browser cannot do is sign the request,
 * which is the whole point of `POST /api/upload/signature` — an unsigned upload
 * preset would let anyone who found the preset name spend our storage quota.
 */

/** Cloudinary folder every upload lands in, so the media library stays tidy. */
export const UPLOAD_FOLDER = "consultency"

/** Signatures are valid for one hour from `timestamp`, per Cloudinary. */
export type CloudinaryConfig = {
  cloudName: string
  apiKey: string
  apiSecret: string
}

/**
 * Read and validate the three env vars.
 *
 * Checked inside the function rather than at module scope for the same reason
 * as `lib/db.ts`: a top-level throw breaks `next build`, which imports modules
 * without a populated env.
 */
export function cloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  const missing = [
    !cloudName && "CLOUDINARY_CLOUD_NAME",
    !apiKey && "CLOUDINARY_API_KEY",
    !apiSecret && "CLOUDINARY_API_SECRET",
  ].filter(Boolean)

  // Without this the signature is computed over "undefined" and Cloudinary
  // rejects the upload with an opaque 401 that says nothing about the cause.
  if (missing.length) {
    throw new Error(
      `Cloudinary is not configured. Missing ${missing.join(", ")} — see .env.example.`
    )
  }

  return { cloudName: cloudName!, apiKey: apiKey!, apiSecret: apiSecret! }
}

/**
 * Cloudinary's signature: every parameter that will be sent with the upload
 * except `file`, `api_key`, `resource_type` and `cloud_name`, sorted by key,
 * joined as `k=v&k=v`, with the API secret appended, then SHA-1 hex.
 *
 * The signed set must match the sent set exactly. Add a parameter to the upload
 * without signing it (or sign one you don't send) and Cloudinary returns
 * "Invalid Signature" with no indication of which field disagreed.
 */
export function signUpload(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&")

  return createHash("sha1").update(payload + apiSecret).digest("hex")
}

/** The endpoint the browser posts the file to. */
export function uploadUrl(cloudName: string): string {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
}
