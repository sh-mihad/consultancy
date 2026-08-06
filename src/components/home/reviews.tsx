import { ExternalLink, Star } from "lucide-react"

import { ReviewCard } from "@/components/public/review-card"
import type { ReviewItem } from "@/lib/queries"
import type { ISiteSettings } from "@/models/SiteSettings"

/**
 * Customer testimonials — homepage only.
 *
 * These are admin-entered, not pulled from the Google Places API. The rating
 * badge below is a manually maintained figure from SiteSettings that links out
 * to the real listing; it is not fetched at render time. If live Google reviews
 * are ever wanted, swap the data source here and nothing else should change.
 */
export function Reviews({
  reviews,
  section,
}: {
  reviews: ReviewItem[]
  section: ISiteSettings["reviewsSection"]
}) {
  if (reviews.length === 0) return null

  const { googleRatingValue, googleReviewCount, googleListingUrl } = section

  return (
    <section className="section-alt">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          {section.eyebrow ? <p className="eyebrow mb-3">{section.eyebrow}</p> : null}
          <h2 className="heading-2 text-balance">{section.heading}</h2>
          {section.description ? <p className="lead mt-4">{section.description}</p> : null}

          {googleRatingValue ? (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-sm">
              <div className="flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(googleRatingValue)
                        ? "size-4 fill-accent text-accent"
                        : "size-4 fill-muted text-muted"
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{googleRatingValue.toFixed(1)}</span>
              {googleReviewCount ? (
                <span className="text-sm text-muted-foreground">
                  from {googleReviewCount} Google reviews
                </span>
              ) : null}
              {googleListingUrl ? (
                <a
                  href={googleListingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              authorName={review.authorName}
              authorTitle={review.authorTitle}
              avatar={review.avatar}
              rating={review.rating}
              quote={review.quote}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
