import mongoose, { Schema, type Model } from "mongoose"

/** A sub-menu page belonging to exactly one Menu. */
export interface IPage {
  _id: mongoose.Types.ObjectId
  menuId: mongoose.Types.ObjectId
  title: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  content: string
  order: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const PageSchema = new Schema<IPage>(
  {
    menuId: {
      type: Schema.Types.ObjectId,
      ref: "Menu",
      required: [true, "A parent menu is required."],
      index: true,
    },
    title: { type: String, required: [true, "Title is required."], trim: true },
    slug: {
      type: String,
      required: [true, "Slug is required."],
      trim: true,
      lowercase: true,
    },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    content: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Slug is unique *within* a menu — two menus may each have an "overview" page.
PageSchema.index({ menuId: 1, slug: 1 }, { unique: true })

// Public listing: published pages of one menu, in display order.
PageSchema.index({ menuId: 1, isPublished: 1, order: 1 })

export const Page: Model<IPage> =
  (mongoose.models.Page as Model<IPage>) ?? mongoose.model<IPage>("Page", PageSchema)
