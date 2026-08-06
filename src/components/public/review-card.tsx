import * as React from "react"
import { Quote, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function Rating({ value }: { value: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)))

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rounded} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            "size-4",
            i < rounded ? "fill-accent text-accent" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  )
}

/**
 * A customer testimonial. Admin-entered only — never rendered from Google
 * Places data. Homepage section exclusively.
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
      className={cn("card-surface flex flex-col p-6", className)}
      {...props}
    >
      <Quote
        className="mb-3 size-7 text-accent/30"
        aria-hidden="true"
      />

      {typeof rating === "number" ? (
        <div className="mb-3">
          <Rating value={rating} />
        </div>
      ) : null}

      <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
        {quote}
      </blockquote>

      <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
        <Avatar className="size-10">
          {avatar ? <AvatarImage src={avatar} alt="" /> : null}
          <AvatarFallback className="bg-primary/5 text-xs font-semibold text-primary">
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
