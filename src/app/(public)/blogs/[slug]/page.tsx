import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { ArrowLeft, CalendarDays, Home, User } from "lucide-react"

import { getBlogBySlug, getRelatedBlogs } from "@/lib/queries"
import { buildMetadata } from "@/lib/metadata"
import { sanitizeHtml } from "@/lib/sanitize"
import { formatDate, toDateTimeAttr } from "@/lib/format"
import { BlogCard } from "@/components/public/blog-card"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) return { title: "Not found" }

  return buildMetadata({
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription,
    path: `/blogs/${blog.slug}`,
    // Blogs get an extra fallback rung: ogImage -> coverImage -> site default.
    image: blog.ogImage,
    fallbackImage: blog.coverImage,
    type: "article",
    publishedTime: blog.publishedAt ?? undefined,
    modifiedTime: blog.updatedAt,
  })
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  // Drafts return null from the query, so they 404 rather than leak.
  if (!blog) notFound()

  const related = await getRelatedBlogs(slug, 3)
  const html = sanitizeHtml(blog.content)

  return (
    <>
      <section className="border-b bg-muted">
        <div className="container-x py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="inline-flex items-center gap-1 hover:text-primary">
                  <Home className="size-3.5" aria-hidden="true" />
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blogs" className="hover:text-primary">
                  Insights
                </Link>
              </li>
            </ol>
          </nav>

          <h1 className="heading-1 max-w-4xl text-balance">{blog.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {blog.author ? (
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5" aria-hidden="true" />
                {blog.author}
              </span>
            ) : null}
            {blog.publishedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                <time dateTime={toDateTimeAttr(blog.publishedAt)}>
                  {formatDate(blog.publishedAt)}
                </time>
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <article className="section">
        <div className="container-x">
          {blog.coverImage ? (
            <div className="relative mx-auto mb-10 aspect-video max-w-4xl overflow-hidden rounded-2xl border">
              <Image
                src={blog.coverImage}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 56rem"
                className="object-cover"
              />
            </div>
          ) : null}

          <div
            className="prose-content mx-auto max-w-3xl"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mx-auto mt-12 max-w-3xl border-t pt-8">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All insights
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="section-alt">
          <div className="container-x">
            <h2 className="heading-3 mb-6">Read next</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogCard
                  key={item.id}
                  href={`/blogs/${item.slug}`}
                  title={item.title}
                  excerpt={item.excerpt}
                  coverImage={item.coverImage}
                  author={item.author}
                  publishedAt={item.publishedAt}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
