import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * One step in the "How to open a company in Bangladesh" sequence.
 *
 * `step` is passed in rather than derived so the caller controls numbering (the
 * DB stores order, not a rendered index). Colours are drawn from `currentColor`
 * so the card reads correctly on both the light and the navy ground.
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
      className={cn("group relative pt-6", className)}
      {...props}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-current/15" />
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 h-px w-10 bg-accent transition-all duration-500 group-hover:w-24"
      />

      <span
        aria-hidden="true"
        className="font-heading block text-3xl leading-none font-medium tabular-nums text-current/25"
      >
        {String(step).padStart(2, "0")}
      </span>

      <h3 className="font-heading mt-4 text-xl font-medium tracking-[-0.01em]">{title}</h3>
      {description ? (
        <p className="mt-2.5 text-sm leading-relaxed text-current/70">{description}</p>
      ) : null}
    </div>
  )
}

export { StepCard }
