import type { DefaultSession } from "next-auth"

import type { AdminRole } from "@/models/Admin"

/**
 * Widen NextAuth's types so `session.user.id` and `session.user.role` exist.
 * Without this the callbacks in auth.config.ts don't typecheck and every
 * consumer has to cast.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: AdminRole
    } & DefaultSession["user"]
  }

  interface User {
    role?: AdminRole
  }
}

/**
 * Augment `@auth/core/jwt`, NOT `next-auth/jwt`.
 *
 * `next-auth/jwt` is only `export * from "@auth/core/jwt"`. Declaring against a
 * pure re-export does not reach the underlying interface, so the augmentation
 * silently does nothing and `token.id` stays `unknown`.
 */
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string
    role?: AdminRole
  }
}

export {}
