import type { Metadata } from "next"

import { getSettings } from "@/lib/queries"

/**
 * One metadata builder for every public route, so all of them stay consistent.
 *
 * `metadataBase` is set once in the root layout. Without it a relative image
 * path stays relative, and social scrapers render no preview at all — silently,
 * with nothing in the build output to warn you.
 */

export type BuildMetadataArgs = {
  title: string
  description?: string
  /** Path only, e.g. "/taxation/vat-registration". Used for the canonical URL. */
  path: string
  /** Highest-priority image. Falls back through the chain below. */
  image?: string
  /** Blogs pass coverImage here as the second choice. */
  fallbackImage?: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  /** Drafts and admin pages must never be indexed. */
  noIndex?: boolean
}

export async function buildMetadata({
  title,
  description,
  path,
  image,
  fallbackImage,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex,
}: BuildMetadataArgs): Promise<Metadata> {
  const settings = await getSettings()

  // Resolution order: explicit ogImage -> per-type fallback (blog coverImage)
  // -> the site-wide default from SiteSettings.
  const resolvedImage =
    image || fallbackImage || settings.seo?.defaultOgImage || undefined

  const resolvedDescription = description || settings.seo?.defaultDescription

  return {
    title,
    description: resolvedDescription,
    alternates: { canonical: path },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: resolvedDescription,
      url: path,
      type,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(resolvedImage
        ? { images: [{ url: resolvedImage, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      ...(resolvedImage ? { images: [resolvedImage] } : {}),
    },
  }
}
