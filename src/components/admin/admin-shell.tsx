import Link from "next/link"
import { LogOut, ShieldCheck } from "lucide-react"
import type { Session } from "next-auth"

import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav"
import { initials } from "@/lib/format"

/**
 * Chrome for every authenticated admin page: navy sidebar, topbar, sign out.
 * Server Component — the session is read on the server and never shipped to the
 * client beyond the name/email shown in the topbar.
 */
export function AdminShell({
  session,
  children,
}: {
  session: Session
  children: React.ReactNode
}) {
  const name = session.user?.name ?? "Admin"
  const email = session.user?.email ?? ""

  return (
    <div className="min-h-screen bg-muted">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar lg:flex">
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </div>
          <span className="font-heading text-sm font-semibold text-sidebar-accent-foreground">
            Consultancy CMS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <AdminNav />
        </div>

        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            View live site ↗
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background px-4 sm:px-6">
          <AdminMobileNav />

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-medium">{name}</p>
              <p className="text-xs leading-tight text-muted-foreground">{email}</p>
            </div>

            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/5 text-xs font-semibold text-primary">
                {initials(name)}
              </AvatarFallback>
            </Avatar>

            {/* Server action — no client JS needed to sign out, and the session
                cookie is cleared server-side. */}
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/admin/login" })
              }}
            >
              <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
                <LogOut />
              </Button>
            </form>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
