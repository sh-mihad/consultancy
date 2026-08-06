import { Mail, MapPin, Phone } from "lucide-react"

import { ContactForm } from "@/components/home/contact-form"
import type { ISiteSettings } from "@/models/SiteSettings"

export function ContactSection({ contact }: { contact: ISiteSettings["contact"] }) {
  const details = [
    contact?.address && { icon: MapPin, label: "Office", value: contact.address, href: null },
    contact?.phone && {
      icon: Phone,
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    },
    contact?.email && {
      icon: Mail,
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
  ].filter(Boolean) as {
    icon: typeof Mail
    label: string
    value: string
    href: string | null
  }[]

  return (
    <section id="contact" className="section scroll-mt-16">
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-3">Contact</p>
          <h2 className="heading-2 text-balance">{contact.heading}</h2>
          {contact.description ? <p className="lead mt-4">{contact.description}</p> : null}

          <dl className="mt-9 space-y-5">
            {details.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium">
                    {href ? (
                      <a href={href} className="hover:text-primary hover:underline">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {contact?.mapEmbedUrl ? (
            <div className="mt-8 aspect-video overflow-hidden rounded-xl border">
              <iframe
                src={contact.mapEmbedUrl}
                title="Office location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full border-0"
              />
            </div>
          ) : null}
        </div>

        <ContactForm />
      </div>
    </section>
  )
}
