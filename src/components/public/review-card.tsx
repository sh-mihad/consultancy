import * as React from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function Rating({ value, className }: { value: number; className?: string }) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)))

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rounded} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            "size-3.5",
            // --brand-gold is only 2.4:1 on white; the dark end of the ramp
            // clears the 3:1 floor for a non-text graphic.
            i < rounded
              ? "fill-brand-gold-dark text-brand-gold-dark"
              : "fill-border text-border"
          )}
        />
      ))}
    </div>
  )
}

/**
 * A customer testimonial. Admin-entered only — never rendered from Google
 * Places data. Homepage section exclusively.
 *
 * Borderless by design: a wall of bordered cards reads as a product page, and
 * these are attestations. The foil rule opens the block instead.
 */
function ReviewCard({
  authorName,
  authorTitle,
  avatar,
  rating,
  quote,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  authorName: string
  authorTitle?: string | null
  avatar?: string | null
  rating?: number
  quote: React.ReactNode
}) {
  return (
    <figure
      data-slot="review-card"
      className={cn("relative flex flex-col pt-6", className)}
      {...props}
    >
      <span aria-hidden="true" className="absolute top-0 left-0 h-px w-10 bg-accent" />

      {typeof rating === "number" ? <Rating value={rating} className="mb-4" /> : null}

      <blockquote className="font-heading flex-1 text-[1.1875rem] leading-[1.55] text-pretty text-foreground/90 italic">
        {quote}
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar className="size-9 rounded-none">
          {avatar ? <AvatarImage src={avatar} alt="" className="rounded-none" /> : null}
          <AvatarFallback className="rounded-none bg-primary/6 font-mono text-[0.7rem] font-medium text-primary">
            {initials(authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{authorName}</p>
          {authorTitle ? (
            <p className="truncate text-xs text-muted-foreground">{authorTitle}</p>
          ) : null}
        </div>
      </figcaption>
    </figure>
  )
}

export { ReviewCard, Rating }
