import * as React from "react"
import { LoaderCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      sm: "size-4",
      default: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

function Spinner({
  className,
  size,
  label = "Loading",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof spinnerVariants> & { label?: string }) {
  return (
    <div
      data-slot="spinner"
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <LoaderCircle className={cn(spinnerVariants({ size }))} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export { Spinner }
