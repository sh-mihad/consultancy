import mongoose, { Schema, type Model } from "mongoose"

/**
 * Singleton holding all editable homepage/site copy. Exactly one document.
 *
 * Always read and write it with findOneAndUpdate({}, …, { upsert: true }).
 * A plain create() on a second save silently produces two config documents and
 * a homepage that changes depending on which one is read first.
 */

export interface IHowToStep {
  title: string
  description?: string
}

export interface ISiteSettings {
  _id: mongoose.Types.ObjectId

  hero: {
    heading: string
    subheading?: string
    ctaLabel?: string
    ctaHref?: string
    backgroundImage?: string
  }

  aboutUs: {
    eyebrow?: string
    heading: string
    /** Rich text (Tiptap). Render inside .prose-content. */
    body?: string
    image?: string
  }

  mainServices: {
    eyebrow?: string
    heading: string
    description?: string
  }

  howTo: {
    eyebrow?: string
    heading: string
    description?: string
    steps: IHowToStep[]
  }

  reviewsSection: {
    eyebrow?: string
    heading: string
    description?: string
    /** Manually maintained Google rating badge — no API call. */
    googleRatingValue?: number
    googleReviewCount?: number
    googleListingUrl?: string
  }

  contact: {
    heading: string
    description?: string
    email?: string
    phone?: string
    address?: string
    mapEmbedUrl?: string
  }

  footer: {
    about?: string
    facebook?: string
    linkedin?: string
    twitter?: string
    youtube?: string
  }

  seo: {
    defaultTitle?: string
    defaultDescription?: string
    defaultOgImage?: string
  }

  createdAt: Date
  updatedAt: Date
}

const HowToStepSchema = new Schema<IHowToStep>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
)

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    hero: {
      heading: { type: String, default: "Your business, legally sound." },
      subheading: { type: String },
      ctaLabel: { type: String, default: "Book a consultation" },
      ctaHref: { type: String, default: "#contact" },
      backgroundImage: { type: String },
    },
    aboutUs: {
      eyebrow: { type: String, default: "About us" },
      heading: { type: String, default: "Who we are" },
      body: { type: String, default: "" },
      image: { type: String },
    },
    mainServices: {
      eyebrow: { type: String, default: "What we do" },
      heading: { type: String, default: "Our services" },
      description: { type: String },
    },
    howTo: {
      eyebrow: { type: String, default: "Step by step" },
      heading: {
        type: String,
        default: "How to open a company in Bangladesh",
      },
      description: { type: String },
      steps: { type: [HowToStepSchema], default: [] },
    },
    reviewsSection: {
      eyebrow: { type: String, default: "Testimonials" },
      heading: { type: String, default: "What our clients say" },
      description: { type: String },
      googleRatingValue: { type: Number, min: 0, max: 5 },
      googleReviewCount: { type: Number, min: 0 },
      googleListingUrl: { type: String },
    },
    contact: {
      heading: { type: String, default: "Talk to us" },
      description: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      mapEmbedUrl: { type: String },
    },
    footer: {
      about: { type: String },
      facebook: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      youtube: { type: String },
    },
    seo: {
      defaultTitle: { type: String },
      defaultDescription: { type: String },
      defaultOgImage: { type: String },
    },
  },
  { timestamps: true }
)

export const SiteSettings: Model<ISiteSettings> =
  (mongoose.models.SiteSettings as Model<ISiteSettings>) ??
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema)

/** The only correct way to load settings — creates the singleton on first call. */
export async function getSiteSettings(): Promise<ISiteSettings> {
  const doc = await SiteSettings.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  ).lean<ISiteSettings>()

  return doc as ISiteSettings
}
