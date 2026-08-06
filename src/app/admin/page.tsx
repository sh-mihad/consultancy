import { redirect } from "next/navigation"

/** /admin is not a page — send it to the dashboard. */
export default function AdminIndexPage() {
  redirect("/admin/dashboard")
}
