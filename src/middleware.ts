import NextAuth from "next-auth"

import { authConfig } from "@/auth.config"

/**
 * Protects /admin/* pages. Uses the edge-safe config only — importing `@/auth`
 * here would pull Mongoose and bcrypt into the Edge bundle and fail the build.
 *
 * Lives in src/ because the project uses a src directory; Next.js does not pick
 * up a middleware file at the repo root in that layout.
 */
export default NextAuth(authConfig).auth

export const config = {
  /**
   * Page routes only. API routes are deliberately NOT matched — they must guard
   * themselves with requireAdmin() (see lib/auth-guard.ts), because
   * POST /api/contact has to stay public.
   */
  matcher: ["/admin/:path*"],
}
