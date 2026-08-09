/**
 * Upload rules shared by the browser and the server.
 *
 * Deliberately separate from `lib/cloudinary.ts`: that file imports `node:crypto`
 * to sign requests, and a `"use client"` component importing it would drag a Node
 * builtin into the browser bundle and fail the build. Everything here is plain
 * data, so both sides can read one definition instead of drifting apart.
 */

/** 5 MB. Large enough for a 1600px-wide cover, small enough to upload quickly. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

/**
 * Formats Cloudinary can process and browsers can render. SVG is excluded on
 * purpose — it is executable markup, and these files are served from our own
 * domain-adjacent CDN.
 */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const

/** Value for an <input type="file"> accept attribute. */
export const ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(",")

/** "8.2 MB" — for telling an admin exactly how far over the limit they are. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Client-side gate, run before any network call. Returns an error message, or
 * null when the file is acceptable.
 *
 * This is a courtesy check, not a security boundary — Cloudinary enforces its
 * own limits, and the signature is what stops unauthorised uploads.
 */
export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Choose a JPEG, PNG, WebP, AVIF or GIF image."
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return `Images must be under ${formatBytes(MAX_UPLOAD_BYTES)} — this one is ${formatBytes(file.size)}.`
  }

  return null
}
