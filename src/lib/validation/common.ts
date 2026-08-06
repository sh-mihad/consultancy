import * as Yup from "yup"

import { SLUG_PATTERN } from "@/lib/slugify"

/**
 * Shared field builders.
 *
 * These schemas are imported by BOTH the Formik form and the route handler.
 * One definition, two consumers — never validate on the client only.
 */

export const slugField = Yup.string()
  .trim()
  .lowercase()
  .required("Slug is required.")
  .max(120, "Slug is too long.")
  .matches(
    SLUG_PATTERN,
    "Use lowercase letters, numbers and single hyphens (e.g. trade-licence)."
  )

export const titleField = Yup.string()
  .trim()
  .required("Title is required.")
  .max(200, "Title is too long.")

export const metaTitleField = Yup.string()
  .trim()
  .max(70, "Meta titles over 70 characters get truncated in search results.")

export const metaDescriptionField = Yup.string()
  .trim()
  .max(160, "Meta descriptions over 160 characters get truncated in search results.")

/** Optional absolute URL. Empty string is allowed and normalised to undefined. */
export const optionalUrlField = (message = "Enter a valid URL.") =>
  Yup.string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .url(message)

export const orderField = Yup.number()
  .typeError("Order must be a number.")
  .integer("Order must be a whole number.")
  .min(0, "Order cannot be negative.")
  .default(0)

/** Mongo ObjectId, validated before it reaches a CastError. */
export const objectIdField = Yup.string()
  .trim()
  .required("This field is required.")
  .matches(/^[a-f\d]{24}$/i, "Invalid identifier.")
