import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Title + description + primary action row at the top of every admin screen.
 * Keeps the "New X" button in the same place on all five list pages.
 */
function PageHeader({
  title,
  description,
  action,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export { PageHeader }
