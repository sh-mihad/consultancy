"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Formik, Form, Field, type FieldProps, type FormikHelpers } from "formik"
import { ArrowLeft, ExternalLink, LoaderCircle, Save, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { pageSchema, type PageInput } from "@/lib/validation"
import { slugify } from "@/lib/slugify"

/**
 * Tiptap touches `window` on import, so it must never be evaluated on the
 * server. ssr:false is only legal inside a Client Component — hence this file.
 */
const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 animate-pulse rounded-lg border bg-muted/40" aria-hidden="true" />
    ),
  }
)

export type PageFormValues = Omit<PageInput, "menuId">

export type ExistingPage = PageFormValues & { id: string }

const BLANK: PageFormValues = {
  title: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  content: "",
  order: 0,
  isPublished: false,
}

export function PageForm({
  menuId,
  menuSlug,
  menuTitle,
  page,
}: {
  menuId: string
  menuSlug: string
  menuTitle: string
  /** Present when editing; omit to create. */
  page?: ExistingPage
}) {
  const router = useRouter()
  const [formError, setFormError] = React.useState<string | null>(null)
  const [slugLocked, setSlugLocked] = React.useState(Boolean(page))

  const isEdit = Boolean(page)
  const backHref = `/admin/menus/${menuId}/pages`

  async function handleSubmit(
    values: PageFormValues,
    { setErrors, resetForm }: FormikHelpers<PageFormValues>
  ) {
    setFormError(null)

    const res = await fetch(
      isEdit ? `/api/pages/${page!.id}` : `/api/menus/${menuId}/pages`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    )
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      if (json?.fieldErrors) setErrors(json.fieldErrors)
      setFormError(json?.error ?? "Something went wrong.")
      return
    }

    toast.success(isEdit ? "Page saved" : "Page created")

    if (isEdit) {
      // Keep the admin on the editor, but drop the dirty flag so the unsaved
      // changes guard stops firing.
      resetForm({ values })
      router.refresh()
    } else {
      router.push(backHref)
      router.refresh()
    }
  }

  return (
    <Formik
      initialValues={page ? { ...BLANK, ...page } : BLANK}
      validationSchema={pageSchema.omit(["menuId"])}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched, values, setFieldValue, dirty }) => (
        <Form noValidate className="space-y-6">
          <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link
                href={backHref}
                className="mb-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                {menuTitle}
              </Link>
              <h1 className="font-heading truncate text-2xl font-bold tracking-tight">
                {isEdit ? values.title || "Untitled page" : "New page"}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isEdit && values.isPublished ? (
                <Button type="button" variant="outline" asChild>
                  <a
                    href={`/${menuSlug}/${values.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View <ExternalLink />
                  </a>
                </Button>
              ) : null}
              <Button type="submit" disabled={isSubmitting || (isEdit && !dirty)}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save />
                    {isEdit ? "Save changes" : "Create page"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {formError ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* ---------------------------------------------------- content */}
            <TabsContent value="content" className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Field name="title">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="title"
                      placeholder="Trademark Registration"
                      aria-invalid={Boolean(touched.title && errors.title)}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        field.onChange(e)
                        if (!slugLocked) setFieldValue("slug", slugify(e.target.value))
                      }}
                    />
                  )}
                </Field>
                {touched.title && errors.title ? (
                  <p className="text-xs text-destructive">{errors.title}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  value={values.content ?? ""}
                  onChange={(html) => setFieldValue("content", html)}
                />
                <p className="text-xs text-muted-foreground">
                  Rendered inside <code>.prose-content</code> and sanitized before display.
                </p>
              </div>
            </TabsContent>

            {/* -------------------------------------------------------- seo */}
            <TabsContent value="seo" className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta title</Label>
                <Field name="metaTitle">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="metaTitle"
                      placeholder={values.title || "Falls back to the page title"}
                      aria-invalid={Boolean(touched.metaTitle && errors.metaTitle)}
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
                <p className="text-xs text-muted-foreground">
                  {(values.metaTitle ?? "").length}/70 characters
                </p>
                {touched.metaTitle && errors.metaTitle ? (
                  <p className="text-xs text-destructive">{errors.metaTitle}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta description</Label>
                <Field name="metaDescription">
                  {({ field }: FieldProps) => (
                    <Textarea
                      {...field}
                      id="metaDescription"
                      rows={3}
                      placeholder="One or two sentences shown under the title in search results."
                      aria-invalid={Boolean(
                        touched.metaDescription && errors.metaDescription
                      )}
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
                <p className="text-xs text-muted-foreground">
                  {(values.metaDescription ?? "").length}/160 characters
                </p>
                {touched.metaDescription && errors.metaDescription ? (
                  <p className="text-xs text-destructive">{errors.metaDescription}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">Social share image</Label>
                <Field name="ogImage">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="ogImage"
                      placeholder="https://…/share-image.png"
                      aria-invalid={Boolean(touched.ogImage && errors.ogImage)}
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
                <p className="text-xs text-muted-foreground">
                  1200×630. Falls back to the site default if left blank.
                </p>
                {touched.ogImage && errors.ogImage ? (
                  <p className="text-xs text-destructive">{errors.ogImage}</p>
                ) : null}
              </div>
            </TabsContent>

            {/* --------------------------------------------------- settings */}
            <TabsContent value="settings" className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Field name="slug">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="slug"
                      placeholder="trademark-registration"
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
                  Public URL: <code>/{menuSlug}/{values.slug || "…"}</code>
                  {!slugLocked ? " · auto-generated from the title" : null}
                </p>
                {touched.slug && errors.slug ? (
                  <p className="text-xs text-destructive">{errors.slug}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Field name="order">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="order"
                      type="number"
                      min={0}
                      className="max-w-32"
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first within this menu.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Switch
                  id="isPublished"
                  checked={values.isPublished}
                  onCheckedChange={(v) => setFieldValue("isPublished", v)}
                  disabled={isSubmitting}
                />
                <div>
                  <Label htmlFor="isPublished">Published</Label>
                  <p className="text-xs text-muted-foreground">
                    {values.isPublished
                      ? "Live on the public site."
                      : "Draft — hidden from visitors and from the navigation."}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Form>
      )}
    </Formik>
  )
}
