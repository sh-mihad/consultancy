import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Home } from "lucide-react"

import { getMenuBySlug } from "@/lib/queries"
import { buildMetadata } from "@/lib/metadata"
import { EmptyState } from "@/components/ui/empty-state"

type Props = { params: Promise<{ menuSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { menuSlug } = await params
  const menu = await getMenuBySlug(menuSlug)

  if (!menu) return { title: "Not found" }

  return buildMetadata({
    title: menu.title,
    description: `${menu.title} services — ${menu.pages
      .slice(0, 3)
      .map((p) => p.title)
      .join(", ")}.`,
    path: `/${menu.slug}`,
  })
}

/**
 * Service landing page. Lists the menu's published sub-pages.
 *
 * This route is a bare dynamic segment at the root, so it also catches any
 * unknown top-level path — `/nonsense` lands here and must 404 rather than
 * render an empty shell.
 */
export default async function MenuLandingPage({ params }: Props) {
  const { menuSlug } = await params
  const menu = await getMenuBySlug(menuSlug)

  if (!menu) notFound()

  // A menu with exactly one page has no meaningful list to show — send the
  // visitor straight to the content instead of an index of one item.
  if (menu.pages.length === 1) {
    redirect(`/${menu.slug}/${menu.pages[0]!.slug}`)
  }

  return (
    <>
      <section className="border-b bg-muted">
        <div className="container-x py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="inline-flex items-center gap-1 hover:text-primary">
                  <Home className="size-3.5" aria-hidden="true" />
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-foreground">{menu.title}</li>
            </ol>
          </nav>

          <h1 className="heading-1 text-balance">{menu.title}</h1>
          <p className="lead mt-4 max-w-2xl">
            {menu.pages.length > 0
              ? `${menu.pages.length} service${menu.pages.length === 1 ? "" : "s"} in this area. Choose one to read what the process involves.`
              : "This section is being prepared."}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          {menu.pages.length === 0 ? (
            <EmptyState
              title="No services published yet"
              description="Content for this section is on its way. Get in touch and we'll help directly in the meantime."
              action={
                <Link
                  href="/#contact"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Contact us →
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {menu.pages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${menu.slug}/${page.slug}`}
                  className="card-surface card-hover group flex flex-col p-6"
                >
                  <h2 className="heading-3 mb-2 transition-colors group-hover:text-primary">
                    {page.title}
                  </h2>
                  {page.metaDescription ? (
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {page.metaDescription}
                    </p>
                  ) : null}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-primary">
                    Read more
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
