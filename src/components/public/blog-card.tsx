import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatDate, toDateTimeAttr } from "@/lib/format"

/**
 * Blog listing tile. `coverImage` is admin-supplied and may point at any host —
 * see `images.remotePatterns` in next.config.ts.
 */
function BlogCard({
  title,
  excerpt,
  href,
  coverImage,
  author,
  publishedAt,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href" | "title"> & {
  title: React.ReactNode
  excerpt?: React.ReactNode
  href: string
  coverImage?: string | null
  author?: string | null
  publishedAt?: Date | string | null
}) {
  return (
    <Link
      data-slot="blog-card"
      href={href}
      className={cn(
        "card-surface card-hover group flex flex-col overflow-hidden",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          // No cover set — a branded gradient beats a broken image icon.
          <div className="size-full bg-linear-to-br from-primary to-brand-navy-light" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="heading-3 mb-2 line-clamp-2 transition-colors group-hover:text-primary">
          {title}
        </h3>

        {excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
          {publishedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              <time dateTime={toDateTimeAttr(publishedAt)}>{formatDate(publishedAt)}</time>
            </span>
          ) : null}
          {author ? (
            <>
              {publishedAt ? <span aria-hidden="true">·</span> : null}
              <span>{author}</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export { BlogCard }
