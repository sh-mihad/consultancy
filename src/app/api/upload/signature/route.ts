import { requireAdmin } from "@/lib/auth-guard"
import { fail, handleApiError, ok, unauthorized } from "@/lib/api-response"
import { rateLimit } from "@/lib/rate-limit"
import {
  UPLOAD_FOLDER,
  cloudinaryConfig,
  signUpload,
  uploadUrl,
} from "@/lib/cloudinary"

/**
 * Hands the browser a short-lived Cloudinary upload signature.
 *
 * The file itself never comes here — the client posts it straight to Cloudinary
 * with the credentials below. This route exists purely so the API secret stays
 * on the server: the alternative, an unsigned upload preset, is a public write
 * endpoint into our storage quota.
 *
 * Runs on the Node runtime (the default). Do not move it to edge — signing
 * needs `node:crypto`.
 */

// Generous for a human clicking Upload, low enough that a runaway loop in the
// admin UI can't quietly spend the month's credits. Keyed per admin, not per IP:
// the route is already session-gated, so IP adds nothing.
const LIMIT = 30
const WINDOW_MS = 60 * 1000

export async function POST() {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const limit = rateLimit(`upload:${session.user.id}`, {
      limit: LIMIT,
      windowMs: WINDOW_MS,
    })

    if (!limit.allowed) {
      return fail("Too many uploads. Please try again shortly.", 429)
    }

    // Reported explicitly rather than through handleApiError, which correctly
    // hides internal errors behind a generic 500. This one is a setup mistake,
    // the caller is a signed-in admin, and naming the variable saves a long
    // debugging session against an opaque Cloudinary rejection.
    let config
    try {
      config = cloudinaryConfig()
    } catch (err) {
      console.error("[upload] cloudinary config:", err)
      return fail(
        "Image uploads are not configured. Set the CLOUDINARY_* variables in .env.local.",
        500
      )
    }

    const { cloudName, apiKey, apiSecret } = config

    // Cloudinary expects seconds, not milliseconds. A signature is good for an
    // hour from this value.
    const timestamp = Math.floor(Date.now() / 1000)

    // Whatever is signed here must be sent with the upload, and nothing else.
    const signature = signUpload({ folder: UPLOAD_FOLDER, timestamp }, apiSecret)

    // The API key is public by Cloudinary's design — it identifies the account,
    // it does not authorise anything on its own. The secret never leaves here.
    return ok({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder: UPLOAD_FOLDER,
      uploadUrl: uploadUrl(cloudName),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
