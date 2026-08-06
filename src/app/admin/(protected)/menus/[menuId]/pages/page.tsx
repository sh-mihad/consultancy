import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { dbConnect } from "@/lib/db"
import { Menu } from "@/models/Menu"
import { Page } from "@/models/Page"
import { PageHeader } from "@/components/admin/page-header"
import { PagesTable, type PageRow } from "@/components/admin/pages-table"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ menuId: string }> }

// Next 15: params is a Promise here too, not just in route handlers.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { menuId } = await params
  await dbConnect()
  const menu = await Menu.findById(menuId).select("title").lean()
  return { title: menu ? `${menu.title} · Pages` : "Pages" }
}

export default async function MenuPagesPage({ params }: Props) {
  const { menuId } = await params

  await dbConnect()

  const menu = await Menu.findById(menuId).select("title slug").lean()
  if (!menu) notFound()

  const pages = await Page.find({ menuId }).sort({ order: 1, title: 1 }).lean()

  const rows: PageRow[] = pages.map((p) => ({
    id: String(p._id),
    title: p.title,
    slug: p.slug,
    order: p.order,
    isPublished: p.isPublished,
    // Serialized at the boundary — a Date cannot cross into a Client Component.
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <>
      <Link
        href="/admin/menus"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All menus
      </Link>

      <PageHeader
        title={menu.title}
        description={`Pages under this menu. Public URLs start /${menu.slug}/.`}
      />

      <PagesTable pages={rows} menuId={menuId} menuSlug={menu.slug} />
    </>
  )
}
