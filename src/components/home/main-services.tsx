import {
  Briefcase,
  Building2,
  Globe,
  Receipt,
  Rocket,
  Scale,
  type LucideIcon,
} from "lucide-react"

import { ServiceCard } from "@/components/public/service-card"
import type { NavMenu } from "@/lib/queries"

/**
 * Icons are matched on slug with a fallback, so an admin can add a menu without
 * a code change — a new service simply gets the default icon rather than
 * breaking the grid.
 */
const ICONS: Record<string, LucideIcon> = {
  "intellectual-property": Scale,
  "startup-and-license": Rocket,
  taxation: Receipt,
  "foreign-entity": Globe,
  others: Building2,
}

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
    <section id="services" className="section-alt">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h2 className="heading-2 text-balance">{heading}</h2>
          {description ? <p className="lead mt-4">{description}</p> : null}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <ServiceCard
              key={menu.slug}
              href={`/${menu.slug}`}
              title={menu.title}
              // First two sub-pages give a concrete sense of what's inside,
              // without needing a separate description field on Menu.
              description={
                menu.pages.length > 0
                  ? menu.pages.slice(0, 3).map((p) => p.title).join(" · ")
                  : undefined
              }
              icon={ICONS[menu.slug] ?? Briefcase}
              pageCount={menu.pages.length}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
