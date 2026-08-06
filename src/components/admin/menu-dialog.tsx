"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Formik, Form, Field, type FieldProps, type FormikHelpers } from "formik"
import { LoaderCircle, TriangleAlert } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { menuSchema, type MenuInput } from "@/lib/validation"
import { slugify } from "@/lib/slugify"

export type MenuRow = {
  id: string
  title: string
  slug: string
  order: number
  isActive: boolean
  pageCount: number
}

const BLANK: MenuInput = { title: "", slug: "", order: 0, isActive: true }

export function MenuDialog({
  open,
  onOpenChange,
  menu,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; omit to create. */
  menu?: MenuRow | null
}) {
  const router = useRouter()
  const [formError, setFormError] = React.useState<string | null>(null)

  // Once the admin edits the slug by hand we stop deriving it from the title.
  // Silently rewriting a slug someone set on purpose would break their URLs.
  const [slugLocked, setSlugLocked] = React.useState(false)

  const isEdit = Boolean(menu)

  // Reset per-open so a previously-opened record never bleeds into the next one.
  React.useEffect(() => {
    if (open) {
      setFormError(null)
      setSlugLocked(Boolean(menu))
    }
  }, [open, menu])

  const initialValues: MenuInput = menu
    ? { title: menu.title, slug: menu.slug, order: menu.order, isActive: menu.isActive }
    : BLANK

  async function handleSubmit(
    values: MenuInput,
    { setErrors }: FormikHelpers<MenuInput>
  ) {
    setFormError(null)

    const res = await fetch(isEdit ? `/api/menus/${menu!.id}` : "/api/menus", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      // Surface server-side field errors (e.g. slug conflict) on the field
      // itself rather than as an opaque banner.
      if (json?.fieldErrors) setErrors(json.fieldErrors)
      setFormError(json?.error ?? "Something went wrong.")
      return
    }

    toast.success(isEdit ? "Menu updated" : "Menu created")
    onOpenChange(false)
    // Server Component list — re-fetch rather than patching local state.
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit menu" : "New menu"}</DialogTitle>
          <DialogDescription>
            Menus are the top-level service categories shown in the navigation.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={menuSchema}
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

              <div className="space-y-2">
                <Label htmlFor="menu-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Field name="title">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="menu-title"
                      placeholder="Intellectual Property"
                      autoFocus
                      aria-invalid={Boolean(touched.title && errors.title)}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        field.onChange(e)
                        if (!slugLocked) {
                          setFieldValue("slug", slugify(e.target.value))
                        }
                      }}
                    />
                  )}
                </Field>
                {touched.title && errors.title ? (
                  <p className="text-xs text-destructive">{errors.title}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu-slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Field name="slug">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="menu-slug"
                      placeholder="intellectual-property"
                      aria-invalid={Boolean(touched.slug && errors.slug)}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setSlugLocked(true)
                        field.onChange(e)
                      }}
                    />
                  )}
                </Field>
                <p className="text-xs text-muted-foreground">
                  Public URL: <code>/{values.slug || "…"}</code>
                  {!slugLocked ? " · auto-generated from the title" : null}
                </p>
                {touched.slug && errors.slug ? (
                  <p className="text-xs text-destructive">{errors.slug}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="menu-order">Order</Label>
                  <Field name="order">
                    {({ field }: FieldProps) => (
                      <Input
                        {...field}
                        id="menu-order"
                        type="number"
                        min={0}
                        aria-invalid={Boolean(touched.order && errors.order)}
                        disabled={isSubmitting}
                      />
                    )}
                  </Field>
                  {touched.order && errors.order ? (
                    <p className="text-xs text-destructive">{errors.order}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="menu-active">Visibility</Label>
                  <div className="flex h-8 items-center gap-2.5">
                    <Switch
                      id="menu-active"
                      checked={values.isActive}
                      onCheckedChange={(v) => setFieldValue("isActive", v)}
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-muted-foreground">
                      {values.isActive ? "Visible on the site" : "Hidden"}
                    </span>
                  </div>
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
                    "Create menu"
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
