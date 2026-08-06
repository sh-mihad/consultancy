import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sectionVariants = cva("", {
  variants: {
    tone: {
      default: "section",
      muted: "section-alt",
      dark: "section-dark",
    },
  },
  defaultVariants: {
    tone: "default",
  },
})

/**
 * Vertical rhythm wrapper for a homepage/public block. Renders its own
 * `Container` so callers don't have to nest one every time.
 */
function Section({
  className,
  containerClassName,
  tone,
  children,
  ...props
}: React.ComponentProps<"section"> &
  VariantProps<typeof sectionVariants> & { containerClassName?: string }) {
  return (
    <section
      data-slot="section"
      data-tone={tone ?? "default"}
      className={cn(sectionVariants({ tone }), className)}
      {...props}
    >
      <div className={cn("container-x", containerClassName)}>{children}</div>
    </section>
  )
}

const headingAlign = cva("flex flex-col", {
  variants: {
    align: {
      left: "items-start text-left",
      center: "items-center text-center mx-auto max-w-3xl",
    },
  },
  defaultVariants: {
    align: "center",
  },
})

/**
 * Eyebrow + title + description trio used above every section body.
 * `as` lets a page keep a single h1 while sections use h2.
 */
function SectionHeading({
  eyebrow,
  title,
  description,
  align,
  as: Comp = "h2",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof headingAlign> & {
    eyebrow?: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
    as?: "h1" | "h2" | "h3"
  }) {
  return (
    <div
      data-slot="section-heading"
      className={cn(headingAlign({ align }), "gap-3", className)}
      {...props}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <Comp className={Comp === "h1" ? "heading-1" : "heading-2"}>{title}</Comp>
      {description ? <p className="lead">{description}</p> : null}
    </div>
  )
}

export { Section, SectionHeading, sectionVariants }
