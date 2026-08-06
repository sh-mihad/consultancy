import { handlers } from "@/auth"

// NextAuth v5: the handlers object is exported directly. This is NOT the v4
// `NextAuth(authOptions)` default-export shape.
export const { GET, POST } = handlers
