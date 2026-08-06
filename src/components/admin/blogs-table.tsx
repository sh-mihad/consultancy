"use client"

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

export type BlogRow = {
  id: string
  title: string
  slug: string
  author: string
  isPublished: boolean
  publishedAt: string | null
  updatedAt: string
}

export function BlogsTable({ blogs }: { blogs: BlogRow[] }) {
  const router = useRouter()

  async function remove(blog: BlogRow) {
    const res = await fetch(`/api/blogs/${blog.id}`, { method: "DELETE" })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      toast.error(json?.error ?? "Could not delete post.")
      return
    }

    toast.success(`“${blog.title}” deleted`)
    router.refresh()
  }

  const columns: ColumnDef<BlogRow>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link
            href={`/admin/blogs/${row.original.id}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {row.original.title}
          </Link>
          <div className="text-xs text-muted-foreground">
            <code>/blogs/{row.original.slug}</code>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.author || "—"}
        </span>
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
      accessorKey: "publishedAt",
      header: "Published",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.publishedAt ? formatDate(row.original.publishedAt) : "—"}
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
                href={`/blogs/${row.original.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${row.original.title}`}
              >
                <ExternalLink />
              </a>
            </Button>
          ) : null}
          <Button variant="outline" size="icon-sm" asChild>
            <Link href={`/admin/blogs/${row.original.id}`} aria-label={`Edit ${row.original.title}`}>
              <Pencil />
            </Link>
          </Button>
          <ConfirmDialog
            title={`Delete “${row.original.title}”?`}
            description="This post and its content will be permanently removed. This cannot be undone."
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
      data={blogs}
      searchColumn="title"
      searchPlaceholder="Search posts…"
      emptyTitle="No posts yet"
      emptyDescription="Blog posts appear at /blogs and are separate from the service menus."
      emptyAction={
        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus /> New post
          </Link>
        </Button>
      }
      toolbar={
        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus /> New post
          </Link>
        </Button>
      }
    />
  )
}
