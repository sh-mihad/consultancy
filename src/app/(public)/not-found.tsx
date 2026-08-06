import Link from "next/link"
import { ArrowLeft, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getNavigation } from "@/lib/queries"

/**
 * Public 404. Reached by notFound() from /[menuSlug] and /[menuSlug]/[pageSlug],
 * which between them catch every unknown path under the public site — including
 * drafts and pages requested through the wrong menu.
 *
 * Offers the real navigation rather than a dead end.
 */
export default async function PublicNotFound() {
  const menus = await getNavigation()

  return (
    <section className="section">
      <div className="container-x flex flex-col items-center text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-7 text-muted-foreground" aria-hidden="true" />
        </div>

        <p className="eyebrow mb-2">404</p>
        <h1 className="heading-2 text-balance">We couldn&apos;t find that page</h1>
        <p className="lead mt-4 max-w-lg">
          The page may have been moved or unpublished. Here&apos;s what we do — one of these is
          probably what you were after.
        </p>

        {menus.length > 0 ? (
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {menus.map((menu) => (
              <li key={menu.slug}>
                <Link
                  href={`/${menu.slug}`}
                  className="inline-flex rounded-lg border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {menu.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <Button asChild size="lg" className="mt-8 h-11 px-6">
          <Link href="/">
            <ArrowLeft />
            Back to home
          </Link>
        </Button>
      </div>
    </section>
  )
}
