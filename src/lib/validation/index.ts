import * as Yup from "yup"

import {
  metaDescriptionField,
  metaTitleField,
  objectIdField,
  optionalUrlField,
  orderField,
  slugField,
  titleField,
} from "./common"

export * from "./common"

/* ------------------------------------------------------------------- menu */

export const menuSchema = Yup.object({
  title: titleField,
  slug: slugField,
  order: orderField,
  isActive: Yup.boolean().default(true),
})

export type MenuInput = Yup.InferType<typeof menuSchema>

/* ------------------------------------------------------------------- page */

export const pageSchema = Yup.object({
  menuId: objectIdField,
  title: titleField,
  slug: slugField,
  metaTitle: metaTitleField,
  metaDescription: metaDescriptionField,
  ogImage: optionalUrlField("Enter a valid image URL."),
  content: Yup.string().default(""),
  order: orderField,
  isPublished: Yup.boolean().default(false),
})

export type PageInput = Yup.InferType<typeof pageSchema>

/* ------------------------------------------------------------------- blog */

export const blogSchema = Yup.object({
  title: titleField,
  slug: slugField,
  metaTitle: metaTitleField,
  metaDescription: metaDescriptionField,
  ogImage: optionalUrlField("Enter a valid image URL."),
  coverImage: optionalUrlField("Enter a valid image URL."),
  content: Yup.string().default(""),
  author: Yup.string().trim().max(120, "Author name is too long."),
  isPublished: Yup.boolean().default(false),
  publishedAt: Yup.date()
    .nullable()
    .transform((value, original) => (original === "" ? null : value)),
})

export type BlogInput = Yup.InferType<typeof blogSchema>

/* ----------------------------------------------------------------- review */

export const reviewSchema = Yup.object({
  authorName: Yup.string()
    .trim()
    .required("Author name is required.")
    .max(120, "Name is too long."),
  authorTitle: Yup.string().trim().max(160, "Title is too long."),
  avatar: optionalUrlField("Enter a valid image URL."),
  rating: Yup.number()
    .typeError("Rating must be a number.")
    .integer("Rating must be a whole number.")
    .min(1, "Rating must be between 1 and 5.")
    .max(5, "Rating must be between 1 and 5.")
    .default(5),
  quote: Yup.string()
    .trim()
    .required("Quote is required.")
    .max(600, "Keep testimonials under 600 characters."),
  order: orderField,
  isActive: Yup.boolean().default(true),
})

export type ReviewInput = Yup.InferType<typeof reviewSchema>

/* ---------------------------------------------------------------- contact */

export const contactSchema = Yup.object({
  name: Yup.string().trim().required("Please enter your name.").max(120),
  email: Yup.string()
    .trim()
    .lowercase()
    .required("Please enter your email.")
    .email("Enter a valid email address."),
  phone: Yup.string().trim().max(40),
  subject: Yup.string().trim().max(200),
  message: Yup.string()
    .trim()
    .required("Please enter a message.")
    .min(10, "Please give us a little more detail.")
    .max(4000, "Message is too long."),
  /**
   * Honeypot. Real users never see this field, so any value means a bot.
   * The public endpoint is unauthenticated, so this plus rate limiting is the
   * only thing standing between the inbox and spam.
   */
  website: Yup.string().max(0, "Rejected."),
})

export type ContactInput = Yup.InferType<typeof contactSchema>

/* --------------------------------------------------------------- settings */

const howToStepSchema = Yup.object({
  title: Yup.string().trim().required("Step title is required.").max(200),
  description: Yup.string().trim().max(600),
})

export const siteSettingsSchema = Yup.object({
  hero: Yup.object({
    heading: Yup.string().trim().required("Hero heading is required.").max(200),
    subheading: Yup.string().trim().max(400),
    ctaLabel: Yup.string().trim().max(60),
    ctaHref: Yup.string().trim().max(300),
    backgroundImage: optionalUrlField("Enter a valid image URL."),
  }),
  aboutUs: Yup.object({
    eyebrow: Yup.string().trim().max(60),
    heading: Yup.string().trim().required("About heading is required.").max(200),
    body: Yup.string().default(""),
    image: optionalUrlField("Enter a valid image URL."),
  }),
  mainServices: Yup.object({
    eyebrow: Yup.string().trim().max(60),
    heading: Yup.string().trim().required("Services heading is required.").max(200),
    description: Yup.string().trim().max(600),
  }),
  howTo: Yup.object({
    eyebrow: Yup.string().trim().max(60),
    heading: Yup.string().trim().required("Section heading is required.").max(200),
    description: Yup.string().trim().max(600),
    steps: Yup.array().of(howToStepSchema).default([]),
  }),
  reviewsSection: Yup.object({
    eyebrow: Yup.string().trim().max(60),
    heading: Yup.string().trim().required("Section heading is required.").max(200),
    description: Yup.string().trim().max(600),
    googleRatingValue: Yup.number()
      .typeError("Rating must be a number.")
      .min(0)
      .max(5)
      .nullable()
      .transform((v, o) => (o === "" ? null : v)),
    googleReviewCount: Yup.number()
      .typeError("Review count must be a number.")
      .integer()
      .min(0)
      .nullable()
      .transform((v, o) => (o === "" ? null : v)),
    googleListingUrl: optionalUrlField("Enter a valid Google listing URL."),
  }),
  contact: Yup.object({
    heading: Yup.string().trim().required("Contact heading is required.").max(200),
    description: Yup.string().trim().max(600),
    email: Yup.string().trim().email("Enter a valid email address."),
    phone: Yup.string().trim().max(40),
    address: Yup.string().trim().max(400),
    mapEmbedUrl: optionalUrlField("Enter a valid map URL."),
  }),
  footer: Yup.object({
    about: Yup.string().trim().max(600),
    facebook: optionalUrlField(),
    linkedin: optionalUrlField(),
    twitter: optionalUrlField(),
    youtube: optionalUrlField(),
  }),
  seo: Yup.object({
    defaultTitle: metaTitleField,
    defaultDescription: metaDescriptionField,
    defaultOgImage: optionalUrlField("Enter a valid image URL."),
  }),
})

export type SiteSettingsInput = Yup.InferType<typeof siteSettingsSchema>

/* ------------------------------------------------------------------ login */

export const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .lowercase()
    .required("Email is required.")
    .email("Enter a valid email address."),
  password: Yup.string().required("Password is required."),
})

export type LoginInput = Yup.InferType<typeof loginSchema>
