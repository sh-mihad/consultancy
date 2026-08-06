import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * One numbered step in the "How to open a company in Bangladesh" section.
 * `step` is passed in rather than derived so the caller controls numbering
 * (the DB stores order, not a rendered index).
 */
function StepCard({
  step,
  title,
  description,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  step: number
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div
      data-slot="step-card"
      className={cn("relative flex gap-4", className)}
      {...props}
    >
      <div
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-base font-bold text-accent-foreground"
      >
        {step}
      </div>

      <div className="pt-1.5">
        <h3 className="heading-3 mb-1.5">{title}</h3>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

export { StepCard }
