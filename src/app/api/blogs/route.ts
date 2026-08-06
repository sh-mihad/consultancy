import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { Blog } from "@/models/Blog"
import { blogSchema } from "@/lib/validation"
import { requireAdmin } from "@/lib/auth-guard"
import { created, fail, handleApiError, ok, unauthorized } from "@/lib/api-response"

/** GET /api/blogs — admin list, drafts included. */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    await dbConnect()

    const blogs = await Blog.find({})
      .sort({ publishedAt: -1, createdAt: -1 })
      // Content is large and the list never shows it.
      .select("-content")
      .lean()

    return ok(
      blogs.map((b) => ({
        id: String(b._id),
        title: b.title,
        slug: b.slug,
        author: b.author ?? "",
        isPublished: b.isPublished,
        publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
        updatedAt: b.updatedAt.toISOString(),
      }))
    )
  } catch (err) {
    return handleApiError(err)
  }
}

/** POST /api/blogs — create a post. Slug is unique globally, unlike pages. */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    const values = await blogSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    await dbConnect()

    const clash = await Blog.exists({ slug: values.slug })
    if (clash) {
      return fail("That slug is already in use.", 409, {
        slug: "Another post already uses this slug.",
      })
    }

    // Publishing without a date would leave the post unsortable and undated on
    // the public listing, so stamp it now.
    //
    // Yup types the field as nullable, but Mongoose wants Date | undefined —
    // null would be a cast error rather than "no value".
    const publishedAt =
      values.isPublished && !values.publishedAt
        ? new Date()
        : (values.publishedAt ?? undefined)

    const blog = await Blog.create({ ...values, publishedAt })

    return created({
      id: String(blog._id),
      title: blog.title,
      slug: blog.slug,
      isPublished: blog.isPublished,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
