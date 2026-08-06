"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Formik, Form, Field, type FieldProps } from "formik"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, LoaderCircle, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginInput } from "@/lib/validation"

const INITIAL: LoginInput = { email: "", password: "" }

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formError, setFormError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)

  // Middleware appends callbackUrl when it bounces an unauthenticated request.
  const rawCallback = searchParams.get("callbackUrl")

  // Only ever redirect to a same-origin admin path. An attacker-supplied
  // absolute URL here would turn the login page into an open redirect.
  const callbackUrl =
    rawCallback && rawCallback.startsWith("/admin") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/admin/dashboard"

  async function handleSubmit(values: LoginInput) {
    setFormError(null)

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    if (!result || result.error) {
      // Deliberately vague: saying "no such account" would let anyone probe
      // which email addresses are registered.
      setFormError("Incorrect email or password.")
      return
    }

    router.push(callbackUrl)
    // The layout reads the session server-side, so it must re-render.
    router.refresh()
  }

  return (
    <Formik
      initialValues={INITIAL}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-5" noValidate>
          {formError ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Field name="email">
              {({ field }: FieldProps) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  aria-invalid={Boolean(touched.email && errors.email)}
                  disabled={isSubmitting}
                />
              )}
            </Field>
            {touched.email && errors.email ? (
              <p className="text-xs text-destructive">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Field name="password">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="pr-10"
                    aria-invalid={Boolean(touched.password && errors.password)}
                    disabled={isSubmitting}
                  />
                )}
              </Field>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {touched.password && errors.password ? (
              <p className="text-xs text-destructive">{errors.password}</p>
            ) : null}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
