import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { Review } from "@/models/Review"
import { reviewSchema } from "@/lib/validation"
import { parseReorderPayload } from "@/lib/reorder"
import { requireAdmin } from "@/lib/auth-guard"
import { created, fail, handleApiError, ok, unauthorized } from "@/lib/api-response"

/**
 * Reviews are admin-managed testimonials rendered on the homepage only.
 *
 * There is no public GET here on purpose — the homepage reads them server-side
 * through lib/queries.ts, so no endpoint needs to expose them to the browser.
 */

/** GET /api/reviews — admin list, inactive ones included. */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    await dbConnect()

    const reviews = await Review.find({}).sort({ order: 1, createdAt: -1 }).lean()

    return ok(
      reviews.map((r) => ({
        id: String(r._id),
        authorName: r.authorName,
        authorTitle: r.authorTitle ?? "",
        avatar: r.avatar ?? "",
        rating: r.rating,
        quote: r.quote,
        order: r.order,
        isActive: r.isActive,
      }))
    )
  } catch (err) {
    return handleApiError(err)
  }
}

/** PATCH /api/reviews — bulk reorder, same contract as menus and pages. */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const body = await request.json().catch(() => null)
    const parsed = parseReorderPayload(body)
    if (!parsed.ok) return fail(parsed.error, 400)

    await dbConnect()

    await Review.bulkWrite(
      parsed.items.map(({ id, order }) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order } } },
      }))
    )

    return ok({ updated: parsed.items.length })
  } catch (err) {
    return handleApiError(err)
  }
}

/** POST /api/reviews — create a testimonial. */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    const values = await reviewSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    await dbConnect()

    // New reviews go to the end rather than colliding at order 0.
    const last = await Review.findOne({}).sort({ order: -1 }).select("order").lean()
    const order = values.order || (last ? last.order + 1 : 0)

    const review = await Review.create({ ...values, order })

    return created({
      id: String(review._id),
      authorName: review.authorName,
      rating: review.rating,
      isActive: review.isActive,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
