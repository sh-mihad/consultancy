"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTable } from "@/components/admin/data-table"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { ReviewDialog, type ReviewRow } from "@/components/admin/review-dialog"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ReviewRow | null>(null)

  const ordered = React.useMemo(
    () => [...reviews].sort((a, b) => a.order - b.order),
    [reviews]
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(review: ReviewRow) {
    setEditing(review)
    setDialogOpen(true)
  }

  /** Same contract as menus and pages — dense 0..n-1, rollback on failure. */
  async function persistOrder(orderedIds: string[]): Promise<boolean> {
    const res = await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: orderedIds.map((id, index) => ({ id, order: index })) }),
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

  async function remove(review: ReviewRow) {
    const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      toast.error(json?.error ?? "Could not delete review.")
      return
    }

    toast.success(`Review from ${review.authorName} deleted`)
    router.refresh()
  }

  const columns: ColumnDef<ReviewRow>[] = [
    {
      accessorKey: "authorName",
      header: "Author",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0">
            {row.original.avatar ? (
              <AvatarImage src={row.original.avatar} alt="" />
            ) : null}
            <AvatarFallback className="bg-primary/5 text-xs font-semibold text-primary">
              {initials(row.original.authorName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium">{row.original.authorName}</div>
            {row.original.authorTitle ? (
              <div className="truncate text-xs text-muted-foreground">
                {row.original.authorTitle}
              </div>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "quote",
      header: "Quote",
      cell: ({ row }) => (
        <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">
          {row.original.quote}
        </p>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div
          className="flex items-center gap-0.5"
          role="img"
          aria-label={`${row.original.rating} out of 5`}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              aria-hidden="true"
              className={cn(
                "size-3.5",
                i < row.original.rating
                  ? "fill-accent text-accent"
                  : "fill-muted text-muted-foreground/30"
              )}
            />
          ))}
        </div>
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
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Edit review from ${row.original.authorName}`}
            onClick={() => openEdit(row.original)}
          >
            <Pencil />
          </Button>
          <ConfirmDialog
            title={`Delete review from ${row.original.authorName}?`}
            description="It will be removed from the homepage permanently. To hide it without losing it, edit the review and switch it to inactive instead."
            onConfirm={() => remove(row.original)}
          >
            <Button
              variant="destructive"
              size="icon-sm"
              aria-label={`Delete review from ${row.original.authorName}`}
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
        getRowId={(row) => row.id}
        onReorder={persistOrder}
        reorderLabel={(row) => `review from ${row.authorName}`}
        searchColumn="authorName"
        searchPlaceholder="Search by author…"
        emptyTitle="No reviews yet"
        emptyDescription="Testimonials you add appear in the Customer Review section of the homepage."
        emptyAction={
          <Button onClick={openCreate}>
            <Plus /> Add review
          </Button>
        }
        toolbar={
          <Button onClick={openCreate}>
            <Plus /> Add review
          </Button>
        }
      />

      <ReviewDialog open={dialogOpen} onOpenChange={setDialogOpen} review={editing} />
    </>
  )
}
