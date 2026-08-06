import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Horizontal page gutter + max width. Wraps `.container-x` so section padding
 * stays in one place instead of being retyped on every block.
 */
function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="container" className={cn("container-x", className)} {...props} />
  )
}

export { Container }
