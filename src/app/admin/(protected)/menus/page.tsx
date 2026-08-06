import type { Metadata } from "next"

import { dbConnect } from "@/lib/db"
import { Menu } from "@/models/Menu"
import { Page } from "@/models/Page"
import { PageHeader } from "@/components/admin/page-header"
import { MenusTable } from "@/components/admin/menus-table"
import type { MenuRow } from "@/components/admin/menu-dialog"

export const metadata: Metadata = { title: "Menus" }

// Reflects the database on every visit — an admin who just saved must see it.
export const dynamic = "force-dynamic"

async function getMenus(): Promise<MenuRow[]> {
  await dbConnect()

  const menus = await Menu.find({}).sort({ order: 1, title: 1 }).lean()

  // One aggregate for all counts rather than a countDocuments per menu.
  const counts = await Page.aggregate<{ _id: unknown; count: number }>([
    { $group: { _id: "$menuId", count: { $sum: 1 } } },
  ])
  const countByMenu = new Map(counts.map((c) => [String(c._id), c.count]))

  return menus.map((m) => ({
    id: String(m._id),
    title: m.title,
    slug: m.slug,
    order: m.order,
    isActive: m.isActive,
    pageCount: countByMenu.get(String(m._id)) ?? 0,
  }))
}

export default async function AdminMenusPage() {
  const menus = await getMenus()

  return (
    <>
      <PageHeader
        title="Menus & pages"
        description="Top-level service categories. These drive the public navigation and the homepage services grid."
      />

      {/* List stays a Server Component; only the table/dialog are client. */}
      <MenusTable menus={menus} />
    </>
  )
}
