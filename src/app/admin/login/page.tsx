import { Suspense } from "react"
import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"

import { LoginForm } from "@/components/admin/login-form"
import { Spinner } from "@/components/ui/spinner"

export const metadata: Metadata = {
  title: "Admin sign in",
  // The admin area must never appear in search results.
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage services, pages, blogs and site content.
          </p>
        </div>

        <div className="card-surface p-6">
          {/* useSearchParams needs a Suspense boundary to avoid opting the
              whole route into client-side rendering. */}
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
