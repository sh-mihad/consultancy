import mongoose, { Schema, type Model } from "mongoose"

/**
 * Blog post. NOT a Menu item — this is its own top-level content type with its
 * own routes (/blogs, /blogs/[slug]) and no menuId.
 */
export interface IBlog {
  _id: mongoose.Types.ObjectId
  title: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  content: string
  /** Card/hero image. Different aspect ratio from ogImage — keep them separate. */
  coverImage?: string
  author?: string
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: [true, "Title is required."], trim: true },
    slug: {
      type: String,
      required: [true, "Slug is required."],
      trim: true,
      lowercase: true,
      unique: true,
    },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    content: { type: String, default: "" },
    coverImage: { type: String, trim: true },
    author: { type: String, trim: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
)

// Public listing: newest published first.
BlogSchema.index({ isPublished: 1, publishedAt: -1 })

export const Blog: Model<IBlog> =
  (mongoose.models.Blog as Model<IBlog>) ?? mongoose.model<IBlog>("Blog", BlogSchema)
