import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { dbConnect } from "@/lib/db"
import { Menu } from "@/models/Menu"
import { Page } from "@/models/Page"
import { PageForm, type ExistingPage } from "@/components/admin/page-form"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ menuId: string; pageId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageId } = await params
  await dbConnect()
  const page = await Page.findById(pageId).select("title").lean()
  return { title: page ? `Edit · ${page.title}` : "Edit page" }
}

export default async function EditPagePage({ params }: Props) {
  const { menuId, pageId } = await params

  await dbConnect()

  const [menu, page] = await Promise.all([
    Menu.findById(menuId).select("title slug").lean(),
    Page.findById(pageId).lean(),
  ])

  if (!menu || !page) notFound()

  // Guard against a page id from a different menu being loaded through this
  // menu's URL — the breadcrumbs and slug preview would silently lie.
  if (String(page.menuId) !== menuId) notFound()

  const existing: ExistingPage = {
    id: String(page._id),
    title: page.title,
    slug: page.slug,
    metaTitle: page.metaTitle ?? "",
    metaDescription: page.metaDescription ?? "",
    ogImage: page.ogImage ?? "",
    content: page.content ?? "",
    order: page.order,
    isPublished: page.isPublished,
  }

  return (
    <PageForm
      menuId={menuId}
      menuSlug={menu.slug}
      menuTitle={menu.title}
      page={existing}
    />
  )
}
