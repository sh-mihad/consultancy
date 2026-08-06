import Link from "next/link"
import type { Metadata } from "next"
import { FileText, Inbox, ListTree, Star } from "lucide-react"

import { auth } from "@/auth"
import { dbConnect } from "@/lib/db"
import { Menu } from "@/models/Menu"
import { Page } from "@/models/Page"
import { Blog } from "@/models/Blog"
import { Review } from "@/models/Review"
import { ContactSubmission } from "@/models/ContactSubmission"
import { PageHeader } from "@/components/admin/page-header"

export const metadata: Metadata = { title: "Dashboard" }

// Counts must reflect the database on every visit, not build time.
export const dynamic = "force-dynamic"

async function getStats() {
  await dbConnect()

  const [menus, pages, publishedPages, blogs, publishedBlogs, reviews, unread] =
    await Promise.all([
      Menu.countDocuments({}),
      Page.countDocuments({}),
      Page.countDocuments({ isPublished: true }),
      Blog.countDocuments({}),
      Blog.countDocuments({ isPublished: true }),
      Review.countDocuments({ isActive: true }),
      ContactSubmission.countDocuments({ isRead: false }),
    ])

  return { menus, pages, publishedPages, blogs, publishedBlogs, reviews, unread }
}

export default async function DashboardPage() {
  const [session, stats] = await Promise.all([auth(), getStats()])

  const cards = [
    {
      label: "Menus",
      value: stats.menus,
      hint: `${stats.pages} page${stats.pages === 1 ? "" : "s"} · ${stats.publishedPages} published`,
      href: "/admin/menus",
      icon: ListTree,
    },
    {
      label: "Blog posts",
      value: stats.blogs,
      hint: `${stats.publishedBlogs} published`,
      href: "/admin/blogs",
      icon: FileText,
    },
    {
      label: "Active reviews",
      value: stats.reviews,
      hint: "Shown on the homepage",
      href: "/admin/reviews",
      icon: Star,
    },
    {
      label: "Unread messages",
      value: stats.unread,
      hint: "From the contact form",
      href: "/admin/submissions",
      icon: Inbox,
    },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session?.user?.name?.split(" ")[0] ?? "Admin"}`}
        description="An overview of the content currently on the site."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, hint, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="card-surface card-hover flex flex-col gap-3 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <span className="font-heading text-3xl font-bold tracking-tight">{value}</span>
            <span className="text-xs text-muted-foreground">{hint}</span>
          </Link>
        ))}
      </div>

      <div className="card-surface p-5">
        <h2 className="font-heading text-base font-semibold">Signed in as</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{session?.user?.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{session?.user?.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium capitalize">{session?.user?.role}</dd>
          </div>
        </dl>
      </div>
    </>
  )
}
