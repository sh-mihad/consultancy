import { Navbar } from "@/components/public/navbar"
import { Footer } from "@/components/public/footer"

/**
 * Shell for every public route. Navbar and Footer both read from the database,
 * so a new service appears in the navigation without a deploy.
 *
 * Revalidated rather than fully dynamic: content changes when an admin saves,
 * which is rare, and the navbar would otherwise cost two queries on every
 * request to every page.
 */
export const revalidate = 60

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
