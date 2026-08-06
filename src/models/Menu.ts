import mongoose, { Schema, type Model } from "mongoose"

/** Main service category. Seeded with defaults, but fully editable by the admin. */
export interface IMenu {
  _id: mongoose.Types.ObjectId
  title: string
  slug: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const MenuSchema = new Schema<IMenu>(
  {
    title: { type: String, required: [true, "Title is required."], trim: true },
    slug: {
      type: String,
      required: [true, "Slug is required."],
      trim: true,
      lowercase: true,
      unique: true,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Public navigation query: active menus in display order.
MenuSchema.index({ isActive: 1, order: 1 })

export const Menu: Model<IMenu> =
  (mongoose.models.Menu as Model<IMenu>) ?? mongoose.model<IMenu>("Menu", MenuSchema)
