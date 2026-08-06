import mongoose, { Schema, type Model } from "mongoose"

export type AdminRole = "admin" | "editor"

export interface IAdmin {
  _id: mongoose.Types.ObjectId
  email: string
  passwordHash: string
  name: string
  role: AdminRole
  createdAt: Date
  updatedAt: Date
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      unique: true,
    },
    // Never store a plaintext password. Hashing happens in the seed script and
    // in any future admin-management route, never in a schema hook — keeping it
    // explicit makes it obvious at the call site.
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: [true, "Name is required."], trim: true },
    role: { type: String, enum: ["admin", "editor"], default: "admin" },
  },
  { timestamps: true }
)

export const Admin: Model<IAdmin> =
  (mongoose.models.Admin as Model<IAdmin>) ??
  mongoose.model<IAdmin>("Admin", AdminSchema)
