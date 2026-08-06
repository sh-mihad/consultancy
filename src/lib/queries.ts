import { dbConnect } from "@/lib/db"
import { Menu } from "@/models/Menu"
import { Page } from "@/models/Page"
import { Review } from "@/models/Review"
import { getSiteSettings, type ISiteSettings } from "@/models/SiteSettings"

/**
 * Read-side queries for public pages.
 *
 * Everything here returns plain, serializable objects — ObjectIds and Dates are
 * converted at the boundary so results can cross into Client Components without
 * "Only plain objects can be passed to Client Components" errors.
 *
 * Every query filters on published/active state. A public page must never be
 * able to surface a draft.
 */

export type NavPage = { title: string; slug: string }
export type NavMenu = { title: string; slug: string; pages: NavPage[] }

export type ReviewItem = {
  id: string
  authorName: string
  authorTitle?: string
  avatar?: string
  rating: number
  quote: string
}

/**
 * Navigation tree: active menus with their published pages.
 *
 * One query per collection rather than a per-menu lookup, so the navbar costs
 * two round trips regardless of how many services exist.
 */
export async function getNavigation(): Promise<NavMenu[]> {
  await dbConnect()

  const menus = await Menu.find({ isActive: true })
    .sort({ order: 1, title: 1 })
    .select("title slug")
    .lean()

  if (menus.length === 0) return []

  const pages = await Page.find({
    menuId: { $in: menus.map((m) => m._id) },
    isPublished: true,
  })
    .sort({ order: 1, title: 1 })
    .select("menuId title slug")
    .lean()

  const byMenu = new Map<string, NavPage[]>()
  for (const page of pages) {
    const key = String(page.menuId)
    const list = byMenu.get(key)
    const entry = { title: page.title, slug: page.slug }
    if (list) list.push(entry)
    else byMenu.set(key, [entry])
  }

  return menus.map((menu) => ({
    title: menu.title,
    slug: menu.slug,
    pages: byMenu.get(String(menu._id)) ?? [],
  }))
}

/** Active testimonials for the homepage. Nowhere else renders these. */
export async function getActiveReviews(limit = 6): Promise<ReviewItem[]> {
  await dbConnect()

  const reviews = await Review.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .limit(limit)
    .lean()

  return reviews.map((r) => ({
    id: String(r._id),
    authorName: r.authorName,
    authorTitle: r.authorTitle,
    avatar: r.avatar,
    rating: r.rating,
    quote: r.quote,
  }))
}

/** The SiteSettings singleton, as a plain object. */
export async function getSettings(): Promise<ISiteSettings> {
  await dbConnect()
  return getSiteSettings()
}
