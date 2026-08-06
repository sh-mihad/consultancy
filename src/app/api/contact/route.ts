import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { ContactSubmission } from "@/models/ContactSubmission"
import { contactSchema } from "@/lib/validation"
import { created, fail, handleApiError } from "@/lib/api-response"
import { clientIp, rateLimit } from "@/lib/rate-limit"

/**
 * THE ONLY PUBLIC WRITE ENDPOINT in the app.
 *
 * Everything else under /api requires an admin session. This one cannot, so it
 * is defended three ways instead:
 *   1. honeypot field — bots fill hidden inputs, humans never see them
 *   2. IP rate limit — 5 submissions per 10 minutes
 *   3. server-side Yup validation, the same schema the form uses
 *
 * It must never return stored submissions. Reading the inbox is admin-only, via
 * a separate route.
 */

const LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request.headers)
    const limit = rateLimit(`contact:${ip}`, { limit: LIMIT, windowMs: WINDOW_MS })

    if (!limit.allowed) {
      return fail(
        "Too many messages sent. Please try again shortly.",
        429
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return fail("Invalid request body.", 400)
    }

    const values = await contactSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    // Honeypot tripped. Return 201 so the bot believes it succeeded and doesn't
    // retry with the field removed — but write nothing.
    if (values.website) {
      return created({ id: null })
    }

    await dbConnect()

    const submission = await ContactSubmission.create({
      name: values.name,
      email: values.email,
      phone: values.phone,
      subject: values.subject,
      message: values.message,
      isRead: false,
    })

    // Deliberately minimal: never echo the stored document back to a public
    // caller.
    return created({ id: String(submission._id) })
  } catch (err) {
    return handleApiError(err)
  }
}
