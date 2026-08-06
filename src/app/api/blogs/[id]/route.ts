import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { Blog } from "@/models/Blog"
import { blogSchema } from "@/lib/validation"
import { requireAdmin } from "@/lib/auth-guard"
import {
  fail,
  handleApiError,
  notFound,
  ok,
  unauthorized,
} from "@/lib/api-response"

type Context = { params: Promise<{ id: string }> }

/** GET /api/blogs/[id] — one post, including content, for the editor. */
export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params
    await dbConnect()

    const blog = await Blog.findById(id).lean()
    if (!blog) return notFound("Post")

    return ok({
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
      // Date input wants YYYY-MM-DD.
      publishedAt: blog.publishedAt
        ? blog.publishedAt.toISOString().slice(0, 10)
        : "",
    })
  } catch (err) {
    return handleApiError(err)
  }
}

/** PUT /api/blogs/[id] — update a post. */
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    const values = await blogSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    await dbConnect()

    const existing = await Blog.findById(id).select("publishedAt")
    if (!existing) return notFound("Post")

    // Excluding self so re-saving an unchanged slug isn't a conflict.
    const clash = await Blog.exists({ slug: values.slug, _id: { $ne: id } })
    if (clash) {
      return fail("That slug is already in use.", 409, {
        slug: "Another post already uses this slug.",
      })
    }

    // Stamp a publish date the first time a draft goes live; keep whatever the
    // admin explicitly set otherwise.
    const publishedAt =
      values.publishedAt ??
      (values.isPublished ? (existing.publishedAt ?? new Date()) : null)

    const blog = await Blog.findByIdAndUpdate(
      id,
      { ...values, publishedAt },
      { returnDocument: "after", runValidators: true }
    )
    if (!blog) return notFound("Post")

    return ok({
      id: String(blog._id),
      title: blog.title,
      slug: blog.slug,
      isPublished: blog.isPublished,
    })
  } catch (err) {
    return handleApiError(err)
  }
}

/** DELETE /api/blogs/[id] */
export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params
    await dbConnect()

    const blog = await Blog.findByIdAndDelete(id)
    if (!blog) return notFound("Post")

    return ok({ id })
  } catch (err) {
    return handleApiError(err)
  }
}
