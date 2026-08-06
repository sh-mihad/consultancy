"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Mail, MailOpen, Phone } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatDateTime, toDateTimeAttr } from "@/lib/format"

export type SubmissionRow = {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

/**
 * Read-only view of one contact submission (convention 9 — a short message
 * doesn't earn a route). Nothing here is editable; the only thing that changes
 * is the read flag.
 *
 * Opening an unread message marks it read, the way every inbox behaves. The
 * footer toggle puts it back, so the flag stays under the admin's control.
 */
export function SubmissionDialog({
  open,
  onOpenChange,
  submission,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: SubmissionRow | null
}) {
  const router = useRouter()

  // Mirrors the server value so the badge and the toggle update immediately —
  // router.refresh() re-renders the list underneath, but the open dialog is
  // still holding the row object it was given.
  const [isRead, setIsRead] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  const setRead = React.useCallback(
    async (next: boolean) => {
      if (!submission) return

      setIsRead(next)
      setPending(true)

      try {
        const res = await fetch(`/api/submissions/${submission.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: next }),
        })
        const json = await res.json().catch(() => null)

        if (!res.ok || !json?.success) {
          setIsRead(!next) // roll back
          toast.error(json?.error ?? "Could not update the message.")
          return
        }

        router.refresh()
      } finally {
        setPending(false)
      }
    },
    [submission, router]
  )

  // Re-sync on open, and auto-mark an unread message as read.
  React.useEffect(() => {
    if (!open || !submission) return

    setIsRead(submission.isRead)
    if (!submission.isRead) void setRead(true)
  }, [open, submission, setRead])

  if (!submission) return null

  const replyHref = `mailto:${submission.email}?subject=${encodeURIComponent(
    submission.subject ? `Re: ${submission.subject}` : "Re: your enquiry"
  )}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-8">
            {submission.subject || "No subject"}
          </DialogTitle>
          <DialogDescription>
            From {submission.name} ·{" "}
            <time dateTime={toDateTimeAttr(submission.createdAt)}>
              {formatDateTime(submission.createdAt)}
            </time>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={isRead ? "read" : "unread"} />
            <a
              href={`mailto:${submission.email}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              {submission.email}
            </a>
            {submission.phone ? (
              <a
                href={`tel:${submission.phone}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Phone className="size-3.5" aria-hidden="true" />
                {submission.phone}
              </a>
            ) : null}
          </div>

          {/*
            Visitor-authored plain text. Rendered as text, never as HTML —
            whitespace-pre-line keeps the line breaks the sender typed without
            handing them a markup channel.
          */}
          <p className="rounded-lg border bg-muted/40 p-4 text-sm whitespace-pre-line">
            {submission.message}
          </p>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setRead(!isRead)}
          >
            {isRead ? (
              <>
                <Mail /> Mark unread
              </>
            ) : (
              <>
                <MailOpen /> Mark read
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button asChild>
              <a href={replyHref}>Reply by email</a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
