import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { dbConnect } from "@/lib/db"
import { Menu } from "@/models/Menu"
import { PageForm } from "@/components/admin/page-form"

export const metadata: Metadata = { title: "New page" }

/**
 * Static "new" segment sits alongside the dynamic [pageId] segment. Next.js
 * resolves static routes first, so /pages/new reaches this file rather than
 * being treated as a page whose id is the string "new".
 */
export default async function NewPagePage({
  params,
}: {
  params: Promise<{ menuId: string }>
}) {
  const { menuId } = await params

  await dbConnect()
  const menu = await Menu.findById(menuId).select("title slug").lean()
  if (!menu) notFound()

  return <PageForm menuId={menuId} menuSlug={menu.slug} menuTitle={menu.title} />
}
