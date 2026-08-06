import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { Menu } from "@/models/Menu"
import { menuSchema } from "@/lib/validation"
import { requireAdmin } from "@/lib/auth-guard"
import { created, fail, handleApiError, ok, unauthorized } from "@/lib/api-response"

/** GET /api/menus — list all menus, including inactive ones (admin view). */
export async function GET() {
  try {
    // Menus drive public navigation, so the list itself isn't secret — but this
    // returns drafts/inactive rows too, which is admin-only information.
    const session = await requireAdmin()
    if (!session) return unauthorized()

    await dbConnect()

    const menus = await Menu.find({}).sort({ order: 1, title: 1 }).lean()

    return ok(
      menus.map((m) => ({
        id: String(m._id),
        title: m.title,
        slug: m.slug,
        order: m.order,
        isActive: m.isActive,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }))
    )
  } catch (err) {
    return handleApiError(err)
  }
}

/**
 * PATCH /api/menus — bulk reorder.
 *
 * Lives here rather than at /api/menus/reorder so it can't be confused with a
 * menu whose id is literally "reorder", and so reordering is one request
 * instead of N.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const body = await request.json().catch(() => null)
    const items = (body as { items?: unknown })?.items

    if (!Array.isArray(items)) {
      return fail("Expected { items: [{ id, order }] }.", 400)
    }

    const updates = items.filter(
      (i): i is { id: string; order: number } =>
        typeof i?.id === "string" &&
        /^[a-f\d]{24}$/i.test(i.id) &&
        Number.isInteger(i?.order)
    )

    if (updates.length !== items.length) {
      return fail("Every item needs a valid id and integer order.", 400)
    }

    await dbConnect()

    // One round trip regardless of how many menus moved.
    await Menu.bulkWrite(
      updates.map(({ id, order }) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order } } },
      }))
    )

    return ok({ updated: updates.length })
  } catch (err) {
    return handleApiError(err)
  }
}

/** POST /api/menus — create a menu. */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    // Same Yup schema the admin form uses. Client validation is a convenience;
    // this is the one that counts.
    const values = await menuSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    await dbConnect()

    // Explicit check for a friendly field-level error. The unique index is
    // still the real guarantee — it catches the race this check cannot.
    const clash = await Menu.exists({ slug: values.slug })
    if (clash) {
      return fail("That slug is already in use.", 409, {
        slug: "Another menu already uses this slug.",
      })
    }

    const menu = await Menu.create(values)

    return created({
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
