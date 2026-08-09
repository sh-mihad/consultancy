import { ArrowUpRight } from "lucide-react"

import { Rating, ReviewCard } from "@/components/public/review-card"
import type { ReviewItem } from "@/lib/queries"
import type { ISiteSettings } from "@/models/SiteSettings"

/**
 * Customer testimonials — homepage only.
 *
 * These are admin-entered, not pulled from the Google Places API. The rating
 * figure below is a manually maintained number from SiteSettings that links out
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
    <section className="section">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            {section.eyebrow ? <p className="eyebrow mb-5">{section.eyebrow}</p> : null}
            <h2 className="heading-2 text-balance">{section.heading}</h2>
            {section.description ? (
              <p className="lead mt-5">{section.description}</p>
            ) : null}

            {googleRatingValue ? (
              <div className="mt-9 border-t pt-6">
                <div className="flex items-center gap-4">
                  <span className="font-heading text-4xl leading-none font-medium tabular-nums">
                    {googleRatingValue.toFixed(1)}
                  </span>
                  <div>
                    <Rating value={googleRatingValue} />
                    {googleReviewCount ? (
                      <p className="label-field mt-2">
                        {googleReviewCount} Google reviews
                      </p>
                    ) : null}
                  </div>
                </div>

                {googleListingUrl ? (
                  <a
                    href={googleListingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-navy-light"
                  >
                    Read them on Google
                    <ArrowUpRight
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-x-12 gap-y-12 lg:col-span-8 sm:grid-cols-2">
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
