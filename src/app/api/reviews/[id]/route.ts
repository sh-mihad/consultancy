import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { Review } from "@/models/Review"
import { reviewSchema } from "@/lib/validation"
import { requireAdmin } from "@/lib/auth-guard"
import {
  fail,
  handleApiError,
  notFound,
  ok,
  unauthorized,
} from "@/lib/api-response"

type Context = { params: Promise<{ id: string }> }

/** PUT /api/reviews/[id] — update a testimonial. */
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    const values = await reviewSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    await dbConnect()

    const review = await Review.findByIdAndUpdate(id, values, {
      returnDocument: "after",
      runValidators: true,
    })
    if (!review) return notFound("Review")

    return ok({
      id: String(review._id),
      authorName: review.authorName,
      rating: review.rating,
      isActive: review.isActive,
    })
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * DELETE /api/reviews/[id]
 *
 * A testimonial owns nothing, so deletion is unrestricted. Deactivating
 * (isActive: false) is the non-destructive alternative and is offered in the UI.
 */
export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params
    await dbConnect()

    const review = await Review.findByIdAndDelete(id)
    if (!review) return notFound("Review")

    return ok({ id })
  } catch (err) {
    return handleApiError(err)
  }
}
