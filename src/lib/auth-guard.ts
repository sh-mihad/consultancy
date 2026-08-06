import { auth } from "@/auth"
import type { Session } from "next-auth"

/**
 * Session guard for API route handlers.
 *
 * `middleware.ts` only matches /admin/* pages — it does not cover /api/*, and
 * it must not, because POST /api/contact is public by design. So every mutating
 * handler calls this itself:
 *
 *   const session = await requireAdmin()
 *   if (!session) return unauthorized()
 *
 * Returns the session on success, or null when there is no valid admin.
 */
export async function requireAdmin(): Promise<Session | null> {
  const session = await auth()

  if (!session?.user?.id) return null

  return session
}

/** True when a valid admin session exists. */
export async function isAdmin(): Promise<boolean> {
  return (await requireAdmin()) !== null
}
