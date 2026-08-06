"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu as MenuIcon, Scale } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { NavMenu } from "@/lib/queries"

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function NavbarClient({ menus }: { menus: NavMenu[] }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      <div className="container-x flex h-16 items-center gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="size-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-base leading-tight font-bold tracking-tight">
            Consultancy
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
          {menus.map((menu) => {
            const href = `/${menu.slug}`
            const active = isActive(pathname, href)

            // No sub-pages: a plain link, no dropdown affordance.
            if (menu.pages.length === 0) {
              return (
                <Link
                  key={menu.slug}
                  href={href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {menu.title}
                </Link>
              )
            }

            return (
              // focus-within keeps the dropdown reachable by keyboard, not just hover.
              <div key={menu.slug} className="group relative">
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {menu.title}
                  <ChevronDown
                    className="size-3.5 transition-transform group-hover:rotate-180"
                    aria-hidden="true"
                  />
                </Link>

                <div
                  className={cn(
                    "invisible absolute top-full left-0 z-50 w-64 pt-2 opacity-0 transition-all",
                    "group-hover:visible group-hover:opacity-100",
                    "group-focus-within:visible group-focus-within:opacity-100"
                  )}
                >
                  <div className="card-surface overflow-hidden p-1.5 shadow-lg">
                    {menu.pages.map((page) => (
                      <Link
                        key={page.slug}
                        href={`/${menu.slug}/${page.slug}`}
                        className="block rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                      >
                        {page.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          <Link
            href="/blogs"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(pathname, "/blogs")
                ? "text-primary"
                : "text-foreground/80 hover:bg-muted hover:text-foreground"
            )}
          >
            Insights
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button asChild size="lg" className="hidden sm:inline-flex">
            <Link href="/#contact">Get in touch</Link>
          </Button>

          {/* mobile nav */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>

              <nav className="space-y-5 px-4 pb-8" aria-label="Mobile">
                {menus.map((menu) => (
                  <div key={menu.slug}>
                    <Link
                      href={`/${menu.slug}`}
                      onClick={() => setOpen(false)}
                      className="block text-sm font-semibold"
                    >
                      {menu.title}
                    </Link>
                    {menu.pages.length > 0 ? (
                      <div className="mt-2 space-y-1 border-l pl-3">
                        {menu.pages.map((page) => (
                          <Link
                            key={page.slug}
                            href={`/${menu.slug}/${page.slug}`}
                            onClick={() => setOpen(false)}
                            className="block py-1 text-sm text-muted-foreground hover:text-primary"
                          >
                            {page.title}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}

                <Link
                  href="/blogs"
                  onClick={() => setOpen(false)}
                  className="block text-sm font-semibold"
                >
                  Insights
                </Link>

                <Button asChild size="lg" className="w-full">
                  <Link href="/#contact" onClick={() => setOpen(false)}>
                    Get in touch
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
