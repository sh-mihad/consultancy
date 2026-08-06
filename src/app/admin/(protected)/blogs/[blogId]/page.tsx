import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { dbConnect } from "@/lib/db"
import { Blog } from "@/models/Blog"
import { BlogForm, type ExistingBlog } from "@/components/admin/blog-form"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ blogId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogId } = await params
  await dbConnect()
  const blog = await Blog.findById(blogId).select("title").lean()
  return { title: blog ? `Edit · ${blog.title}` : "Edit post" }
}

export default async function EditBlogPage({ params }: Props) {
  const { blogId } = await params

  await dbConnect()
  const blog = await Blog.findById(blogId).lean()
  if (!blog) notFound()

  const existing: ExistingBlog = {
    id: String(blog._id),
    title: blog.title,
    slug: blog.slug,
    metaTitle: blog.metaTitle ?? "",
    metaDescription: blog.metaDescription ?? "",
    ogImage: blog.ogImage ?? "",
    coverImage: blog.coverImage ?? "",
    content: blog.content ?? "",
    author: blog.author ?? "",
    isPublished: blog.isPublished,
    // <input type="date"> only accepts YYYY-MM-DD.
    publishedAt: blog.publishedAt ? blog.publishedAt.toISOString().slice(0, 10) : "",
  }

  return <BlogForm blog={existing} />
}
