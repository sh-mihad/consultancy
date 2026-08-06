import type { NextRequest } from "next/server"

import { dbConnect } from "@/lib/db"
import { SiteSettings, getSiteSettings, type ISiteSettings } from "@/models/SiteSettings"
import { siteSettingsSchema } from "@/lib/validation"
import { toSettingsInput, toSettingsUpdate } from "@/lib/settings"
import { requireAdmin } from "@/lib/auth-guard"
import { fail, handleApiError, ok, unauthorized } from "@/lib/api-response"

/**
 * The SiteSettings singleton — one document, never more.
 *
 * Both handlers go through findOneAndUpdate({}, …, { upsert: true }). A plain
 * create() on a second save silently produces two config documents and a
 * homepage whose content depends on which one happens to be read first.
 *
 * Public pages don't call this route: they read the singleton server-side
 * through lib/queries.ts, so nothing here needs to be reachable without a
 * session.
 */

/** GET /api/settings — current settings in form shape. */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    await dbConnect()

    // Creates the singleton on first call, so a fresh database still returns
    // a complete object rather than null.
    const doc = await getSiteSettings()

    return ok(toSettingsInput(doc))
  } catch (err) {
    return handleApiError(err)
  }
}

/** PUT /api/settings — upsert the singleton. */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized()

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") return fail("Invalid request body.", 400)

    const values = await siteSettingsSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    await dbConnect()

    const doc = await SiteSettings.findOneAndUpdate(
      {},
      { $set: toSettingsUpdate(values) },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean<ISiteSettings>()

    return ok(toSettingsInput(doc as ISiteSettings))
  } catch (err) {
    return handleApiError(err)
  }
}
