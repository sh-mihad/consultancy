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
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { blogSchema } from "@/lib/validation"
import { slugify } from "@/lib/slugify"

const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 animate-pulse rounded-lg border bg-muted/40" aria-hidden="true" />
    ),
  }
)

export type BlogFormValues = {
  title: string
  slug: string
  metaTitle: string
  metaDescription: string
  ogImage: string
  coverImage: string
  content: string
  author: string
  isPublished: boolean
  /** YYYY-MM-DD, or "" */
  publishedAt: string
}

export type ExistingBlog = BlogFormValues & { id: string }

const BLANK: BlogFormValues = {
  title: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  coverImage: "",
  content: "",
  author: "",
  isPublished: false,
  publishedAt: "",
}

export function BlogForm({ blog }: { blog?: ExistingBlog }) {
  const router = useRouter()
  const [formError, setFormError] = React.useState<string | null>(null)
  const [slugLocked, setSlugLocked] = React.useState(Boolean(blog))
  // Saving mid-upload would persist the old cover and throw away the new one.
  const [uploading, setUploading] = React.useState(false)

  const isEdit = Boolean(blog)

  async function handleSubmit(
    values: BlogFormValues,
    { setErrors, resetForm }: FormikHelpers<BlogFormValues>
  ) {
    setFormError(null)

    const res = await fetch(isEdit ? `/api/blogs/${blog!.id}` : "/api/blogs", {
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

    toast.success(isEdit ? "Post saved" : "Post created")

    if (isEdit) {
      resetForm({ values })
      router.refresh()
    } else {
      router.push("/admin/blogs")
      router.refresh()
    }
  }

  return (
    <Formik
      initialValues={blog ?? BLANK}
      validationSchema={blogSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched, values, setFieldValue, dirty }) => (
        <Form noValidate className="space-y-6">
          <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link
                href="/admin/blogs"
                className="mb-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                All posts
              </Link>
              <h1 className="font-heading truncate text-2xl font-bold tracking-tight">
                {isEdit ? values.title || "Untitled post" : "New post"}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isEdit && values.isPublished ? (
                <Button type="button" variant="outline" asChild>
                  <a href={`/blogs/${values.slug}`} target="_blank" rel="noopener noreferrer">
                    View <ExternalLink />
                  </a>
                </Button>
              ) : null}
              <Button
                type="submit"
                disabled={isSubmitting || uploading || (isEdit && !dirty)}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save />
                    {isEdit ? "Save changes" : "Create post"}
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
                      placeholder="What changed in the 2026 VAT rules"
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
                  value={values.content}
                  onChange={(html) => setFieldValue("content", html)}
                  placeholder="Write the post…"
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta title</Label>
                <Field name="metaTitle">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="metaTitle"
                      placeholder={values.title || "Falls back to the post title"}
                      aria-invalid={Boolean(touched.metaTitle && errors.metaTitle)}
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
                <p className="text-xs text-muted-foreground">
                  {values.metaTitle.length}/70 characters
                </p>
                {touched.metaTitle && errors.metaTitle ? (
                  <p className="text-xs text-destructive">{errors.metaTitle}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">
                  Meta description
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (also used as the card excerpt)
                  </span>
                </Label>
                <Field name="metaDescription">
                  {({ field }: FieldProps) => (
                    <Textarea
                      {...field}
                      id="metaDescription"
                      rows={3}
                      aria-invalid={Boolean(touched.metaDescription && errors.metaDescription)}
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
                <p className="text-xs text-muted-foreground">
                  {values.metaDescription.length}/160 characters
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
                      placeholder="https://…/share.png"
                      aria-invalid={Boolean(touched.ogImage && errors.ogImage)}
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
                <p className="text-xs text-muted-foreground">
                  1200×630. Falls back to the cover image, then the site default.
                </p>
                {touched.ogImage && errors.ogImage ? (
                  <p className="text-xs text-destructive">{errors.ogImage}</p>
                ) : null}
              </div>
            </TabsContent>

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
                  Public URL: <code>/blogs/{values.slug || "…"}</code>
                  {!slugLocked ? " · auto-generated from the title" : null}
                </p>
                {touched.slug && errors.slug ? (
                  <p className="text-xs text-destructive">{errors.slug}</p>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Field name="author">
                    {({ field }: FieldProps) => (
                      <Input {...field} id="author" disabled={isSubmitting} />
                    )}
                  </Field>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Publish date</Label>
                  <Field name="publishedAt">
                    {({ field }: FieldProps) => (
                      <Input {...field} id="publishedAt" type="date" disabled={isSubmitting} />
                    )}
                  </Field>
                  <p className="text-xs text-muted-foreground">
                    Set automatically when first published.
                  </p>
                </div>
              </div>

              <ImageUploadField
                name="coverImage"
                label="Cover image"
                help="16:9. Shown on cards and at the top of the post."
                aspect="16 / 9"
                disabled={isSubmitting}
                onUploadingChange={setUploading}
              />

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
                      ? "Live at /blogs."
                      : "Draft — hidden from the listing and from search engines."}
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
