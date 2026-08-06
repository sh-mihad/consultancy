import type { Metadata } from "next"

import { dbConnect } from "@/lib/db"
import { ContactSubmission } from "@/models/ContactSubmission"
import { PageHeader } from "@/components/admin/page-header"
import { SubmissionsTable } from "@/components/admin/submissions-table"
import type { SubmissionRow } from "@/components/admin/submission-dialog"

export const metadata: Metadata = { title: "Submissions" }
export const dynamic = "force-dynamic"

/**
 * Contact form inbox. Everything happens on this one route — messages are read
 * in a modal, and there is no editor because a submission is a record of what
 * a visitor sent, not content the admin authors.
 */
export default async function AdminSubmissionsPage() {
  await dbConnect()

  const submissions = await ContactSubmission.find({})
    .sort({ createdAt: -1 })
    .lean()

  const rows: SubmissionRow[] = submissions.map((s) => ({
    id: String(s._id),
    name: s.name,
    email: s.email,
    phone: s.phone ?? "",
    subject: s.subject ?? "",
    message: s.message,
    isRead: s.isRead,
    createdAt: s.createdAt.toISOString(),
  }))

  const unread = rows.filter((r) => !r.isRead).length

  return (
    <>
      <PageHeader
        title="Submissions"
        description={
          rows.length === 0
            ? "Enquiries sent through the homepage contact form."
            : `${rows.length} message${rows.length === 1 ? "" : "s"} · ${unread} unread.`
        }
      />
      <SubmissionsTable submissions={rows} />
    </>
  )
}
