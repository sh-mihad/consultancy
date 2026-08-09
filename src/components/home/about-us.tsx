import Image from "next/image"

import { sanitizeHtml } from "@/lib/sanitize"
import type { ISiteSettings } from "@/models/SiteSettings"

export function AboutUs({ aboutUs }: { aboutUs: ISiteSettings["aboutUs"] }) {
  // Rich text authored in the admin — sanitized before it reaches the DOM.
  const html = sanitizeHtml(aboutUs?.body)

  return (
    <section id="about" className="section">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          {/* Foil frame, offset behind the plate rather than around it — the
              edge of a mounted document. */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 -translate-x-5 translate-y-5 border border-accent/45"
            />

            {aboutUs?.image ? (
              <div className="relative aspect-4/5 overflow-hidden">
                <Image
                  src={aboutUs.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            ) : (
              // No image set: an engraved plate, not an empty box.
              <div className="relative isolate aspect-4/5 overflow-hidden bg-brand-navy-dark">
                <div
                  aria-hidden="true"
                  className="engrave absolute inset-0 -z-10 opacity-[0.12]"
                />
                <div className="absolute inset-0 flex items-end p-8">
                  <p className="label-field text-brand-gold-light/85">
                    Established practice · Dhaka, Bangladesh
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          {aboutUs?.eyebrow ? <p className="eyebrow mb-5">{aboutUs.eyebrow}</p> : null}
          <h2 className="heading-2 text-balance">{aboutUs.heading}</h2>

          {html ? (
            <div
              className="prose-content mt-6 max-w-xl"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : null}

          <figure className="mt-10 max-w-xl">
            <div className="rule-foil" aria-hidden="true" />
            <blockquote className="font-heading mt-5 text-xl leading-snug font-medium text-balance italic md:text-[1.375rem]">
              “The person advising you is the person filing.”
            </blockquote>
            <figcaption className="label-field mt-3">
              Our operating principle since 2011
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
