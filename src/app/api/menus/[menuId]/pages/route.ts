import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { Menu } from "@/models/Menu"
import { Page } from "@/models/Page"
import { pageSchema } from "@/lib/validation"
import { parseReorderPayload } from "@/lib/reorder"
import { requireAdmin } from "@/lib/auth-guard"
import {
  created,
  fail,
  handleApiError,
  notFound,
  ok,
  unauthorized,
} from "@/lib/api-response"

type Context = { params: Promise<{ menuId: string }> }

/** GET /api/menus/[menuId]/pages — every page under a menu, drafts included. */
export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { menuId } = await params
    await dbConnect()

    const pages = await Page.find({ menuId }).sort({ order: 1, title: 1 }).lean()

    return ok(
      pages.map((p) => ({
        id: String(p._id),
        menuId: String(p.menuId),
        title: p.title,
        slug: p.slug,
        order: p.order,
        isPublished: p.isPublished,
        updatedAt: p.updatedAt,
      }))
    )
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * PATCH /api/menus/[menuId]/pages — bulk reorder pages within this menu.
 *
 * The menuId filter is not decorative: it stops a payload from reordering
 * pages that belong to a different menu.
 */
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { menuId } = await params

    const body = await request.json().catch(() => null)
    const parsed = parseReorderPayload(body)

    if (!parsed.ok) return fail(parsed.error, 400)

    await dbConnect()

    const result = await Page.bulkWrite(
      parsed.items.map(({ id, order }) => ({
        updateOne: {
          // Scoped to this menu — ids from elsewhere silently match nothing.
          filter: { _id: id, menuId },
          update: { $set: { order } },
        },
      }))
    )

    return ok({ updated: result.modifiedCount })
  } catch (err) {
    return handleApiError(err)
  }
}

/** POST /api/menus/[menuId]/pages — create a page under this menu. */
export async function POST(request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { menuId } = await params

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    // menuId comes from the URL, not the payload — a client must not be able to
    // create a page under a different menu by editing the body.
    const values = await pageSchema.validate(
      { ...body, menuId },
      { abortEarly: false, stripUnknown: true }
    )

    await dbConnect()

    const menuExists = await Menu.exists({ _id: menuId })
    if (!menuExists) return notFound("Menu")

    // Slug is unique per menu, not globally — the same slug may legitimately
    // exist under a different menu. The compound index is the real guarantee.
    const clash = await Page.exists({ menuId, slug: values.slug })
    if (clash) {
      return fail("That slug is already used in this menu.", 409, {
        slug: "Another page in this menu already uses this slug.",
      })
    }

    const page = await Page.create(values)

    return created({
      id: String(page._id),
      menuId: String(page.menuId),
      title: page.title,
      slug: page.slug,
      order: page.order,
      isPublished: page.isPublished,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
