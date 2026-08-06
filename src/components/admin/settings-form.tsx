"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  Formik,
  Form,
  FieldArray,
  getIn,
  useFormikContext,
  type FormikHelpers,
} from "formik"
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/validation"

/**
 * Tiptap touches `window` on import, so it must never be evaluated on the
 * server. ssr:false is only legal inside a Client Component — hence this file.
 */
const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-lg border bg-muted/40" aria-hidden="true" />
    ),
  }
)

/**
 * Every field on this form is a dotted path into a nested object
 * (`hero.heading`, `howTo.steps.0.title`). Reading `errors.hero?.heading`
 * off Formik's nested error type is unusable at this many fields, so one small
 * field component resolves value/error/touched through Formik's `getIn` and
 * every section just names its paths.
 */
function SettingField({
  name,
  label,
  placeholder,
  help,
  rows,
  type,
  required,
}: {
  name: string
  label: string
  placeholder?: string
  help?: React.ReactNode
  /** Renders a Textarea instead of an Input. */
  rows?: number
  type?: "text" | "number"
  required?: boolean
}) {
  const { values, errors, touched, isSubmitting, handleChange, handleBlur } =
    useFormikContext<SiteSettingsInput>()

  // null and undefined would flip a controlled input to uncontrolled.
  const value = getIn(values, name) ?? ""
  const error = getIn(touched, name) ? getIn(errors, name) : undefined
  const shared = {
    id: name,
    name,
    value,
    placeholder,
    onChange: handleChange,
    onBlur: handleBlur,
    "aria-invalid": Boolean(error),
    disabled: isSubmitting,
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>

      {rows ? (
        <Textarea {...shared} rows={rows} />
      ) : (
        <Input {...shared} type={type ?? "text"} />
      )}

      {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
      {error ? <p className="text-xs text-destructive">{String(error)}</p> : null}
    </div>
  )
}

/** One titled block inside a tab. */
function Group({
  title,
  description,
  children,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="card-surface space-y-5 p-5">
      <div>
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function SettingsForm({ settings }: { settings: SiteSettingsInput }) {
  const router = useRouter()
  const [formError, setFormError] = React.useState<string | null>(null)

  async function handleSubmit(
    values: SiteSettingsInput,
    { setErrors, resetForm }: FormikHelpers<SiteSettingsInput>
  ) {
    setFormError(null)

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.success) {
      if (json?.fieldErrors) setErrors(json.fieldErrors)
      setFormError(json?.error ?? "Something went wrong.")
      return
    }

    toast.success("Settings saved")
    // Reseed from the response so cleared fields settle at the value the server
    // actually stored, and drop the dirty flag.
    resetForm({ values: json.data ?? values })
    router.refresh()
  }

  return (
    <Formik
      initialValues={settings}
      validationSchema={siteSettingsSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue, dirty }) => (
        <Form noValidate className="space-y-6">
          <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-bold tracking-tight">Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything on the homepage plus site-wide contact and SEO details. Changes
                appear on the public site within a minute.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="outline" asChild>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  View site <ExternalLink />
                </a>
              </Button>
              <Button type="submit" disabled={isSubmitting || !dirty}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save />
                    Save changes
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

          <Tabs defaultValue="hero">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* ------------------------------------------------------- hero */}
            <TabsContent value="hero" className="space-y-5 pt-5">
              <Group
                title="Hero"
                description="The first section on the homepage, above everything else."
              >
                <SettingField
                  name="hero.heading"
                  label="Heading"
                  required
                  placeholder="Your business, legally sound."
                />
                <SettingField
                  name="hero.subheading"
                  label="Subheading"
                  rows={3}
                  placeholder="One or two sentences explaining what you do."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <SettingField
                    name="hero.ctaLabel"
                    label="Button label"
                    placeholder="Book a consultation"
                  />
                  <SettingField
                    name="hero.ctaHref"
                    label="Button link"
                    placeholder="#contact"
                    help="A path (/blogs), an anchor (#contact), or a full URL."
                  />
                </div>

                <SettingField
                  name="hero.backgroundImage"
                  label="Background image URL"
                  placeholder="https://…/office.jpg"
                  help="Optional. Darkened automatically so the heading stays readable."
                />
              </Group>
            </TabsContent>

            {/* ------------------------------------------------------ about */}
            <TabsContent value="about" className="space-y-5 pt-5">
              <Group title="About us" description="Section 2 of the homepage.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <SettingField
                    name="aboutUs.eyebrow"
                    label="Eyebrow"
                    placeholder="About us"
                    help="Small gold label above the heading."
                  />
                  <SettingField
                    name="aboutUs.heading"
                    label="Heading"
                    required
                    placeholder="Who we are"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Body</Label>
                  <RichTextEditor
                    value={values.aboutUs.body ?? ""}
                    onChange={(html) => setFieldValue("aboutUs.body", html)}
                    placeholder="Tell visitors who you are…"
                  />
                  <p className="text-xs text-muted-foreground">
                    Rendered inside <code>.prose-content</code> and sanitized before display.
                  </p>
                </div>

                <SettingField
                  name="aboutUs.image"
                  label="Image URL"
                  placeholder="https://…/team.jpg"
                />
              </Group>
            </TabsContent>

            {/* --------------------------------------------------- sections */}
            <TabsContent value="sections" className="space-y-5 pt-5">
              <Group
                title="Main services"
                description="Only the headings live here — the service cards themselves are the Menu collection, so adding a menu updates the navbar and this section together."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <SettingField
                    name="mainServices.eyebrow"
                    label="Eyebrow"
                    placeholder="What we do"
                  />
                  <SettingField
                    name="mainServices.heading"
                    label="Heading"
                    required
                    placeholder="Our services"
                  />
                </div>
                <SettingField
                  name="mainServices.description"
                  label="Description"
                  rows={2}
                />
              </Group>

              <Group
                title="How to open a company"
                description="An ordered list of steps. They render in the order shown here."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <SettingField
                    name="howTo.eyebrow"
                    label="Eyebrow"
                    placeholder="Step by step"
                  />
                  <SettingField
                    name="howTo.heading"
                    label="Heading"
                    required
                    placeholder="How to open a company in Bangladesh"
                  />
                </div>
                <SettingField name="howTo.description" label="Description" rows={2} />

                <FieldArray name="howTo.steps">
                  {({ push, remove, move }) => {
                    const steps = values.howTo.steps ?? []

                    return (
                      <div className="space-y-3">
                        <Label>Steps</Label>

                        {steps.length === 0 ? (
                          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                            No steps yet. The section is hidden from the homepage until you
                            add one.
                          </p>
                        ) : null}

                        {steps.map((_, index) => (
                          <div key={index} className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Step {index + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  aria-label={`Move step ${index + 1} up`}
                                  disabled={index === 0 || isSubmitting}
                                  onClick={() => move(index, index - 1)}
                                >
                                  <ArrowUp />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  aria-label={`Move step ${index + 1} down`}
                                  disabled={index === steps.length - 1 || isSubmitting}
                                  onClick={() => move(index, index + 1)}
                                >
                                  <ArrowDown />
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon-sm"
                                  aria-label={`Remove step ${index + 1}`}
                                  disabled={isSubmitting}
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <SettingField
                                name={`howTo.steps.${index}.title`}
                                label="Title"
                                required
                                placeholder="Reserve a company name"
                              />
                              <SettingField
                                name={`howTo.steps.${index}.description`}
                                label="Description"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmitting}
                          onClick={() => push({ title: "", description: "" })}
                        >
                          <Plus /> Add step
                        </Button>
                      </div>
                    )
                  }}
                </FieldArray>
              </Group>

              <Group
                title="Customer reviews"
                description="Headings for the testimonials section. The testimonials themselves are managed under Reviews."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <SettingField
                    name="reviewsSection.eyebrow"
                    label="Eyebrow"
                    placeholder="Testimonials"
                  />
                  <SettingField
                    name="reviewsSection.heading"
                    label="Heading"
                    required
                    placeholder="What our clients say"
                  />
                </div>
                <SettingField
                  name="reviewsSection.description"
                  label="Description"
                  rows={2}
                />

                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm font-medium">Google rating badge</p>
                  <p className="mt-1 mb-4 text-xs text-muted-foreground">
                    Maintained by hand — nothing is fetched from Google at render time.
                    Leave the rating empty to hide the badge.
                  </p>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <SettingField
                      name="reviewsSection.googleRatingValue"
                      label="Rating"
                      type="number"
                      placeholder="4.9"
                    />
                    <SettingField
                      name="reviewsSection.googleReviewCount"
                      label="Review count"
                      type="number"
                      placeholder="128"
                    />
                    <SettingField
                      name="reviewsSection.googleListingUrl"
                      label="Listing URL"
                      placeholder="https://g.page/…"
                    />
                  </div>
                </div>
              </Group>
            </TabsContent>

            {/* ---------------------------------------------------- contact */}
            <TabsContent value="contact" className="space-y-5 pt-5">
              <Group
                title="Contact section"
                description="Headings and the details shown beside the homepage contact form."
              >
                <SettingField
                  name="contact.heading"
                  label="Heading"
                  required
                  placeholder="Talk to us"
                />
                <SettingField name="contact.description" label="Description" rows={2} />

                <div className="grid gap-5 sm:grid-cols-2">
                  <SettingField
                    name="contact.email"
                    label="Email"
                    placeholder="hello@example.com"
                  />
                  <SettingField
                    name="contact.phone"
                    label="Phone"
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>

                <SettingField name="contact.address" label="Address" rows={2} />
                <SettingField
                  name="contact.mapEmbedUrl"
                  label="Map embed URL"
                  placeholder="https://www.google.com/maps/embed?…"
                  help="The src from Google Maps → Share → Embed a map, not the page URL."
                />
              </Group>
            </TabsContent>

            {/* ----------------------------------------------------- footer */}
            <TabsContent value="footer" className="space-y-5 pt-5">
              <Group
                title="Footer"
                description="Shown at the bottom of every public page. Leave a social link empty to hide its icon."
              >
                <SettingField
                  name="footer.about"
                  label="About blurb"
                  rows={3}
                  placeholder="A sentence or two about the firm."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <SettingField
                    name="footer.facebook"
                    label="Facebook"
                    placeholder="https://facebook.com/…"
                  />
                  <SettingField
                    name="footer.linkedin"
                    label="LinkedIn"
                    placeholder="https://linkedin.com/company/…"
                  />
                  <SettingField
                    name="footer.twitter"
                    label="X / Twitter"
                    placeholder="https://x.com/…"
                  />
                  <SettingField
                    name="footer.youtube"
                    label="YouTube"
                    placeholder="https://youtube.com/@…"
                  />
                </div>
              </Group>
            </TabsContent>

            {/* -------------------------------------------------------- seo */}
            <TabsContent value="seo" className="space-y-5 pt-5">
              <Group
                title="Default SEO"
                description="Used wherever a page or blog post hasn't set its own."
              >
                <SettingField
                  name="seo.defaultTitle"
                  label="Default title"
                  placeholder="Your firm — company formation and IP in Bangladesh"
                  help={`${(values.seo.defaultTitle ?? "").length}/70 characters`}
                />
                <SettingField
                  name="seo.defaultDescription"
                  label="Default description"
                  rows={3}
                  help={`${(values.seo.defaultDescription ?? "").length}/160 characters`}
                />
                <SettingField
                  name="seo.defaultOgImage"
                  label="Default share image"
                  placeholder="https://…/share-image.png"
                  help="1200×630. The last fallback for every page's social preview."
                />
              </Group>
            </TabsContent>
          </Tabs>
        </Form>
      )}
    </Formik>
  )
}
