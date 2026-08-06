import { getNavigation } from "@/lib/queries"
import { NavbarClient } from "@/components/public/navbar-client"

/**
 * Server Component. The menu tree is read from the database on every render —
 * never hardcoded — so adding a service in the admin updates the navbar with no
 * code change. Revalidation is handled by the layout's `revalidate` export.
 */
export async function Navbar() {
  const menus = await getNavigation()
  return <NavbarClient menus={menus} />
}
