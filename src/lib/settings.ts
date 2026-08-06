import type { ISiteSettings } from "@/models/SiteSettings"
import type { SiteSettingsInput } from "@/lib/validation"

/**
 * SiteSettings moves between three shapes — the Mongoose document, the Formik
 * form, and the `$set` payload — and it has ~30 mostly-optional fields. Both
 * conversions live here so the admin page, the form and the route handler can't
 * drift apart on which fields exist.
 *
 * Optional strings are carried as `""` rather than `undefined` in both
 * directions. A controlled input cannot take `undefined` without React warning
 * about it switching to uncontrolled, and an update that omits a key leaves the
 * old value in the database — so an admin who cleared a field would watch it
 * come straight back on the next load.
 */

const str = (value?: string | null): string => value ?? ""

/** Document → form values. */
export function toSettingsInput(doc: ISiteSettings): SiteSettingsInput {
  return {
    hero: {
      heading: str(doc.hero?.heading),
      subheading: str(doc.hero?.subheading),
      ctaLabel: str(doc.hero?.ctaLabel),
      ctaHref: str(doc.hero?.ctaHref),
      backgroundImage: str(doc.hero?.backgroundImage),
    },
    aboutUs: {
      eyebrow: str(doc.aboutUs?.eyebrow),
      heading: str(doc.aboutUs?.heading),
      body: str(doc.aboutUs?.body),
      image: str(doc.aboutUs?.image),
    },
    mainServices: {
      eyebrow: str(doc.mainServices?.eyebrow),
      heading: str(doc.mainServices?.heading),
      description: str(doc.mainServices?.description),
    },
    howTo: {
      eyebrow: str(doc.howTo?.eyebrow),
      heading: str(doc.howTo?.heading),
      description: str(doc.howTo?.description),
      steps: (doc.howTo?.steps ?? []).map((step) => ({
        title: str(step.title),
        description: str(step.description),
      })),
    },
    reviewsSection: {
      eyebrow: str(doc.reviewsSection?.eyebrow),
      heading: str(doc.reviewsSection?.heading),
      description: str(doc.reviewsSection?.description),
      googleRatingValue: doc.reviewsSection?.googleRatingValue ?? null,
      googleReviewCount: doc.reviewsSection?.googleReviewCount ?? null,
      googleListingUrl: str(doc.reviewsSection?.googleListingUrl),
    },
    contact: {
      heading: str(doc.contact?.heading),
      description: str(doc.contact?.description),
      email: str(doc.contact?.email),
      phone: str(doc.contact?.phone),
      address: str(doc.contact?.address),
      mapEmbedUrl: str(doc.contact?.mapEmbedUrl),
    },
    footer: {
      about: str(doc.footer?.about),
      facebook: str(doc.footer?.facebook),
      linkedin: str(doc.footer?.linkedin),
      twitter: str(doc.footer?.twitter),
      youtube: str(doc.footer?.youtube),
    },
    seo: {
      defaultTitle: str(doc.seo?.defaultTitle),
      defaultDescription: str(doc.seo?.defaultDescription),
      defaultOgImage: str(doc.seo?.defaultOgImage),
    },
  }
}

/**
 * Validated form values → the `$set` payload.
 *
 * Each section is written as a whole object, never as dotted paths. Dotted
 * paths would let a cleared field survive: Mongoose drops `undefined` from an
 * update, so `{"hero.backgroundImage": undefined}` is a no-op. Replacing the
 * whole `hero` object removes anything the admin emptied.
 *
 * The optional numbers stay `undefined` rather than `null` — the subdocument is
 * being replaced anyway, so leaving the key out is what clears it.
 */
export function toSettingsUpdate(values: SiteSettingsInput) {
  const rating = values.reviewsSection.googleRatingValue
  const reviewCount = values.reviewsSection.googleReviewCount

  return {
    hero: {
      heading: values.hero.heading,
      subheading: str(values.hero.subheading),
      ctaLabel: str(values.hero.ctaLabel),
      ctaHref: str(values.hero.ctaHref),
      backgroundImage: str(values.hero.backgroundImage),
    },
    aboutUs: {
      eyebrow: str(values.aboutUs.eyebrow),
      heading: values.aboutUs.heading,
      body: str(values.aboutUs.body),
      image: str(values.aboutUs.image),
    },
    mainServices: {
      eyebrow: str(values.mainServices.eyebrow),
      heading: values.mainServices.heading,
      description: str(values.mainServices.description),
    },
    howTo: {
      eyebrow: str(values.howTo.eyebrow),
      heading: values.howTo.heading,
      description: str(values.howTo.description),
      steps: (values.howTo.steps ?? []).map((step) => ({
        title: step.title,
        description: str(step.description),
      })),
    },
    reviewsSection: {
      eyebrow: str(values.reviewsSection.eyebrow),
      heading: values.reviewsSection.heading,
      description: str(values.reviewsSection.description),
      googleRatingValue: typeof rating === "number" ? rating : undefined,
      googleReviewCount: typeof reviewCount === "number" ? reviewCount : undefined,
      googleListingUrl: str(values.reviewsSection.googleListingUrl),
    },
    contact: {
      heading: values.contact.heading,
      description: str(values.contact.description),
      email: str(values.contact.email),
      phone: str(values.contact.phone),
      address: str(values.contact.address),
      mapEmbedUrl: str(values.contact.mapEmbedUrl),
    },
    footer: {
      about: str(values.footer.about),
      facebook: str(values.footer.facebook),
      linkedin: str(values.footer.linkedin),
      twitter: str(values.footer.twitter),
      youtube: str(values.footer.youtube),
    },
    seo: {
      defaultTitle: str(values.seo.defaultTitle),
      defaultDescription: str(values.seo.defaultDescription),
      defaultOgImage: str(values.seo.defaultOgImage),
    },
  }
}
