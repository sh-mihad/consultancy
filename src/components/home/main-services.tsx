import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import type { NavMenu } from "@/lib/queries"

/** Sub-pages shown inline before the row collapses into a "view all" link. */
const PAGES_SHOWN = 6

/**
 * The practice directory.
 *
 * Every menu is a row and every published sub-page is a real link, so the whole
 * service tree is reachable from the homepage. Nothing here is keyed on a slug
 * — a new menu adds a row and a new page adds a link, with no code change.
 */
export function MainServices({
  menus,
  heading,
  eyebrow,
  description,
}: {
  menus: NavMenu[]
  heading: string
  eyebrow?: string
  description?: string
}) {
  if (menus.length === 0) return null

  return (
    <section id="services" className="section-alt scroll-mt-16">
      <div className="container-x">
        <div className="grid gap-6 border-b border-foreground/15 pb-9 md:grid-cols-12 md:items-end md:gap-10">
          <div className="md:col-span-7">
            {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
            <h2 className="heading-2 text-balance">{heading}</h2>
          </div>
          {description ? (
            <p className="lead md:col-span-5 md:pb-1">{description}</p>
          ) : null}
        </div>

        <div className="divide-y divide-border">
          {menus.map((menu) => {
            const shown = menu.pages.slice(0, PAGES_SHOWN)
            const hidden = menu.pages.length - shown.length

            return (
              <article
                key={menu.slug}
                className="group grid gap-6 py-9 md:grid-cols-12 md:gap-10"
              >
                <div className="md:col-span-4">
                  <div
                    aria-hidden="true"
                    className="h-px w-10 bg-accent transition-all duration-500 group-hover:w-20"
                  />
                  <h3 className="font-heading mt-5 text-2xl font-medium tracking-[-0.015em] md:text-[1.75rem]">
                    <Link
                      href={`/${menu.slug}`}
                      className="transition-colors hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {menu.title}
                    </Link>
                  </h3>
                  <p className="label-field mt-2.5">
                    {menu.pages.length === 0
                      ? "Overview"
                      : `${menu.pages.length} ${menu.pages.length === 1 ? "service" : "services"}`}
                  </p>

                  <Link
                    href={`/${menu.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-brand-navy-light focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {hidden > 0 ? `All ${menu.pages.length} services` : "Overview"}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>

                {shown.length > 0 ? (
                  <ul className="md:col-span-8 sm:grid sm:grid-cols-2 sm:gap-x-10">
                    {shown.map((page) => (
                      <li key={page.slug}>
                        <Link
                          href={`/${menu.slug}/${page.slug}`}
                          className="group/item flex items-baseline gap-3 border-b border-border/70 py-2.5 text-sm transition-colors hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          <span>{page.title}</span>
                          <ArrowUpRight
                            className="ml-auto size-3.5 shrink-0 self-center text-brand-gold-ink opacity-0 transition-opacity group-hover/item:opacity-100"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
