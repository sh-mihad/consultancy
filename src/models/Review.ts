import mongoose, { Schema, type Model } from "mongoose"

/**
 * Customer testimonial — admin-entered, homepage only.
 *
 * Deliberately NOT sourced from the Google Places API: that caps at 5
 * non-selectable reviews, forbids storing them beyond ~30 days, bills per
 * request on its priciest SKU, and gives no way to filter a bad one.
 */
export interface IReview {
  _id: mongoose.Types.ObjectId
  authorName: string
  authorTitle?: string
  avatar?: string
  rating: number
  /** Plain text. No rich text here — testimonials are short quotes. */
  quote: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    authorName: {
      type: String,
      required: [true, "Author name is required."],
      trim: true,
    },
    authorTitle: { type: String, trim: true },
    avatar: { type: String, trim: true },
    rating: {
      type: Number,
      min: [1, "Rating must be between 1 and 5."],
      max: [5, "Rating must be between 1 and 5."],
      default: 5,
    },
    quote: { type: String, required: [true, "Quote is required."], trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Homepage query: active testimonials in display order.
ReviewSchema.index({ isActive: 1, order: 1 })

export const Review: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) ??
  mongoose.model<IReview>("Review", ReviewSchema)
