"use client"

import * as React from "react"
import { Formik, Form, Field, type FieldProps } from "formik"
import { CheckCircle2, LoaderCircle, Send, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { contactSchema, type ContactInput } from "@/lib/validation"

/** Square fields to match the plate they sit on. */
const FIELD = "h-11 rounded-none bg-background"

const INITIAL: ContactInput = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "", // honeypot
}

export function ContactForm() {
  const [sent, setSent] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  if (sent) {
    return (
      <div className="relative flex flex-col items-center border bg-card p-10 text-center">
        <div className="rule-foil absolute inset-x-0 top-0" aria-hidden="true" />
        <CheckCircle2 className="mb-4 size-7 text-success" aria-hidden="true" />
        <h3 className="font-heading text-xl font-medium">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Thank you — we&apos;ve received your message and will get back to you within one
          working day.
        </p>
        <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <Formik
      initialValues={INITIAL}
      validationSchema={contactSchema}
      onSubmit={async (values, { resetForm }) => {
        setFormError(null)
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          })
          const json = await res.json().catch(() => null)

          if (!res.ok || !json?.success) {
            setFormError(json?.error ?? "Something went wrong. Please try again.")
            return
          }

          resetForm()
          setSent(true)
        } catch {
          setFormError("Could not reach the server. Please check your connection.")
        }
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form
          className="relative space-y-5 border bg-card p-7 md:p-9"
          noValidate
        >
          <div className="rule-foil absolute inset-x-0 top-0" aria-hidden="true" />

          {formError ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          {/* Honeypot. Hidden from humans and from screen readers; only a bot
              filling every input will populate it. */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <Field id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Field name="name">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="name"
                    className={FIELD}
                    placeholder="Your full name"
                    aria-invalid={Boolean(touched.name && errors.name)}
                    disabled={isSubmitting}
                  />
                )}
              </Field>
              {touched.name && errors.name ? (
                <p className="text-xs text-destructive">{errors.name}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Field name="email">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    className={FIELD}
                    placeholder="you@company.com"
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
              <Label htmlFor="phone">Phone</Label>
              <Field name="phone">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="phone"
                    className={FIELD}
                    placeholder="+880 …"
                    disabled={isSubmitting}
                  />
                )}
              </Field>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Field name="subject">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="subject"
                    className={FIELD}
                    placeholder="Company registration"
                    disabled={isSubmitting}
                  />
                )}
              </Field>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Field name="message">
              {({ field }: FieldProps) => (
                <Textarea
                  {...field}
                  id="message"
                  rows={5}
                  className="rounded-none bg-background"
                  placeholder="Tell us what you're trying to set up…"
                  aria-invalid={Boolean(touched.message && errors.message)}
                  disabled={isSubmitting}
                />
              )}
            </Field>
            {touched.message && errors.message ? (
              <p className="text-xs text-destructive">{errors.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              <>
                Send message
                <Send />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            We reply within one working day. Your details are never shared.
          </p>
        </Form>
      )}
    </Formik>
  )
}
