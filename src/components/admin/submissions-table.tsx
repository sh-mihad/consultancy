"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { DataTable } from "@/components/admin/data-table"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import {
  SubmissionDialog,
  type SubmissionRow,
} from "@/components/admin/submission-dialog"
import { formatDateTime, toDateTimeAttr } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Contact form inbox. Read-only apart from the read flag and deletion — a
 * submission is a record of what someone actually sent, so nothing here edits
 * its contents.
 *
 * No drag-to-reorder: the order is "newest first" and isn't the admin's to set.
 */
export function SubmissionsTable({ submissions }: { submissions: SubmissionRow[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [viewing, setViewing] = React.useState<SubmissionRow | null>(null)

  function view(submission: SubmissionRow) {
    setViewing(submission)
    setOpen(true)
  }

  async function remove(submission: SubmissionRow) {
    const res = await fetch(`/api/submissions/${submission.id}`, { method: "DELETE" })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      toast.error(json?.error ?? "Could not delete the message.")
      return
    }

    toast.success(`Message from ${submission.name} deleted`)
    router.refresh()
  }

  const columns: ColumnDef<SubmissionRow>[] = [
    {
      accessorKey: "name",
      header: "From",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div
            className={cn(
              "truncate",
              row.original.isRead ? "font-medium" : "font-semibold"
            )}
          >
            {row.original.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Message",
      cell: ({ row }) => (
        <div className="max-w-md min-w-0">
          <div className="truncate text-sm font-medium">
            {row.original.subject || "No subject"}
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {row.original.message}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Received",
      cell: ({ row }) => (
        <time
          dateTime={toDateTimeAttr(row.original.createdAt)}
          className="text-sm whitespace-nowrap text-muted-foreground"
        >
          {formatDateTime(row.original.createdAt)}
        </time>
      ),
    },
    {
      accessorKey: "isRead",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.isRead ? "read" : "unread"} />
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
            aria-label={`Read message from ${row.original.name}`}
            onClick={() => view(row.original)}
          >
            <Eye />
          </Button>
          <ConfirmDialog
            title={`Delete the message from ${row.original.name}?`}
            description="The message will be removed permanently. There is no archive to recover it from."
            onConfirm={() => remove(row.original)}
          >
            <Button
              variant="destructive"
              size="icon-sm"
              aria-label={`Delete message from ${row.original.name}`}
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
        data={submissions}
        searchColumn="name"
        searchPlaceholder="Search by sender…"
        emptyTitle="No messages yet"
        emptyDescription="Enquiries sent through the contact form on the homepage land here."
      />

      <SubmissionDialog open={open} onOpenChange={setOpen} submission={viewing} />
    </>
  )
}
