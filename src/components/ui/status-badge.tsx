import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Status = "published" | "draft" | "active" | "inactive" | "read" | "unread"

const STATUS: Record<Status, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-success/10 text-success" },
  draft: { label: "Draft", className: "bg-warning/10 text-warning" },
  active: { label: "Active", className: "bg-success/10 text-success" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  unread: { label: "Unread", className: "bg-primary/10 text-primary" },
  read: { label: "Read", className: "bg-muted text-muted-foreground" },
}

/**
 * One badge for every boolean state in the admin (isPublished, isActive, isRead)
 * so the same state never renders two different ways across screens.
 */
function StatusBadge({
  status,
  className,
  ...props
}: React.ComponentProps<typeof Badge> & { status: Status }) {
  const { label, className: tone } = STATUS[status]

  return (
    <Badge
      data-slot="status-badge"
      data-status={status}
      variant="outline"
      className={cn("border-transparent", tone, className)}
      {...props}
    >
      {label}
    </Badge>
  )
}

export { StatusBadge, type Status }
