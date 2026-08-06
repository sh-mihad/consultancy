import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { auth } from "@/auth"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
}

/**
 * Wraps every authenticated admin page. `/admin/login` sits outside this route
 * group, so it renders bare.
 *
 * The session is re-checked here rather than trusting middleware alone: this is
 * defence in depth, and it also gives the shell the user's name without a
 * second lookup.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/admin/login")
  }

  return <AdminShell session={session}>{children}</AdminShell>
}
