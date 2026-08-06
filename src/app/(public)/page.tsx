import { getActiveReviews, getNavigation, getSettings } from "@/lib/queries"
import { Hero } from "@/components/home/hero"
import { AboutUs } from "@/components/home/about-us"
import { MainServices } from "@/components/home/main-services"
import { HowToOpen } from "@/components/home/how-to-open"
import { Reviews } from "@/components/home/reviews"
import { ContactSection } from "@/components/home/contact-section"

/**
 * Homepage — seven sections, in order:
 *   1 Hero            SiteSettings.hero
 *   2 About Us        SiteSettings.aboutUs
 *   3 Main Services   Menu collection (queried directly, not duplicated)
 *   4 How To Open     SiteSettings.howTo.steps[]
 *   5 Customer Review Review collection + manual Google badge
 *   6 Contact Form    posts to /api/contact
 *   7 Footer          rendered by the (public) layout
 *
 * Every section reads from the database. No copy is hardcoded in JSX — an admin
 * can rewrite the entire page without a code change.
 */
export default async function HomePage() {
  // Fired together rather than sequentially: three independent reads that would
  // otherwise waterfall.
  const [settings, menus, reviews] = await Promise.all([
    getSettings(),
    getNavigation(),
    getActiveReviews(6),
  ])

  return (
    <>
      <Hero hero={settings.hero} />

      <AboutUs aboutUs={settings.aboutUs} />

      <MainServices
        menus={menus}
        eyebrow={settings.mainServices?.eyebrow}
        heading={settings.mainServices?.heading ?? "Our services"}
        description={settings.mainServices?.description}
      />

      <HowToOpen howTo={settings.howTo} />

      <Reviews reviews={reviews} section={settings.reviewsSection} />

      <ContactSection contact={settings.contact} />
    </>
  )
}
