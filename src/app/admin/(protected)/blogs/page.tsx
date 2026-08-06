import type { Metadata } from "next"

import { dbConnect } from "@/lib/db"
import { Blog } from "@/models/Blog"
import { PageHeader } from "@/components/admin/page-header"
import { BlogsTable, type BlogRow } from "@/components/admin/blogs-table"

export const metadata: Metadata = { title: "Blogs" }
export const dynamic = "force-dynamic"

export default async function AdminBlogsPage() {
  await dbConnect()

  const blogs = await Blog.find({})
    .sort({ publishedAt: -1, createdAt: -1 })
    .select("-content")
    .lean()

  const rows: BlogRow[] = blogs.map((b) => ({
    id: String(b._id),
    title: b.title,
    slug: b.slug,
    author: b.author ?? "",
    isPublished: b.isPublished,
    publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
    updatedAt: b.updatedAt.toISOString(),
  }))

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Posts published at /blogs. A separate content type — blogs never appear under a service menu."
      />
      <BlogsTable blogs={rows} />
    </>
  )
}
