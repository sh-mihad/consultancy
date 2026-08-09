import { ContactForm } from "@/components/home/contact-form"
import type { ISiteSettings } from "@/models/SiteSettings"

export function ContactSection({ contact }: { contact: ISiteSettings["contact"] }) {
  const details = [
    contact?.address && { label: "Office", value: contact.address, href: null },
    contact?.phone && {
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    },
    contact?.email && {
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
  ].filter(Boolean) as { label: string; value: string; href: string | null }[]

  return (
    <section id="contact" className="section-alt scroll-mt-16">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-5">Contact</p>
          <h2 className="heading-2 text-balance">{contact.heading}</h2>
          {contact.description ? <p className="lead mt-5">{contact.description}</p> : null}

          {details.length > 0 ? (
            <dl className="mt-10 border-t">
              {details.map(({ label, value, href }) => (
                <div key={label} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b py-4">
                  <dt className="label-field pt-0.5">{label}</dt>
                  <dd className="text-sm leading-relaxed">
                    {href ? (
                      <a
                        href={href}
                        className="transition-colors hover:text-primary hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {contact?.mapEmbedUrl ? (
            <div className="mt-8 aspect-video overflow-hidden border">
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

        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
