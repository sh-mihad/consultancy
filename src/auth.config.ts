import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe half of the NextAuth config.
 *
 * `middleware.ts` runs in the Edge runtime, which cannot load Mongoose or
 * bcrypt. So this file holds everything the middleware needs — pages, session
 * strategy, callbacks — and deliberately leaves `providers` empty. The
 * Credentials provider (which does hit the database) is added in `auth.ts`,
 * which only ever runs in Node.
 *
 * Importing `auth.ts` from middleware would drag Mongoose into the Edge bundle
 * and fail at build time. Import this instead.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  // JWT rather than a database session: the middleware can verify a JWT at the
  // edge without a database round trip on every request.
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },

  providers: [],

  callbacks: {
    /**
     * Gatekeeper for `/admin/*`. Runs in middleware on every matched request.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user)
      const { pathname } = nextUrl

      // The login page is the one admin route that must stay reachable while
      // signed out — otherwise the redirect loops forever.
      if (pathname === "/admin/login") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin/dashboard", nextUrl))
        }
        return true
      }

      if (pathname.startsWith("/admin")) {
        // Returning false makes NextAuth redirect to `pages.signIn` and append
        // a callbackUrl, so the admin lands where they were headed.
        return isLoggedIn
      }

      return true
    },

    jwt({ token, user }) {
      // `user` is only present on the sign-in call; afterwards the token is
      // reused, so persist what the session needs the first time round.
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.email = user.email
      }
      return token
    },

    session({ session, token }) {
      if (token.id) session.user.id = token.id
      if (token.role) session.user.role = token.role
      return session
    },
  },
} satisfies NextAuthConfig
