import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { NavMenu } from "@/lib/queries"
import type { ISiteSettings } from "@/models/SiteSettings"

/**
 * Firm credentials. Still hardcoded — there is no SiteSettings field for them
 * yet, so an admin cannot edit these without a code change. If they are going
 * to change, they belong in the settings singleton.
 */
const CREDENTIALS = [
  { value: "2011", label: "Advising since" },
  { value: "1,200+", label: "Companies registered" },
  { value: "3,000+", label: "Trademarks filed" },
]

/** The four L-shaped foil marks at the register's corners. */
const CORNERS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
]

export function Hero({
  hero,
  menus,
}: {
  hero: ISiteSettings["hero"]
  menus: NavMenu[]
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-navy-dark text-primary-foreground">
      {/* optional admin-set background photo, darkened so text stays legible */}
      {hero?.backgroundImage ? (
        <>
          <Image
            src={hero.backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div
            className="absolute inset-0 -z-10 bg-brand-navy-dark/88"
            aria-hidden="true"
          />
        </>
      ) : null}

      {/* Engine-turned engraving — the security-print ground. */}
      <div
        aria-hidden="true"
        className="engrave pointer-events-none absolute inset-0 -z-10 opacity-[0.09]"
      />

      <div className="container-x pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-14">
          <div className="rise lg:col-span-7">
            {/* The hero is not .section-dark, so the gold re-tone has to be
                applied here. */}
            <p className="eyebrow text-brand-gold-light">
              Corporate &amp; legal advisory · Dhaka
            </p>

            <h1 className="heading-1 mt-6 text-balance">{hero.heading}</h1>

            {hero.subheading ? (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/70">
                {hero.subheading}
              </p>
            ) : null}

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              {hero.ctaLabel ? (
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-accent px-7 text-accent-foreground hover:bg-brand-gold-light"
                >
                  <Link href={hero.ctaHref || "#contact"}>
                    {hero.ctaLabel}
                    <ArrowRight />
                  </Link>
                </Button>
              ) : null}

              <Link
                href="#services"
                className="group inline-flex items-center gap-2 border-b border-white/25 pb-1 text-sm font-medium text-primary-foreground/85 transition-colors hover:border-brand-gold-light hover:text-brand-gold-light focus-visible:ring-[3px] focus-visible:ring-brand-gold-light/40 focus-visible:outline-none"
              >
                See what we handle
                <ArrowUpRight
                  className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <dl className="mt-14 grid max-w-xl grid-cols-3 border-t border-white/12 pt-6">
              {CREDENTIALS.map(({ value, label }, i) => (
                <div key={label} className={i > 0 ? "border-l border-white/12 pl-6" : "pr-6"}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="font-heading block text-2xl font-medium tracking-tight tabular-nums text-brand-gold-light md:text-[1.75rem]">
                      {value}
                    </span>
                    <span className="mt-2 block font-mono text-[0.62rem] font-medium tracking-[0.14em] text-primary-foreground/55 uppercase">
                      {label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── Practice register ────────────────────────────────────────────
              The Menu collection, rendered as the firm's own index. Reads live,
              so adding a service in the admin adds a line here. */}
          <div
            className="rise lg:col-span-5 lg:pt-2"
            style={{ animationDelay: "140ms" }}
          >
            {menus.length > 0 ? (
              <aside className="relative border border-accent/30 bg-white/[0.03] p-1.5 backdrop-blur-[2px]">
                {CORNERS.map((position) => (
                  <span
                    key={position}
                    aria-hidden="true"
                    className={`absolute size-3.5 border-accent ${position}`}
                  />
                ))}

                <div className="border border-accent/12 px-6 py-6 sm:px-7">
                  <header className="flex items-baseline justify-between gap-4 border-b border-white/12 pb-4">
                    <h2 className="label-field text-brand-gold-light/85">
                      Practice register
                    </h2>
                    <p className="font-mono text-[0.68rem] tabular-nums text-primary-foreground/45">
                      {menus.length} areas
                    </p>
                  </header>

                  <ul className="divide-y divide-white/8">
                    {menus.map((menu) => (
                      <li key={menu.slug}>
                        <Link
                          href={`/${menu.slug}`}
                          className="group flex items-baseline gap-4 py-3.5 focus-visible:ring-[3px] focus-visible:ring-brand-gold-light/40 focus-visible:outline-none"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-px w-0 shrink-0 self-center bg-accent transition-all duration-300 group-hover:w-4"
                          />
                          <span className="font-heading text-[1.0625rem] font-medium transition-colors group-hover:text-brand-gold-light">
                            {menu.title}
                          </span>
                          <span className="ml-auto shrink-0 font-mono text-[0.68rem] tabular-nums text-primary-foreground/40">
                            {menu.pages.length > 0 ? menu.pages.length : "—"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
