import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { Menu } from "@/models/Menu"
import { Page } from "@/models/Page"
import { menuSchema } from "@/lib/validation"
import { requireAdmin } from "@/lib/auth-guard"
import {
  fail,
  handleApiError,
  notFound,
  ok,
  unauthorized,
} from "@/lib/api-response"

// Next.js 15: route params arrive as a Promise and must be awaited.
type Context = { params: Promise<{ id: string }> }

/** PUT /api/menus/[id] — update a menu. */
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    const values = await menuSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    await dbConnect()

    // Exclude self, or renaming a menu without changing its slug would collide
    // with itself.
    const clash = await Menu.exists({ slug: values.slug, _id: { $ne: id } })
    if (clash) {
      return fail("That slug is already in use.", 409, {
        slug: "Another menu already uses this slug.",
      })
    }

    const menu = await Menu.findByIdAndUpdate(id, values, {
      returnDocument: "after",
      runValidators: true,
    })

    if (!menu) return notFound("Menu")

    return ok({
      id: String(menu._id),
      title: menu.title,
      slug: menu.slug,
      order: menu.order,
      isActive: menu.isActive,
    })
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * DELETE /api/menus/[id]
 *
 * Deleting a menu that still has pages is BLOCKED rather than cascaded.
 *
 * Cascade would silently destroy every page under it — potentially years of
 * written content — behind a single click, with no undo. Blocking makes the
 * admin move or delete the pages first, which is a deliberate act. Deactivating
 * a menu (isActive: false) already covers "hide this from the site", which is
 * what someone usually wants.
 */
export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const { id } = await params

    await dbConnect()

    const pageCount = await Page.countDocuments({ menuId: id })

    if (pageCount > 0) {
      return fail(
        `This menu still has ${pageCount} page${pageCount === 1 ? "" : "s"}. ` +
          `Delete or move them first, or deactivate the menu instead.`,
        409
      )
    }

    const menu = await Menu.findByIdAndDelete(id)
    if (!menu) return notFound("Menu")

    return ok({ id })
  } catch (err) {
    return handleApiError(err)
  }
}
