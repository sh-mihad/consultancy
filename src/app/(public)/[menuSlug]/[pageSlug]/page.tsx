import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Home, Mail } from "lucide-react"

import { getPageBySlug } from "@/lib/queries"
import { buildMetadata } from "@/lib/metadata"
import { sanitizeHtml } from "@/lib/sanitize"
import { Button } from "@/components/ui/button"
import { formatDate, toDateTimeAttr } from "@/lib/format"

type Props = { params: Promise<{ menuSlug: string; pageSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { menuSlug, pageSlug } = await params
  const page = await getPageBySlug(menuSlug, pageSlug)

  if (!page) return { title: "Not found" }

  return buildMetadata({
    // metaTitle is the admin's override; fall back to the page title.
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    path: `/${page.menu.slug}/${page.slug}`,
    image: page.ogImage,
    type: "article",
    modifiedTime: page.updatedAt,
  })
}

export default async function ServicePage({ params }: Props) {
  const { menuSlug, pageSlug } = await params
  const page = await getPageBySlug(menuSlug, pageSlug)

  // Covers unknown slugs, drafts, deactivated menus, and a valid page reached
  // through the wrong menu's URL.
  if (!page) notFound()

  // Admin-authored HTML is still untrusted input — sanitize before rendering.
  const html = sanitizeHtml(page.content)

  return (
    <>
      <section className="border-b bg-muted">
        <div className="container-x py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="inline-flex items-center gap-1 hover:text-primary">
                  <Home className="size-3.5" aria-hidden="true" />
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/${page.menu.slug}`} className="hover:text-primary">
                  {page.menu.title}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-foreground">{page.title}</li>
            </ol>
          </nav>

          <h1 className="heading-1 max-w-4xl text-balance">{page.title}</h1>

          <p className="mt-4 text-sm text-muted-foreground">
            Last updated{" "}
            <time dateTime={toDateTimeAttr(page.updatedAt)}>
              {formatDate(page.updatedAt)}
            </time>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          {/* .prose-content is what makes admin HTML legible — without it this
              renders as unstyled text. */}
          <article
            className="prose-content max-w-3xl"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {page.siblings.length > 0 ? (
              <div className="card-surface p-5">
                <h2 className="font-heading mb-3 text-sm font-semibold tracking-wide uppercase">
                  More in {page.menu.title}
                </h2>
                <ul className="space-y-1">
                  {page.siblings.map((sibling) => (
                    <li key={sibling.slug}>
                      <Link
                        href={`/${page.menu.slug}/${sibling.slug}`}
                        className="group flex items-start gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      >
                        <ArrowRight
                          className="mt-0.5 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden="true"
                        />
                        <span className="-ml-5.5 group-hover:ml-0">{sibling.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-xl bg-primary p-5 text-primary-foreground">
              <h2 className="font-heading text-base font-semibold">Need help with this?</h2>
              <p className="mt-1.5 text-sm text-primary-foreground/75">
                Tell us your situation and we&apos;ll give you a realistic timeline before you
                commit.
              </p>
              <Button
                asChild
                className="mt-4 w-full bg-accent text-accent-foreground hover:bg-brand-gold-dark"
              >
                <Link href="/#contact">
                  <Mail />
                  Get in touch
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
