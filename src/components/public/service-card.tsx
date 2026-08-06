import * as React from "react"
import Link from "next/link"
import { ArrowRight, Briefcase, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * A main service (Menu) tile — used in the homepage "Main Services" grid and on
 * a menu landing page. Purely presentational; the caller supplies the href.
 */
function ServiceCard({
  title,
  description,
  href,
  icon: Icon = Briefcase,
  pageCount,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href" | "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  href: string
  icon?: LucideIcon
  pageCount?: number
}) {
  return (
    <Link
      data-slot="service-card"
      href={href}
      className={cn(
        "card-surface card-hover group flex flex-col p-6",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </div>

      <h3 className="heading-3 mb-2">{title}</h3>

      {description ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Learn more
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
        {typeof pageCount === "number" && pageCount > 0 ? (
          <span className="text-xs text-muted-foreground">
            {pageCount} {pageCount === 1 ? "service" : "services"}
          </span>
        ) : null}
      </div>
    </Link>
  )
}

export { ServiceCard }
