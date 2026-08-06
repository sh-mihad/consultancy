import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ISiteSettings } from "@/models/SiteSettings"

const TRUST_POINTS = [
  "1,200+ companies registered",
  "3,000+ trademark filings",
  "Since 2011",
]

export function Hero({ hero }: { hero: ISiteSettings["hero"] }) {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
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
          <div className="absolute inset-0 -z-10 bg-primary/85" aria-hidden="true" />
        </>
      ) : null}

      {/* gold glow, top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 -z-10 size-[36rem] rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-32 -z-10 size-[32rem] rounded-full bg-brand-navy-light/40 blur-3xl"
      />

      <div className="container-x py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-primary-foreground/80">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Corporate &amp; legal advisory · Dhaka
          </span>

          <h1 className="heading-1 text-balance">{hero.heading}</h1>

          {hero.subheading ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/75 md:text-xl">
              {hero.subheading}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {hero.ctaLabel ? (
              <Button
                asChild
                size="lg"
                className="h-11 bg-accent px-6 text-accent-foreground hover:bg-brand-gold-dark"
              >
                <Link href={hero.ctaHref || "#contact"}>
                  {hero.ctaLabel}
                  <ArrowRight />
                </Link>
              </Button>
            ) : null}

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 border-white/25 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link href="#services">Explore services</Link>
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {TRUST_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm text-primary-foreground/70"
              >
                <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
