"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { DataTable } from "@/components/admin/data-table"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { formatDate } from "@/lib/format"

export type PageRow = {
  id: string
  title: string
  slug: string
  order: number
  isPublished: boolean
  updatedAt: string
}

export function PagesTable({
  pages,
  menuId,
  menuSlug,
}: {
  pages: PageRow[]
  menuId: string
  menuSlug: string
}) {
  const router = useRouter()

  /**
   * Scoped to this menu's endpoint, so a reorder can only ever touch pages
   * inside the menu currently being viewed.
   */
  async function persistOrder(orderedIds: string[]): Promise<boolean> {
    const res = await fetch(`/api/menus/${menuId}/pages`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: orderedIds.map((id, index) => ({ id, order: index })),
      }),
    })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      toast.error(json?.error ?? "Could not save the new order.")
      return false
    }

    toast.success("Order saved")
    router.refresh()
    return true
  }

  async function remove(page: PageRow) {
    const res = await fetch(`/api/pages/${page.id}`, { method: "DELETE" })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      toast.error(json?.error ?? "Could not delete page.")
      return
    }

    toast.success(`“${page.title}” deleted`)
    router.refresh()
  }

  const newHref = `/admin/menus/${menuId}/pages/new`

  const columns: ColumnDef<PageRow>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link
            href={`/admin/menus/${menuId}/pages/${row.original.id}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {row.original.title}
          </Link>
          <div className="text-xs text-muted-foreground">
            <code>
              /{menuSlug}/{row.original.slug}
            </code>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.isPublished ? "published" : "draft"} />
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          {row.original.isPublished ? (
            <Button variant="ghost" size="icon-sm" asChild>
              <a
                href={`/${menuSlug}/${row.original.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${row.original.title}`}
              >
                <ExternalLink />
              </a>
            </Button>
          ) : null}
          <Button variant="outline" size="icon-sm" asChild>
            <Link
              href={`/admin/menus/${menuId}/pages/${row.original.id}`}
              aria-label={`Edit ${row.original.title}`}
            >
              <Pencil />
            </Link>
          </Button>
          <ConfirmDialog
            title={`Delete “${row.original.title}”?`}
            description="This page and its content will be permanently removed. This cannot be undone."
            onConfirm={() => remove(row.original)}
          >
            <Button
              variant="destructive"
              size="icon-sm"
              aria-label={`Delete ${row.original.title}`}
            >
              <Trash2 />
            </Button>
          </ConfirmDialog>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={pages}
      getRowId={(row) => row.id}
      onReorder={persistOrder}
      reorderLabel={(row) => row.title}
      searchColumn="title"
      searchPlaceholder="Search pages…"
      emptyTitle="No pages in this menu yet"
      emptyDescription="Pages are the individual service pages shown under this category."
      emptyAction={
        <Button asChild>
          <Link href={newHref}>
            <Plus /> New page
          </Link>
        </Button>
      }
      toolbar={
        <Button asChild>
          <Link href={newHref}>
            <Plus /> New page
          </Link>
        </Button>
      }
    />
  )
}
