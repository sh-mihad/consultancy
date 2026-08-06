import Link from "next/link"
import { Mail, MapPin, Phone, Scale } from "lucide-react"

import { getNavigation, getSettings } from "@/lib/queries"
import {
  FacebookIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/public/social-icons"

// lucide v1 has no brand icons — these are inline SVG marks.
const SOCIALS = [
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "twitter", label: "X", Icon: XIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
] as const

export async function Footer() {
  const [settings, menus] = await Promise.all([getSettings(), getNavigation()])
  const { footer, contact } = settings

  const socials = SOCIALS.filter(({ key }) => Boolean(footer?.[key]))

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Scale className="size-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-base font-bold">Consultancy</span>
            </Link>

            {footer?.about ? (
              <p className="text-sm leading-relaxed text-primary-foreground/70">
                {footer.about}
              </p>
            ) : null}

            {socials.length > 0 ? (
              <div className="mt-5 flex gap-2">
                {socials.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={footer[key] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* services — split across two columns */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-heading text-sm font-semibold tracking-wide uppercase">
              Services
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {menus.map((menu) => (
                <li key={menu.slug}>
                  <Link
                    href={`/${menu.slug}`}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    {menu.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blogs"
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* contact */}
          <div>
            <h2 className="mb-4 font-heading text-sm font-semibold tracking-wide uppercase">
              Contact
            </h2>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              {contact?.address ? (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>{contact.address}</span>
                </li>
              ) : null}
              {contact?.phone ? (
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              {contact?.email ? (
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <a href={`mailto:${contact.email}`} className="hover:text-accent">
                    {contact.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Consultancy. All rights reserved.</p>
          <p>Dhaka, Bangladesh</p>
        </div>
      </div>
    </footer>
  )
}
