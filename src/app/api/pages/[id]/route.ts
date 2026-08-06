import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { Page } from "@/models/Page"
import { pageSchema } from "@/lib/validation"
import { requireAdmin } from "@/lib/auth-guard"
import {
  fail,
  handleApiError,
  notFound,
  ok,
  unauthorized,
} from "@/lib/api-response"

type Context = { params: Promise<{ id: string }> }

/** GET /api/pages/[id] — one page, including its content. */
export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params
    await dbConnect()

    const page = await Page.findById(id).lean()
    if (!page) return notFound("Page")

    return ok({
      id: String(page._id),
      menuId: String(page.menuId),
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle ?? "",
      metaDescription: page.metaDescription ?? "",
      ogImage: page.ogImage ?? "",
      content: page.content ?? "",
      order: page.order,
      isPublished: page.isPublished,
    })
  } catch (err) {
    return handleApiError(err)
  }
}

/** PUT /api/pages/[id] — update a page. */
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    await dbConnect()

    const existing = await Page.findById(id).select("menuId")
    if (!existing) return notFound("Page")

    // Reuse the page's own menuId rather than trusting the payload — moving a
    // page between menus is not something this endpoint offers.
    const values = await pageSchema.validate(
      { ...body, menuId: String(existing.menuId) },
      { abortEarly: false, stripUnknown: true }
    )

    // Excluding self matters: re-saving without changing the slug must not
    // collide with the row being saved.
    const clash = await Page.exists({
      menuId: existing.menuId,
      slug: values.slug,
      _id: { $ne: id },
    })
    if (clash) {
      return fail("That slug is already used in this menu.", 409, {
        slug: "Another page in this menu already uses this slug.",
      })
    }

    const page = await Page.findByIdAndUpdate(id, values, {
      returnDocument: "after",
      runValidators: true,
    })
    if (!page) return notFound("Page")

    return ok({
      id: String(page._id),
      menuId: String(page.menuId),
      title: page.title,
      slug: page.slug,
      isPublished: page.isPublished,
    })
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * DELETE /api/pages/[id]
 *
 * Unlike menus, a page owns nothing else, so deleting it orphans nothing and is
 * allowed outright. The confirmation lives in the UI.
 */
export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params
    await dbConnect()

    const page = await Page.findByIdAndDelete(id)
    if (!page) return notFound("Page")

    return ok({ id })
  } catch (err) {
    return handleApiError(err)
  }
}
