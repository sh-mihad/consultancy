"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { ChevronDown, ChevronUp, FileText, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { DataTable } from "@/components/admin/data-table"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { MenuDialog, type MenuRow } from "@/components/admin/menu-dialog"

export function MenusTable({ menus }: { menus: MenuRow[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<MenuRow | null>(null)
  const [reordering, setReordering] = React.useState(false)

  // Sorted copy drives the up/down buttons; the table may sort differently for
  // display without changing what "move up" means.
  const ordered = React.useMemo(
    () => [...menus].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    [menus]
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(menu: MenuRow) {
    setEditing(menu)
    setDialogOpen(true)
  }

  async function move(menu: MenuRow, direction: -1 | 1) {
    const index = ordered.findIndex((m) => m.id === menu.id)
    const swapWith = ordered[index + direction]
    if (!swapWith) return

    setReordering(true)
    try {
      // Swap the two order values and send both in one request.
      const res = await fetch("/api/menus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { id: menu.id, order: swapWith.order },
            { id: swapWith.id, order: menu.order },
          ],
        }),
      })
      const json = await res.json().catch(() => null)

      if (!res.ok || !json?.success) {
        toast.error(json?.error ?? "Could not reorder.")
        return
      }
      router.refresh()
    } finally {
      setReordering(false)
    }
  }

  async function remove(menu: MenuRow) {
    const res = await fetch(`/api/menus/${menu.id}`, { method: "DELETE" })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      // The common case is a 409 because pages still exist — show the server's
      // message, which names the count.
      toast.error(json?.error ?? "Could not delete menu.")
      return
    }

    toast.success(`“${menu.title}” deleted`)
    router.refresh()
  }

  const columns: ColumnDef<MenuRow>[] = [
    {
      id: "reorder",
      header: "",
      enableSorting: false,
      size: 60,
      cell: ({ row }) => {
        const index = ordered.findIndex((m) => m.id === row.original.id)
        return (
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Move ${row.original.title} up`}
              disabled={index <= 0 || reordering}
              onClick={() => move(row.original, -1)}
            >
              <ChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Move ${row.original.title} down`}
              disabled={index >= ordered.length - 1 || reordering}
              onClick={() => move(row.original, 1)}
            >
              <ChevronDown />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <code className="text-xs text-muted-foreground">/{row.original.slug}</code>
        </div>
      ),
    },
    {
      accessorKey: "pageCount",
      header: "Pages",
      cell: ({ row }) => (
        <Link
          href={`/admin/menus/${row.original.id}/pages`}
          className="inline-flex items-center gap-1.5 text-sm hover:text-primary hover:underline"
        >
          <FileText className="size-3.5" aria-hidden="true" />
          {row.original.pageCount}
        </Link>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/menus/${row.original.id}/pages`}>Pages</Link>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Edit ${row.original.title}`}
            onClick={() => openEdit(row.original)}
          >
            <Pencil />
          </Button>
          <ConfirmDialog
            title={`Delete “${row.original.title}”?`}
            description={
              row.original.pageCount > 0
                ? `This menu has ${row.original.pageCount} page(s). Menus with pages cannot be deleted — move or delete the pages first, or deactivate the menu instead.`
                : "This menu will be removed from the site navigation. This cannot be undone."
            }
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
    <>
      <DataTable
        columns={columns}
        data={ordered}
        searchColumn="title"
        searchPlaceholder="Search menus…"
        emptyTitle="No menus yet"
        emptyDescription="Menus are the top-level service categories in your navigation."
        emptyAction={
          <Button onClick={openCreate}>
            <Plus /> New menu
          </Button>
        }
        toolbar={
          <Button onClick={openCreate}>
            <Plus /> New menu
          </Button>
        }
      />

      <MenuDialog open={dialogOpen} onOpenChange={setDialogOpen} menu={editing} />
    </>
  )
}
