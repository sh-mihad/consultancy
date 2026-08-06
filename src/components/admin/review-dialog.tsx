"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Formik, Form, Field, type FieldProps, type FormikHelpers } from "formik"
import { LoaderCircle, Star, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"
import { reviewSchema, type ReviewInput } from "@/lib/validation"

export type ReviewRow = {
  id: string
  authorName: string
  authorTitle: string
  avatar: string
  rating: number
  quote: string
  order: number
  isActive: boolean
}

const BLANK: ReviewInput = {
  authorName: "",
  authorTitle: "",
  avatar: "",
  rating: 5,
  quote: "",
  order: 0,
  isActive: true,
}

/** Clickable 1–5 stars. A plain number input reads terribly for a rating. */
function RatingPicker({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (n: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          disabled={disabled}
          onClick={() => onChange(n)}
          className="rounded p-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        >
          <Star
            className={cn(
              "size-5 transition-colors",
              n <= value ? "fill-accent text-accent" : "fill-muted text-muted-foreground/40"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">{value} / 5</span>
    </div>
  )
}

export function ReviewDialog({
  open,
  onOpenChange,
  review,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; omit to create. */
  review?: ReviewRow | null
}) {
  const router = useRouter()
  const [formError, setFormError] = React.useState<string | null>(null)
  const isEdit = Boolean(review)

  // Clear the banner per open, so a previous failure doesn't greet the next
  // record. Field state is handled by enableReinitialize below.
  React.useEffect(() => {
    if (open) setFormError(null)
  }, [open, review])

  const initialValues: ReviewInput = review
    ? {
        authorName: review.authorName,
        authorTitle: review.authorTitle,
        avatar: review.avatar,
        rating: review.rating,
        quote: review.quote,
        order: review.order,
        isActive: review.isActive,
      }
    : BLANK

  async function handleSubmit(
    values: ReviewInput,
    { setErrors }: FormikHelpers<ReviewInput>
  ) {
    setFormError(null)

    const res = await fetch(isEdit ? `/api/reviews/${review!.id}` : "/api/reviews", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      if (json?.fieldErrors) setErrors(json.fieldErrors)
      setFormError(json?.error ?? "Something went wrong.")
      return
    }

    toast.success(isEdit ? "Review updated" : "Review added")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit review" : "Add review"}</DialogTitle>
          <DialogDescription>
            Shown in the Customer Review section of the homepage. Entered by you — not pulled
            from Google.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={reviewSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, values, setFieldValue }) => (
            <Form className="space-y-4" noValidate>
              {formError ? (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
                >
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="authorName">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Field name="authorName">
                    {({ field }: FieldProps) => (
                      <Input
                        {...field}
                        id="authorName"
                        placeholder="Farhana Rahman"
                        autoFocus
                        aria-invalid={Boolean(touched.authorName && errors.authorName)}
                        disabled={isSubmitting}
                      />
                    )}
                  </Field>
                  {touched.authorName && errors.authorName ? (
                    <p className="text-xs text-destructive">{errors.authorName}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorTitle">Role / company</Label>
                  <Field name="authorTitle">
                    {({ field }: FieldProps) => (
                      <Input
                        {...field}
                        id="authorTitle"
                        placeholder="MD, Nexus Textiles"
                        disabled={isSubmitting}
                      />
                    )}
                  </Field>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <RatingPicker
                  value={values.rating}
                  onChange={(n) => setFieldValue("rating", n)}
                  disabled={isSubmitting}
                />
                {touched.rating && errors.rating ? (
                  <p className="text-xs text-destructive">{errors.rating}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote">
                  Quote <span className="text-destructive">*</span>
                </Label>
                <Field name="quote">
                  {({ field }: FieldProps) => (
                    <Textarea
                      {...field}
                      id="quote"
                      rows={4}
                      placeholder="What the client said…"
                      aria-invalid={Boolean(touched.quote && errors.quote)}
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
                <p className="text-xs text-muted-foreground">
                  {values.quote.length}/600 · plain text, no formatting
                </p>
                {touched.quote && errors.quote ? (
                  <p className="text-xs text-destructive">{errors.quote}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    {values.avatar ? <AvatarImage src={values.avatar} alt="" /> : null}
                    <AvatarFallback className="bg-primary/5 text-xs font-semibold text-primary">
                      {initials(values.authorName || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <Field name="avatar">
                    {({ field }: FieldProps) => (
                      <Input
                        {...field}
                        id="avatar"
                        placeholder="https://…/photo.jpg"
                        aria-invalid={Boolean(touched.avatar && errors.avatar)}
                        disabled={isSubmitting}
                      />
                    )}
                  </Field>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional — initials are shown when empty.
                </p>
                {touched.avatar && errors.avatar ? (
                  <p className="text-xs text-destructive">{errors.avatar}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-3.5">
                <Switch
                  id="isActive"
                  checked={values.isActive}
                  onCheckedChange={(v) => setFieldValue("isActive", v)}
                  disabled={isSubmitting}
                />
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    {values.isActive
                      ? "Visible on the homepage."
                      : "Hidden — kept, but not shown to visitors."}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="animate-spin" aria-hidden="true" />
                      Saving…
                    </>
                  ) : isEdit ? (
                    "Save changes"
                  ) : (
                    "Add review"
                  )}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
