import type { Metadata } from "next"

import { dbConnect } from "@/lib/db"
import { Review } from "@/models/Review"
import { PageHeader } from "@/components/admin/page-header"
import { ReviewsTable } from "@/components/admin/reviews-table"
import type { ReviewRow } from "@/components/admin/review-dialog"

export const metadata: Metadata = { title: "Reviews" }
export const dynamic = "force-dynamic"

/**
 * Reviews are managed entirely from this one route — create, edit and delete
 * all happen in a modal. There is deliberately no /admin/reviews/[id] detail
 * page: seven short fields don't warrant one (convention 9).
 */
export default async function AdminReviewsPage() {
  await dbConnect()

  const reviews = await Review.find({}).sort({ order: 1, createdAt: -1 }).lean()

  const rows: ReviewRow[] = reviews.map((r) => ({
    id: String(r._id),
    authorName: r.authorName,
    authorTitle: r.authorTitle ?? "",
    avatar: r.avatar ?? "",
    rating: r.rating,
    quote: r.quote,
    order: r.order,
    isActive: r.isActive,
  }))

  const active = rows.filter((r) => r.isActive).length

  return (
    <>
      <PageHeader
        title="Reviews"
        description={`Customer testimonials for the homepage. ${active} of ${rows.length} currently visible. Drag to reorder.`}
      />
      <ReviewsTable reviews={rows} />
    </>
  )
}
