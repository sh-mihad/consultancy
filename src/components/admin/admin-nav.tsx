"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  Inbox,
  LayoutDashboard,
  ListTree,
  Settings,
  Star,
} from "lucide-react"

import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menus", label: "Menus & pages", icon: ListTree },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map(({ href, label, icon: Icon }) => {
        // Match nested routes too, so /admin/menus/123/pages keeps "Menus"
        // highlighted — but don't let /admin/menus match /admin/menusomething.
        const active = pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export { NAV as ADMIN_NAV }
