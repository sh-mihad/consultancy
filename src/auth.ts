import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { authConfig } from "@/auth.config"
import { dbConnect } from "@/lib/db"
import { Admin } from "@/models/Admin"
import { loginSchema } from "@/lib/validation"

/**
 * Node-only half of the NextAuth config — this is the one that touches the
 * database. Never import it from middleware; see auth.config.ts.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // Same Yup schema the login form uses. Returning null (rather than
        // throwing) makes NextAuth surface a generic CredentialsSignin error.
        const parsed = await loginSchema
          .validate(credentials, { abortEarly: false })
          .catch(() => null)

        if (!parsed) return null

        await dbConnect()

        // passwordHash is `select: false` on the schema, so it must be asked
        // for explicitly — without the +, the compare below always fails.
        const admin = await Admin.findOne({ email: parsed.email }).select(
          "+passwordHash"
        )

        if (!admin) {
          // Hash anyway so a missing account and a wrong password take roughly
          // the same time, and the response can't be used to enumerate emails.
          await bcrypt.compare(parsed.password, "$2b$12$invalidsaltinvalidsaltie")
          return null
        }

        const valid = await bcrypt.compare(parsed.password, admin.passwordHash)
        if (!valid) return null

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        }
      },
    }),
  ],
})
