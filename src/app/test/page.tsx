"use client"

/**
 * TEMPORARY component gallery — /test
 *
 * Renders every shared component and theme token in one place so we can eyeball
 * the design system before wiring it to real data. Not linked from anywhere.
 * DELETE THIS ROUTE before the site goes live.
 *
 * It's a Client Component only so the interactive demos (ConfirmDialog, toast)
 * can take function props; nothing here depends on client rendering otherwise.
 */

import * as React from "react"
import {
  Building2,
  Globe,
  Layers,
  Pencil,
  Plus,
  Receipt,
  Rocket,
  Scale,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Toaster } from "@/components/ui/sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Section, SectionHeading } from "@/components/ui/section"
import { Container } from "@/components/ui/container"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/ui/status-badge"

import { ServiceCard } from "@/components/public/service-card"
import { BlogCard } from "@/components/public/blog-card"
import { StepCard } from "@/components/public/step-card"
import { ReviewCard } from "@/components/public/review-card"
import { Pagination } from "@/components/public/pagination"

import { PageHeader } from "@/components/admin/page-header"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"

/* ------------------------------------------------------------------ helpers */

function Block({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="border-t py-10 first:border-t-0">
      <div className="mb-5">
        <h2 className="font-heading text-lg font-bold tracking-tight">{title}</h2>
        {hint ? <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  )
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-16 rounded-lg ring-1 ring-foreground/10 ${className}`} />
      <code className="text-[11px] text-muted-foreground">{name}</code>
    </div>
  )
}

/* --------------------------------------------------------------- fixtures */

const SERVICES = [
  {
    title: "Intellectual Property",
    description:
      "Trademark, patent and copyright registration, plus enforcement and portfolio management.",
    icon: Scale,
    pageCount: 6,
  },
  {
    title: "Startup & License",
    description:
      "Company formation, trade licences and every permit needed to start trading legally.",
    icon: Rocket,
    pageCount: 4,
  },
  {
    title: "Taxation",
    description: "VAT registration, income tax filing, and year-round compliance advisory.",
    icon: Receipt,
    pageCount: 5,
  },
  {
    title: "Foreign Entity",
    description:
      "Branch and liaison office setup, foreign investment approval and repatriation.",
    icon: Globe,
    pageCount: 3,
  },
  {
    title: "Others",
    description: "Bespoke advisory work that doesn't fit neatly into the categories above.",
    icon: Layers,
    pageCount: 2,
  },
]

const STEPS = [
  {
    title: "Choose a company structure",
    description:
      "Private limited, branch office or liaison office — each has different ownership and reporting duties.",
  },
  {
    title: "Clear the company name",
    description:
      "Apply to RJSC for name clearance. The name is reserved for a limited window once approved.",
  },
  {
    title: "Draft the constitution",
    description: "Prepare the Memorandum and Articles of Association covering scope and shares.",
  },
  {
    title: "Open a bank account",
    description:
      "Foreign shareholders must remit paid-up capital and obtain an encashment certificate.",
  },
  {
    title: "Register with RJSC",
    description: "File incorporation documents and receive the certificate of incorporation.",
  },
  {
    title: "Post-registration licences",
    description: "Trade licence, TIN, BIN/VAT registration and any sector-specific permits.",
  },
]

const REVIEWS = [
  {
    authorName: "Farhana Rahman",
    authorTitle: "Managing Director, Nexus Textiles",
    rating: 5,
    quote:
      "They registered our trademark portfolio across three classes in under two months. Clear advice, no surprises on the invoice.",
  },
  {
    authorName: "David Chen",
    authorTitle: "Regional Head, Meridian Logistics",
    rating: 5,
    quote:
      "Setting up a foreign branch office looked impossible from abroad. They handled RJSC, the bank account and BIDA approval end to end.",
  },
  {
    authorName: "Tanvir Ahmed",
    authorTitle: "Founder, Shodai",
    rating: 4,
    quote:
      "Straightforward VAT registration and genuinely useful ongoing compliance reminders. Responsive whenever we had questions.",
  },
]

const BLOGS = [
  {
    title: "What changed in the 2026 VAT compliance rules",
    excerpt:
      "The threshold for mandatory BIN registration moved again this year. Here's what it means for small importers and how to prepare before the next filing window.",
    author: "Tanvir Ahmed",
    publishedAt: "2026-07-14",
    coverImage: null,
  },
  {
    title: "Branch office vs. subsidiary: picking the right structure",
    excerpt:
      "Liability, tax treatment and repatriation rules differ sharply between the two. A practical comparison for foreign investors.",
    author: "Farhana Rahman",
    publishedAt: "2026-06-02",
    coverImage: null,
  },
  {
    title: "Trademark oppositions: what to do when yours is challenged",
    excerpt:
      "An opposition is not a rejection. The timelines are tight, though, and missing one is usually fatal to the application.",
    author: "Nusrat Jahan",
    publishedAt: "2026-05-21",
    coverImage: null,
  },
]

const SAMPLE_HTML = `
  <h2>Who needs a trade licence?</h2>
  <p>Every business operating within a city corporation or municipality must hold a valid
  trade licence, <strong>renewed annually</strong>. This applies whether you trade from an
  office, a warehouse or your home.</p>
  <h3>Documents required</h3>
  <ul>
    <li>Completed application form, signed by the proprietor</li>
    <li>National ID or passport copy</li>
    <li>Proof of premises — rental agreement or ownership deed</li>
    <li>Recent passport-size photographs</li>
  </ul>
  <blockquote>Applications submitted with an unregistered rental agreement are the single
  most common cause of delay.</blockquote>
  <h3>Fees at a glance</h3>
  <table>
    <thead><tr><th>Business type</th><th>Annual fee</th></tr></thead>
    <tbody>
      <tr><td>Sole proprietorship</td><td>BDT 1,000 – 3,000</td></tr>
      <tr><td>Private limited</td><td>BDT 5,000 – 15,000</td></tr>
    </tbody>
  </table>
  <p>See the <a href="#">full checklist</a> for sector-specific requirements.</p>
`

/* ------------------------------------------------------------------- page */

export default function TestPage() {
  const [page, setPage] = React.useState(4)

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      {/* banner */}
      <div className="bg-warning/10 py-2 text-center text-sm text-warning">
        Temporary component gallery — delete <code>src/app/test</code> before launch.
      </div>

      {/* hero, demonstrating .section-dark */}
      <Section tone="dark">
        <SectionHeading
          as="h1"
          eyebrow="Component gallery"
          title="Design system preview"
          description="Every shared component and theme token, rendered with placeholder data. Navy + gold, light mode only."
        />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-brand-gold-dark">
            Primary action
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/25 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
          >
            Secondary action
          </Button>
        </div>
      </Section>

      <Container className="py-4">
        {/* ---------------------------------------------------------- tokens */}
        <Block title="Color tokens" hint="Defined in globals.css — the only place raw hex is allowed.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            <Swatch name="--brand-navy" className="bg-brand-navy" />
            <Swatch name="--brand-navy-light" className="bg-brand-navy-light" />
            <Swatch name="--brand-gold" className="bg-brand-gold" />
            <Swatch name="--brand-gold-dark" className="bg-brand-gold-dark" />
            <Swatch name="--muted" className="bg-muted" />
            <Swatch name="--border" className="bg-border" />
            <Swatch name="--success" className="bg-success" />
            <Swatch name="--warning" className="bg-warning" />
            <Swatch name="--destructive" className="bg-destructive" />
            <Swatch name="--foreground" className="bg-foreground" />
            <Swatch name="--background" className="bg-background" />
            <Swatch name="--sidebar" className="bg-sidebar" />
          </div>
        </Block>

        {/* ------------------------------------------------------ typography */}
        <Block title="Typography" hint=".heading-1 / .heading-2 / .heading-3 / .lead / .eyebrow">
          <div className="space-y-4">
            <p className="eyebrow">Eyebrow label</p>
            <h1 className="heading-1">Heading one — hero scale</h1>
            <h2 className="heading-2">Heading two — section titles</h2>
            <h3 className="heading-3">Heading three — card titles</h3>
            <p className="lead">
              Lead paragraph. Used for section intros and hero subtext, one step larger than
              body copy and set in muted foreground.
            </p>
            <p className="max-w-2xl text-base leading-relaxed">
              Body copy. Default size and line height for long-form text outside the rich text
              editor.
            </p>
          </div>
        </Block>

        {/* --------------------------------------------------------- buttons */}
        <Block title="Buttons" hint="shadcn variants × sizes">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add">
                <Plus />
              </Button>
              <Button size="icon-sm" variant="outline" aria-label="Edit">
                <Pencil />
              </Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => toast.success("Saved successfully")}>Toast success</Button>
              <Button variant="outline" onClick={() => toast.error("Something went wrong")}>
                Toast error
              </Button>
            </div>
          </div>
        </Block>

        {/* ---------------------------------------------------------- badges */}
        <Block title="Badges & status" hint="StatusBadge maps every boolean state to one look.">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status="published" />
              <StatusBadge status="draft" />
              <StatusBadge status="active" />
              <StatusBadge status="inactive" />
              <StatusBadge status="unread" />
              <StatusBadge status="read" />
            </div>
          </div>
        </Block>

        {/* ----------------------------------------------------- form inputs */}
        <Block title="Form controls" hint="Will be wrapped by Formik field components later.">
          <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="demo-title">Title</Label>
              <Input id="demo-title" placeholder="Trademark registration" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-slug">Slug</Label>
              <Input id="demo-slug" defaultValue="trademark-registration" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-menu">Parent menu</Label>
              <Select>
                <SelectTrigger id="demo-menu" className="w-full">
                  <SelectValue placeholder="Select a menu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ip">Intellectual Property</SelectItem>
                  <SelectItem value="startup">Startup &amp; License</SelectItem>
                  <SelectItem value="tax">Taxation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-invalid">With error</Label>
              <Input id="demo-invalid" aria-invalid defaultValue="not-a-slug!" />
              <p className="text-xs text-destructive">Slug may only contain letters, numbers and hyphens.</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="demo-meta">Meta description</Label>
              <Textarea id="demo-meta" rows={3} placeholder="Shown in search results…" />
            </div>
            <div className="flex items-center gap-6 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Switch id="demo-published" />
                <Label htmlFor="demo-published">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="demo-featured" />
                <Label htmlFor="demo-featured">Featured</Label>
              </div>
            </div>
          </div>
        </Block>

        {/* ------------------------------------------------ feedback states */}
        <Block title="Feedback states" hint="Spinner + EmptyState.">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card-surface flex items-center justify-center gap-6 p-8">
              <Spinner size="sm" />
              <Spinner />
              <Spinner size="lg" />
            </div>
            <EmptyState
              title="No reviews yet"
              description="Testimonials you add will appear on the homepage."
              action={
                <Button size="sm">
                  <Plus /> Add review
                </Button>
              }
            />
          </div>
        </Block>

        {/* --------------------------------------------------- service cards */}
        <Block title="ServiceCard" hint="Homepage Main Services grid + menu landing pages.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <ServiceCard
                key={s.title}
                href="#"
                title={s.title}
                description={s.description}
                icon={s.icon}
                pageCount={s.pageCount}
              />
            ))}
          </div>
        </Block>

        {/* ------------------------------------------------------ blog cards */}
        <Block title="BlogCard" hint="Third card has no cover image — shows the gradient fallback.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BLOGS.map((b) => (
              <BlogCard
                key={b.title}
                href="#"
                title={b.title}
                excerpt={b.excerpt}
                author={b.author}
                publishedAt={b.publishedAt}
                coverImage={b.coverImage}
              />
            ))}
          </div>
        </Block>

        {/* ---------------------------------------------------------- steps */}
        <Block title="StepCard" hint="How to open a company in Bangladesh.">
          <div className="grid gap-7 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <StepCard key={s.title} step={i + 1} title={s.title} description={s.description} />
            ))}
          </div>
        </Block>

        {/* -------------------------------------------------------- reviews */}
        <Block title="ReviewCard" hint="Admin-entered testimonials — homepage only.">
          <div className="grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <ReviewCard key={r.authorName} {...r} />
            ))}
          </div>
        </Block>

        {/* ----------------------------------------------------- pagination */}
        <Block title="Pagination" hint="Link-based, works without JS. Buttons below simulate navigation.">
          <div className="space-y-5">
            <Pagination currentPage={page} totalPages={12} basePath="#" />
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Simulate prev
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(12, p + 1))}>
                Simulate next
              </Button>
            </div>
            <div className="border-t pt-5">
              <p className="mb-3 text-sm text-muted-foreground">Few pages (no ellipsis):</p>
              <Pagination currentPage={2} totalPages={4} basePath="#" />
            </div>
          </div>
        </Block>

        {/* ---------------------------------------------------- admin chrome */}
        <Block title="Admin: PageHeader, Table, ConfirmDialog, Dialog">
          <div className="space-y-6">
            <PageHeader
              title="Reviews"
              description="Testimonials shown in the Customer Review section of the homepage."
              action={
                <Button>
                  <Plus /> New review
                </Button>
              }
            />

            <div className="card-surface overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {REVIEWS.map((r, i) => (
                    <TableRow key={r.authorName}>
                      <TableCell>
                        <div className="font-medium">{r.authorName}</div>
                        <div className="text-xs text-muted-foreground">{r.authorTitle}</div>
                      </TableCell>
                      <TableCell>{r.rating} / 5</TableCell>
                      <TableCell>
                        <StatusBadge status={i === 2 ? "inactive" : "active"} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon-sm" variant="outline" aria-label="Edit">
                            <Pencil />
                          </Button>
                          <ConfirmDialog
                            title="Delete this review?"
                            description={`"${r.authorName}" will be removed from the homepage. This cannot be undone.`}
                            onConfirm={async () => {
                              await new Promise((r) => setTimeout(r, 700))
                              toast.success("Review deleted")
                            }}
                          >
                            <Button size="icon-sm" variant="destructive" aria-label="Delete">
                              <Trash2 />
                            </Button>
                          </ConfirmDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Building2 /> Open form modal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New review</DialogTitle>
                    <DialogDescription>
                      Small forms use a modal — no detail route. See convention 9 in CLAUDE.md.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="m-name">Author name</Label>
                      <Input id="m-name" placeholder="Farhana Rahman" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-quote">Quote</Label>
                      <Textarea id="m-quote" rows={3} placeholder="Plain text — no rich text here." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Save review</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Block>

        {/* ----------------------------------------------------------- tabs */}
        <Block title="Tabs">
          <Tabs defaultValue="content" className="max-w-xl">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="pt-4 text-sm text-muted-foreground">
              The rich text editor will live here.
            </TabsContent>
            <TabsContent value="seo" className="pt-4 text-sm text-muted-foreground">
              Meta title, meta description and OG image.
            </TabsContent>
            <TabsContent value="settings" className="pt-4 text-sm text-muted-foreground">
              Slug, order and published state.
            </TabsContent>
          </Tabs>
        </Block>

        {/* -------------------------------------------------- prose-content */}
        <Block
          title=".prose-content"
          hint="Styles the HTML that Tiptap produces. Without it, every service page renders unstyled."
        >
          <div
            className="prose-content card-surface max-w-3xl p-6"
            dangerouslySetInnerHTML={{ __html: SAMPLE_HTML }}
          />
        </Block>
      </Container>

      {/* section tones */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Section tone"
          title="Muted section"
          description="Uses .section-alt — alternating background so consecutive blocks stay visually separated."
        />
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Section tone"
          title="Default section, left aligned"
          description="SectionHeading supports left and center alignment."
        />
      </Section>

      <Section tone="dark">
        <SectionHeading
          eyebrow="Section tone"
          title="Dark section"
          description="Navy background. Note .lead and .card-surface are re-toned automatically inside it."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {SERVICES.slice(0, 3).map((s) => (
            <div key={s.title} className="card-surface p-6">
              <h3 className="heading-3 mb-2">{s.title}</h3>
              <p className="text-sm opacity-80">{s.description}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
