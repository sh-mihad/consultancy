import slugifyLib from "slugify"

import type { Model } from "mongoose"

/**
 * Title -> URL slug. Admins may override the result before saving, so this is
 * only ever a starting suggestion — never silently re-derive a slug the admin
 * has already set.
 */
export function slugify(input: string): string {
  return slugifyLib(input, {
    lower: true,
    strict: true, // drop characters that aren't [a-z0-9-]
    trim: true,
  })
}

/** Matches the slug shape we accept on input. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Finds a free slug by appending -2, -3, … Used by the seed script and as a
 * convenience in the admin; route handlers still reject duplicates outright
 * rather than silently renaming what the admin typed.
 */
export async function uniqueSlug(
  model: Model<Record<string, unknown>>,
  base: string,
  extraFilter: Record<string, unknown> = {},
  excludeId?: string
): Promise<string> {
  const root = slugify(base) || "item"
  let candidate = root

  for (let n = 2; ; n++) {
    const filter: Record<string, unknown> = { ...extraFilter, slug: candidate }
    if (excludeId) filter._id = { $ne: excludeId }

    const clash = await model.exists(filter)
    if (!clash) return candidate

    candidate = `${root}-${n}`
  }
}
