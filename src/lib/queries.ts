import { dbConnect } from "@/lib/db"
import { Blog } from "@/models/Blog"
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

export type MenuDetail = {
  id: string
  title: string
  slug: string
  pages: {
    title: string
    slug: string
    metaDescription?: string
  }[]
}

export type PageDetail = {
  id: string
  title: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  content: string
  menu: { title: string; slug: string }
  siblings: { title: string; slug: string }[]
  updatedAt: string
}

/**
 * A menu and its published pages, for /[menuSlug].
 * Returns null for an unknown or deactivated menu so the route can 404.
 */
export async function getMenuBySlug(slug: string): Promise<MenuDetail | null> {
  await dbConnect()

  const menu = await Menu.findOne({ slug, isActive: true })
    .select("title slug")
    .lean()

  if (!menu) return null

  const pages = await Page.find({ menuId: menu._id, isPublished: true })
    .sort({ order: 1, title: 1 })
    .select("title slug metaDescription")
    .lean()

  return {
    id: String(menu._id),
    title: menu.title,
    slug: menu.slug,
    pages: pages.map((p) => ({
      title: p.title,
      slug: p.slug,
      metaDescription: p.metaDescription,
    })),
  }
}

/**
 * One published page, for /[menuSlug]/[pageSlug].
 *
 * Resolves the menu first so a page can never be reached through the wrong
 * menu's URL — /taxation/trademark-registration must 404 even though that page
 * exists under a different menu.
 */
export async function getPageBySlug(
  menuSlug: string,
  pageSlug: string
): Promise<PageDetail | null> {
  await dbConnect()

  const menu = await Menu.findOne({ slug: menuSlug, isActive: true })
    .select("title slug")
    .lean()

  if (!menu) return null

  const page = await Page.findOne({
    menuId: menu._id,
    slug: pageSlug,
    isPublished: true,
  }).lean()

  if (!page) return null

  // Sibling pages power the in-page "other services" nav.
  const siblings = await Page.find({
    menuId: menu._id,
    isPublished: true,
    _id: { $ne: page._id },
  })
    .sort({ order: 1, title: 1 })
    .select("title slug")
    .lean()

  return {
    id: String(page._id),
    title: page.title,
    slug: page.slug,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    ogImage: page.ogImage,
    content: page.content ?? "",
    menu: { title: menu.title, slug: menu.slug },
    siblings: siblings.map((s) => ({ title: s.title, slug: s.slug })),
    updatedAt: page.updatedAt.toISOString(),
  }
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

export type BlogCardItem = {
  id: string
  title: string
  slug: string
  excerpt?: string
  coverImage?: string
  author?: string
  publishedAt: string | null
}

export type BlogDetail = BlogCardItem & {
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  content: string
  updatedAt: string
}

export const BLOGS_PER_PAGE = 9

/**
 * Paginated published posts, newest first.
 *
 * The count and the page are fetched together — the listing needs both, and
 * running them sequentially would double the latency for no reason.
 */
export async function getPublishedBlogs(page = 1): Promise<{
  blogs: BlogCardItem[]
  total: number
  totalPages: number
  page: number
}> {
  await dbConnect()

  const filter = { isPublished: true }
  const current = Math.max(1, Math.floor(page) || 1)

  const [total, docs] = await Promise.all([
    Blog.countDocuments(filter),
    Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((current - 1) * BLOGS_PER_PAGE)
      .limit(BLOGS_PER_PAGE)
      .select("-content")
      .lean(),
  ])

  return {
    total,
    page: current,
    totalPages: Math.max(1, Math.ceil(total / BLOGS_PER_PAGE)),
    blogs: docs.map((b) => ({
      id: String(b._id),
      title: b.title,
      slug: b.slug,
      excerpt: b.metaDescription,
      coverImage: b.coverImage,
      author: b.author,
      publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
    })),
  }
}

/** One published post. Returns null for drafts so the route can 404. */
export async function getBlogBySlug(slug: string): Promise<BlogDetail | null> {
  await dbConnect()

  const blog = await Blog.findOne({ slug, isPublished: true }).lean()
  if (!blog) return null

  return {
    id: String(blog._id),
    title: blog.title,
    slug: blog.slug,
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    excerpt: blog.metaDescription,
    ogImage: blog.ogImage,
    coverImage: blog.coverImage,
    content: blog.content ?? "",
    author: blog.author,
    publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
    updatedAt: blog.updatedAt.toISOString(),
  }
}

/** Recent posts excluding one, for the "read next" strip on a post page. */
export async function getRelatedBlogs(
  excludeSlug: string,
  limit = 3
): Promise<BlogCardItem[]> {
  await dbConnect()

  const docs = await Blog.find({ isPublished: true, slug: { $ne: excludeSlug } })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .select("-content")
    .lean()

  return docs.map((b) => ({
    id: String(b._id),
    title: b.title,
    slug: b.slug,
    excerpt: b.metaDescription,
    coverImage: b.coverImage,
    author: b.author,
    publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
  }))
}

/** The SiteSettings singleton, as a plain object. */
export async function getSettings(): Promise<ISiteSettings> {
  await dbConnect()
  return getSiteSettings()
}
