import Image from "next/image"
import { Award, Clock, Users } from "lucide-react"

import { sanitizeHtml } from "@/lib/sanitize"
import type { ISiteSettings } from "@/models/SiteSettings"

const HIGHLIGHTS = [
  { icon: Clock, label: "15 years", hint: "advising in Bangladesh" },
  { icon: Users, label: "1,200+", hint: "companies registered" },
  { icon: Award, label: "3,000+", hint: "trademark filings" },
]

export function AboutUs({ aboutUs }: { aboutUs: ISiteSettings["aboutUs"] }) {
  // Rich text authored in the admin — sanitized before it reaches the DOM.
  const html = sanitizeHtml(aboutUs?.body)

  return (
    <section id="about" className="section">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          {aboutUs?.eyebrow ? <p className="eyebrow mb-3">{aboutUs.eyebrow}</p> : null}
          <h2 className="heading-2 text-balance">{aboutUs.heading}</h2>

          {html ? (
            <div
              className="prose-content mt-5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : null}

          <dl className="mt-9 grid grid-cols-3 gap-4 border-t pt-7">
            {HIGHLIGHTS.map(({ icon: Icon, label, hint }) => (
              <div key={label}>
                <Icon className="mb-2 size-5 text-accent" aria-hidden="true" />
                <dt className="font-heading text-xl font-bold tracking-tight">{label}</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground">{hint}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          {aboutUs?.image ? (
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
              <Image
                src={aboutUs.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            // No image set: a composed panel rather than an empty box or a
            // broken-image icon.
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-linear-to-br from-primary to-brand-navy-light">
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-16 size-64 rounded-full bg-accent/15 blur-2xl"
              />
              <div className="absolute inset-0 flex items-end p-8">
                <blockquote className="text-primary-foreground">
                  <p className="font-heading text-xl leading-snug font-semibold text-balance md:text-2xl">
                    “The person advising you is the person filing.”
                  </p>
                  <footer className="mt-3 text-sm text-primary-foreground/70">
                    Our operating principle since 2011
                  </footer>
                </blockquote>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
