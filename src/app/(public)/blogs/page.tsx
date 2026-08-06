import type { Metadata } from "next"

import { getPublishedBlogs } from "@/lib/queries"
import { buildMetadata } from "@/lib/metadata"
import { BlogCard } from "@/components/public/blog-card"
import { Pagination } from "@/components/public/pagination"
import { EmptyState } from "@/components/ui/empty-state"

type Props = { searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams
  const current = Number(page) || 1

  return buildMetadata({
    title: current > 1 ? `Insights — page ${current}` : "Insights",
    description:
      "Practical guidance on company formation, trademarks, tax and foreign investment in Bangladesh.",
    path: current > 1 ? `/blogs?page=${current}` : "/blogs",
  })
}

/**
 * Paginated blog listing.
 *
 * `/blogs` is a static segment, so it takes precedence over the sibling
 * `/[menuSlug]` dynamic route — a menu could never shadow it.
 */
export default async function BlogsPage({ searchParams }: Props) {
  const { page } = await searchParams
  const { blogs, totalPages, page: current, total } = await getPublishedBlogs(
    Number(page) || 1
  )

  return (
    <>
      <section className="border-b bg-muted">
        <div className="container-x py-12 md:py-16">
          <p className="eyebrow mb-3">Insights</p>
          <h1 className="heading-1 text-balance">Guidance from our advisors</h1>
          <p className="lead mt-4 max-w-2xl">
            Practical notes on company formation, trademarks, tax and foreign investment —
            written by the people who file the paperwork.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          {blogs.length === 0 ? (
            <EmptyState
              title="No posts published yet"
              description="We're working on the first articles. Check back shortly."
            />
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {total} {total === 1 ? "article" : "articles"}
                {totalPages > 1 ? ` · page ${current} of ${totalPages}` : null}
              </p>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    title={blog.title}
                    excerpt={blog.excerpt}
                    coverImage={blog.coverImage}
                    author={blog.author}
                    publishedAt={blog.publishedAt}
                  />
                ))}
              </div>

              <div className="mt-12">
                <Pagination
                  currentPage={current}
                  totalPages={totalPages}
                  basePath="/blogs"
                />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
