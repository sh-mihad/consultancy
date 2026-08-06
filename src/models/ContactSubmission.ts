import mongoose, { Schema, type Model } from "mongoose"

/**
 * Contact form entry. Written by the public POST /api/contact — the only public
 * write endpoint in the app — and readable only by an authenticated admin.
 */
export interface IContactSubmission {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: [true, "Name is required."], trim: true },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: [true, "Message is required."], trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Inbox: newest first.
ContactSubmissionSchema.index({ createdAt: -1 })

export const ContactSubmission: Model<IContactSubmission> =
  (mongoose.models.ContactSubmission as Model<IContactSubmission>) ??
  mongoose.model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema)
