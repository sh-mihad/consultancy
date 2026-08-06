import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * Builds a compact page list: 1 … 4 5 6 … 20
 * Returns numbers for pages and "…" for gaps.
 */
function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const items: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) items.push("…")
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 1) items.push("…")

  items.push(total)
  return items
}

/**
 * Link-based pagination for the blog listing. Server-rendered — uses hrefs,
 * not click handlers, so it works without JS and keeps pages crawlable.
 */
function Pagination({
  currentPage,
  totalPages,
  basePath,
  className,
  ...props
}: Omit<React.ComponentProps<"nav">, "onChange"> & {
  currentPage: number
  totalPages: number
  /** e.g. "/blogs" — page 1 links here, others get ?page=N */
  basePath: string
}) {
  if (totalPages <= 1) return null

  const href = (page: number) => (page === 1 ? basePath : `${basePath}?page=${page}`)
  const items = pageItems(currentPage, totalPages)

  return (
    <nav
      data-slot="pagination"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      {currentPage > 1 ? (
        <Link
          href={href(currentPage - 1)}
          aria-label="Previous page"
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
        >
          <ChevronLeft aria-hidden="true" />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-sm" }),
            "pointer-events-none opacity-40"
          )}
        >
          <ChevronLeft />
        </span>
      )}

      {items.map((item, i) =>
        item === "…" ? (
          <span
            key={`gap-${i}`}
            aria-hidden="true"
            className="px-1.5 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: item === currentPage ? "default" : "outline",
                size: "icon-sm",
              })
            )}
          >
            {item}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={href(currentPage + 1)}
          aria-label="Next page"
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
        >
          <ChevronRight aria-hidden="true" />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-sm" }),
            "pointer-events-none opacity-40"
          )}
        >
          <ChevronRight />
        </span>
      )}
    </nav>
  )
}

export { Pagination, pageItems }
