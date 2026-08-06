# CLAUDE.md

Project documentation for the **Consultancy CMS** — read this before making changes.

## Overview

A public-facing business consultancy website backed by a protected admin panel that manages all of
its content. Services, sub-menus, pages, and blog posts are stored in MongoDB and rendered
dynamically.

> **Guiding constraint:** an admin must never need a code change to add a new service, sub-menu, or
> page. If a feature requires editing source to add content, the design is wrong.

## Stack

Versions below are what is **actually installed**, not aspirational.

| Layer | Choice | Notes |
| --- | --- | --- |
| Runtime | Node 26 / npm 11.3 | |
| Framework | Next.js **15.5.22** (App Router) | Turbopack enabled for `dev` *and* `build`. Server Components by default; `"use client"` only where needed |
| UI runtime | React **19.1** | |
| Language | TypeScript 5 | `src/` dir, `@/*` import alias |
| Backend | Next.js Route Handlers | **No separate Express server.** `src/app/api/**/route.ts` is the API |
| Database | MongoDB + Mongoose **9.9** | Local MongoDB 8.3 on `localhost:27017`. Single connection, globally cached |
| Styling | Tailwind CSS **v4** | **CSS-first — there is no `tailwind.config.ts`.** Tokens live in `@theme` inside `globals.css` |
| Components | shadcn/ui (radix base, nova preset) | Source copied into `components/ui/` — owned code, not a dependency. Config in `components.json` |
| Tables | `@tanstack/react-table` **v8** | Backs the shared admin `DataTable`. v8 on purpose — see Gotchas |
| Drag & drop | `@dnd-kit` (core / sortable / modifiers) | Row reordering in `DataTable` |
| Auth | NextAuth **v5** (`next-auth@5.0.0-beta`) | Credentials provider, admin only. **v5 API differs from v4** — see Gotchas |
| Forms | Formik + Yup | Same Yup schema reused server-side |
| Rich text | Tiptap **v3** | Chosen over React-Quill (unmaintained, React 19 friction). Wrapped in `RichTextEditor` so it stays swappable |
| Icons | lucide-react | |
| Sanitizing | isomorphic-dompurify | For admin-authored HTML before render |

## Folder layout

```
consultency/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                        # /
│   │   │   ├── [menuSlug]/page.tsx             # service landing (lists sub-pages)
│   │   │   ├── [menuSlug]/[pageSlug]/page.tsx  # service sub-page
│   │   │   ├── blogs/page.tsx                  # blog listing (paginated)
│   │   │   └── blogs/[slug]/page.tsx           # blog detail
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── menus/page.tsx                              # CRUD + reorder
│   │   │   ├── menus/[menuId]/pages/page.tsx               # pages under a menu
│   │   │   ├── menus/[menuId]/pages/[pageId]/page.tsx      # page editor
│   │   │   ├── blogs/page.tsx                              # CRUD list
│   │   │   ├── blogs/[blogId]/page.tsx                     # blog editor
│   │   │   ├── reviews/page.tsx                            # list + create/view/edit modals
│   │   │   ├── submissions/page.tsx                        # inbox + view modal
│   │   │   └── settings/page.tsx                           # home sections + site info
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── menus/route.ts                  # GET, POST
│   │   │   ├── menus/[menuId]/route.ts         # PUT, DELETE  (NOT [id] — see Gotchas)
│   │   │   ├── menus/[menuId]/pages/route.ts   # GET, POST
│   │   │   ├── pages/[id]/route.ts             # PUT, DELETE
│   │   │   ├── blogs/route.ts                  # GET, POST
│   │   │   ├── blogs/[id]/route.ts             # PUT, DELETE
│   │   │   ├── reviews/route.ts                # GET, POST
│   │   │   ├── reviews/[id]/route.ts           # PUT, DELETE
│   │   │   ├── contact/route.ts                # POST (public, rate-limited)
│   │   │   ├── submissions/[id]/route.ts       # PATCH, DELETE (admin)
│   │   │   └── settings/route.ts               # GET, PUT (singleton)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/        # shadcn/ui primitives — shared, importable by admin and public
│   │   ├── admin/     # AdminShell, DataTable (TanStack), MenuDialog, ReviewDialog,
│   │   │              # SubmissionDialog, PageForm, BlogForm, SettingsForm,
│   │   │              # RichTextEditor, ConfirmDialog, StatusBadge, PageHeader, EmptyState
│   │   ├── public/    # Navbar, Footer, ServiceCard, BlogCard, Pagination
│   │   └── home/      # Hero, AboutUs, MainServices, HowToOpen, Reviews, ContactForm
│   ├── models/        # Menu.ts, Page.ts, Blog.ts, Admin.ts, Review.ts,
│   │                  # SiteSettings.ts, ContactSubmission.ts
│   ├── lib/           # db.ts, auth-guard.ts, api-response.ts, slugify.ts, format.ts,
│   │                  # metadata.ts, settings.ts, reorder.ts, rate-limit.ts,
│   │                  # sanitize.ts, queries.ts, validation/
│   ├── types/         # next-auth.d.ts (session/JWT augmentation)
│   ├── auth.config.ts # EDGE-SAFE NextAuth config — imported by middleware
│   ├── auth.ts        # Node-only NextAuth config — Credentials + Mongoose
│   └── middleware.ts  # NextAuth protection for /admin/* (in src/, not repo root)
├── scripts/seed.ts
├── .env.example
└── CLAUDE.md
```

Keep `components/admin/` and `components/public/` strictly separate — no cross-imports. Both may
import from `components/ui/` (shadcn primitives); `components/home/` is public-side only.

> **Status:** the tree above is now built, with two gaps. Every model, every API route, every
> admin screen and every public route in the map exists, including `components/home/` (all 7
> sections), `lib/metadata.ts` and `lib/settings.ts`.
> **Not written yet:** `sitemap.ts` / `robots.ts` (step 8), and the `loading.tsx` / `error.tsx`
> polish pass (step 9).
>
> `src/app/test/` is a temporary component gallery. Delete it before launch (build order step 9).
>
> The empty `backend/` and `frontend/` directories from the earlier layout were removed during
> `create-next-app`. The app lives at the root.

## Theme

**Navy + Gold, light mode only.** There is no `.dark` block and no theme toggle. The `dark` variant
is still *declared* in `globals.css` so shadcn primitives shipping `dark:` classes compile, but
nothing activates it. Don't add a `.dark` block without auditing every section.

All colors live in `src/app/globals.css`. **That file is the only place a raw hex is allowed** —
everywhere else must reference a semantic token.

| Token | Value | Use |
| --- | --- | --- |
| `--brand-navy` | `#0F2A4A` | primary brand |
| `--brand-navy-light` | `#1C4270` | hover states |
| `--brand-gold` | `#C9A227` | accent, CTAs, eyebrow text |
| `--primary` | → navy | buttons, headings on light |
| `--accent` | → gold | highlights |
| `--muted` | `#F5F7FA` | alternating section backgrounds |
| `--foreground` | `#0B1220` | body text |
| `--border` / `--input` | `#E2E8F0` | |
| `--success` / `--warning` / `--destructive` | green / amber / red | status badges |
| `--sidebar*` | navy shell, gold active | admin sidebar only |

Tailwind v4 exposes these as normal utilities: `bg-primary`, `text-accent`, `bg-brand-navy-light`,
`text-success`, etc.

### Project classes

Defined in `@layer components` in `globals.css`. Use these instead of retyping utility chains:

| Class | Purpose |
| --- | --- |
| `.container-x` | centered max-w-7xl + responsive gutters |
| `.section` / `.section-alt` / `.section-dark` | vertical rhythm; `-alt` muted bg, `-dark` navy bg |
| `.eyebrow` | small uppercase gold label above a heading |
| `.heading-1` / `.heading-2` / `.heading-3` | responsive type scale |
| `.lead` | intro paragraph |
| `.card-surface` / `.card-hover` | bordered card; hover lift |
| `.prose-content` | **styles Tiptap HTML** rendered via `dangerouslySetInnerHTML` |

`.prose-content` is load-bearing — it is the only thing between admin-authored HTML and unstyled
text on every service page and blog post. Apply it to the wrapper of any rendered `content` field.

## Data model

### `Menu` — main service categories

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | required |
| `slug` | string | unique (global), auto-generated from title |
| `order` | number | display sorting |
| `isActive` | boolean | default `true` |

Seeded defaults: Intellectual Property, Startup & License, Taxation, Foreign Entity, Others.
**These are editable seed rows, not hardcoded values** — the admin can rename, reorder, deactivate,
or delete any of them.

### `Page` — sub-menu pages under a Menu

| Field | Type | Notes |
| --- | --- | --- |
| `menuId` | ref → Menu | required |
| `title` | string | required |
| `slug` | string | unique **per menu**, auto-generated + editable |
| `metaTitle` | string | SEO |
| `metaDescription` | string | SEO |
| `ogImage` | string (URL) | social preview, 1200×630. Falls back to site default |
| `content` | HTML string | from Tiptap |
| `order` | number | |
| `isPublished` | boolean | default `false` |
| `createdAt` / `updatedAt` | date | timestamps |

### `Blog` — separate top-level collection

> **Blogs is NOT a Menu item.** It has no `menuId` and never appears under a Menu. It is its own
> content type with its own routes (`/blogs`, `/blogs/[slug]`).

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | required |
| `slug` | string | unique (global) |
| `metaTitle` | string | SEO |
| `metaDescription` | string | SEO |
| `ogImage` | string (URL) | social preview, 1200×630. Falls back to `coverImage`, then site default |
| `content` | HTML string | from Tiptap |
| `coverImage` | string (URL) | card/hero image — separate from `ogImage` (different aspect ratio) |
| `author` | string \| ref → Admin | |
| `isPublished` | boolean | |
| `publishedAt` | date | |
| `createdAt` / `updatedAt` | date | timestamps |

### `Review` — customer testimonials

> **Homepage only.** Reviews render in the Customer Review section of `/` and nowhere else — not on
> service pages, not on blogs. There is no public route and no public API for reviews, and no admin
> detail route either: create/view/edit all happen in a modal on `/admin/reviews`.
>
> Entered by the admin, **not** pulled from the Google Places API. That was a deliberate decision:
> Google caps responses at 5 non-selectable reviews, forbids storing them beyond ~30 days, bills
> per request on its priciest SKU, and offers no way to filter a bad one. See *Gotchas*.

| Field | Type | Notes |
| --- | --- | --- |
| `authorName` | string | required |
| `authorTitle` | string | role and/or company, e.g. "MD, Acme Ltd" |
| `avatar` | string (URL) | optional; fall back to initials |
| `rating` | number | 1–5, integer |
| `quote` | string | required. **Plain text, not rich text** — no Tiptap here |
| `order` | number | display sorting |
| `isActive` | boolean | default `true`; hides without deleting |
| `createdAt` / `updatedAt` | date | timestamps |

### `SiteSettings` — singleton

One document, never more. Holds the editable content for the homepage sections and site-wide info:
hero (heading, subheading, CTA label/href, background image), about us (heading, rich body, image),
"How to open a company in Bangladesh" (heading + ordered `steps[]` of `{ title, description }`),
Google rating badge (`ratingValue`, `reviewCount`, `listingUrl` — manually maintained), contact
details (email, phone, address, map embed URL), footer (links, socials), and default SEO/OG image.

Guard against duplicates: always read/write with `findOneAndUpdate({}, ..., { upsert: true })`.

### `ContactSubmission` — contact form entries

`name`, `email`, `phone`, `subject`, `message`, `isRead` (default `false`), `createdAt`.
Written by the public `POST /api/contact`; readable only by an authenticated admin.

### `Admin`

`email`, `passwordHash`, `name`, `role`. Passwords hashed with bcrypt — never store plaintext.

### Indexes

- `Menu.slug` — unique, global
- `Page` — compound unique on `{ menuId, slug }` (same slug may exist under different menus)
- `Blog.slug` — unique, global
- `Review` — `{ isActive: 1, order: 1 }` for the homepage query
- `ContactSubmission` — `{ createdAt: -1 }` for the inbox

## Route map

| Route | Type | Notes |
| --- | --- | --- |
| `/` | public | Home |
| `/[menuSlug]` | public | Lists the menu's published sub-pages. **If the menu has exactly one page, redirect to it.** `generateMetadata` |
| `/[menuSlug]/[pageSlug]` | public | Renders `content`. `generateMetadata` from `metaTitle`/`metaDescription` |
| `/blogs` | public | Paginated listing. `generateMetadata` |
| `/blogs/[slug]` | public | Blog detail. `generateMetadata` |
| `/admin/login` | admin | Only unprotected admin route |
| `/admin/dashboard` | admin | Overview / counts |
| `/admin/menus` | admin | Menu CRUD + reorder |
| `/admin/menus/[menuId]/pages` | admin | List / create / delete pages |
| `/admin/menus/[menuId]/pages/[pageId]` | admin | Page editor form |
| `/admin/blogs` | admin | Blog CRUD list |
| `/admin/blogs/[blogId]` | admin | Blog editor (+ cover image, published date) |
| `/admin/reviews` | admin | List + reorder + activate/deactivate. **Create, view, and edit all happen in a modal** — no detail route |
| `/admin/submissions` | admin | Contact form inbox; view in modal, mark read / delete |
| `/admin/settings` | admin | Homepage section content + site info (SiteSettings singleton) |
| `/api/menus` | api | `GET`, `POST` |
| `/api/menus/[menuId]` | api | `PUT`, `DELETE`. **Must be `[menuId]`, not `[id]`** — see Gotchas |
| `/api/menus/[menuId]/pages` | api | `GET`, `POST` |
| `/api/pages/[id]` | api | `GET`, `PUT`, `DELETE` |
| `/api/blogs` | api | `GET`, `POST` |
| `/api/blogs/[id]` | api | `PUT`, `DELETE` |
| `/api/reviews` | api | `GET`, `POST` |
| `/api/reviews/[id]` | api | `PUT`, `DELETE` |
| `/api/contact` | api | `POST` — **the only public write endpoint.** Rate-limit + honeypot |
| `/api/submissions/[id]` | api | `PATCH` (mark read), `DELETE` |
| `/api/settings` | api | `GET`, `PUT` (upsert singleton) |
| `/api/auth/[...nextauth]` | api | NextAuth handler |

Public routes must only ever return `isPublished: true` content.

## Home page composition

`/` renders these sections in order. Each is a component in `components/home/`, and **every one of
them reads its content from the database** — no copy is hardcoded in JSX.

| # | Section | Data source |
| --- | --- | --- |
| 1 | Hero | `SiteSettings.hero` |
| 2 | About Us | `SiteSettings.aboutUs` |
| 3 | Main Services | **`Menu` collection** (`isActive: true`, sorted by `order`) — reuses existing data, no new model |
| 4 | How to open a company in Bangladesh | `SiteSettings.howTo.steps[]` |
| 5 | Customer Review | `Review` collection (`isActive: true`, sorted by `order`) + optional Google rating badge from `SiteSettings` |
| 6 | Contact Form | Posts to `/api/contact` → `ContactSubmission` |
| 7 | Footer | `SiteSettings.footer` — shared with all public routes via layout |

Notes:
- Section 3 must not duplicate the menu list. Query `Menu` directly so adding a service updates the
  navbar and the homepage together.
- Section 5 shows admin-entered testimonials only. If you later want live Google reviews, swap the
  data source inside `components/home/Reviews.tsx` — nothing else should need to change.
- The Contact Form is a client component; everything else is a Server Component.
- Do **not** add `schema.org/Review` markup for your own organization — Google has ignored
  self-serving review markup since 2019 and it carries manual-action risk.

## Conventions

1. **Slugs** — auto-generate from title via `lib/slugify.ts`, but let the admin override the value
   before saving. Never silently rewrite a manually-set slug.
2. **Uniqueness is enforced server-side.** Client-side checks are a convenience only. Validate in
   the route handler *and* with a Mongoose unique index. Per-menu for pages, global for blogs.
3. **One Yup schema, two consumers.** Schemas live in `lib/validation/` and are imported by both the
   Formik form and the route handler. Never trust client-only validation.
4. **SEO** — every public page/blog route exports `generateMetadata` with title, description, and OG
   tags, built through the shared `lib/metadata.ts` helper so all four routes stay consistent.
   Image resolution order: `ogImage` → (`coverImage` for blogs) → `SiteSettings` default.
   Set `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!)` once in the root layout —
   without it, relative image paths stay relative and **scrapers silently render no preview**.
   Include `twitter: { card: "summary_large_image" }` alongside `openGraph`.
5. **Consistent API shape** — all responses go through `lib/api-response.ts` and return
   `{ success, data, error }`. No bare `NextResponse.json(doc)`.
6. **Auth on every mutation** — `POST`/`PUT`/`DELETE` handlers check for a valid admin session
   before touching the database. `middleware.ts` protects `/admin/*` pages and redirects to
   `/admin/login`; the middleware does **not** cover API routes, so guard them individually.
   **The single exception is `POST /api/contact`**, which is public by design — protect it with a
   honeypot field and rate limiting instead, and never let it return stored submissions.
7. **Env vars** — `MONGODB_URI`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, plus
   `SEED_ADMIN_*` for the seed script. **NextAuth v5 reads `AUTH_SECRET`, not `NEXTAUTH_SECRET`.**
   Keep `.env.example` in sync; never commit `.env.local`. `.gitignore` ignores `.env*` but
   re-includes `!.env.example` — don't remove that negation or setup docs break.
8. **Dynamic navigation** — the navbar is built server-side from the `Menu`/`Page` collections with
   `revalidate`. Never hardcode menu items in a component.
9. **Modal by default, route only when the content earns it.** Small forms — anything that fits on
   one screen without scrolling — use a shadcn `Dialog` on the list page. Do not create a detail
   route for them.

   | Entity | UI | Why |
   | --- | --- | --- |
   | Menu | modal | 4 fields |
   | Review | modal | 7 short fields, plain-text quote |
   | Contact submission | modal (read-only) | short message |
   | Page | full route | Tiptap rich text + SEO fields |
   | Blog | full route | Tiptap rich text + cover image + SEO fields |
   | Settings | full route | many grouped sections |

   Modal rules: keep the list as a Server Component and make only the dialog a client component;
   reset form state on close so a stale record never bleeds into the next open; refresh the list via
   `router.refresh()` after a successful mutation rather than mutating local state by hand.

## Task tracker

Features are built one at a time, in order. **Update this section as work lands** — it is the
single source of truth for what is and isn't done.

| # | Feature | Status |
| --- | --- | --- |
| 0 | Scaffold + theme + shared components | ✅ Done |
| 1 | Database foundation | ✅ Done |
| 2 | Admin authentication | ✅ Done |
| 3 | Menu CRUD | ✅ Done |
| 4 | Page CRUD | ✅ Done |
| 5 | Public navigation + service pages | ✅ Done |
| 6 | Blog CRUD + public blog | ✅ Done |
| 7 | Homepage (7 sections) | ✅ Done |
| 8 | SEO metadata + OG images | ⬜ Not started |
| 9 | Polish + remove `/test` | ⬜ Not started |

---

### ✅ 0. Scaffold, theme and shared components

- [x] Next 15 + TS + Tailwind v4 + ESLint at repo root (`src/`, `@/*` alias)
- [x] shadcn/ui init (`-b radix -p nova`) + 19 primitives in `components/ui/`
- [x] Navy + gold tokens, light-only, project classes in `globals.css`
- [x] Layout primitives — `Container`, `Section`, `SectionHeading`, `Spinner`, `EmptyState`,
      `StatusBadge`
- [x] Public cards — `ServiceCard`, `BlogCard`, `StepCard`, `ReviewCard`, `Pagination`
- [x] Admin chrome — `PageHeader`, `ConfirmDialog`
- [x] `lib/format.ts` (pinned-locale date formatting, avatar initials)
- [x] Temporary `/test` gallery rendering everything — **delete in step 9**

### ✅ 1. Database foundation

- [x] `lib/db.ts` — connection cached on `globalThis`, fail-fast timeout, retry on failure
- [x] All 7 models with hot-reload guards and indexes
- [x] `lib/api-response.ts` — `{success,data,error}` + `handleApiError()`
- [x] `lib/slugify.ts` — `slugify()`, `SLUG_PATTERN`, `uniqueSlug()`
- [x] `lib/validation/` — one Yup schema set for Formik *and* route handlers
- [x] `.env.example` + `.gitignore` negation, `.env.local` with generated `AUTH_SECRET`
- [x] `scripts/seed.ts` — idempotent, calls `syncIndexes()` on all models
- [x] Verified: seed twice = no change; uniqueness negative-tested; build/lint/tsc clean

### ✅ 2. Admin authentication

- [x] **Split config** — `auth.config.ts` (edge-safe, no providers) + `auth.ts` (Node, Credentials).
      Middleware imports only the former; importing `auth.ts` would pull Mongoose into the Edge
      bundle and fail the build
- [x] Credentials provider — `.select("+passwordHash")`, bcrypt compare, dummy compare on unknown
      email so timing can't be used to enumerate accounts
- [x] `app/api/auth/[...nextauth]/route.ts` → `export const { GET, POST } = handlers`
- [x] `/admin/login` (Formik + `loginSchema`), open-redirect guard on `callbackUrl`
- [x] `src/middleware.ts` protecting `/admin/*`, `/admin/login` excluded from the guard
- [x] `lib/auth-guard.ts` `requireAdmin()` for API routes
- [x] `AdminShell` + `AdminNav` + mobile `Sheet` nav, sign out via server action
- [x] `/admin/(protected)/` route group so login renders without the shell
- [x] `/admin/dashboard` with live counts; `/admin` redirects to it
- [x] Verified 17/17 over HTTP: wrong password rejected, session carries id/email/role,
      `passwordHash` never leaks, signed-in users bounced off the login page, public routes
      unaffected

### ✅ 3. Menu CRUD

- [x] `GET`/`POST /api/menus`, `PUT`/`DELETE /api/menus/[id]`, `PATCH /api/menus` (bulk reorder)
- [x] Every handler calls `requireAdmin()` — middleware does not cover `/api/*`
- [x] Server-side `menuSchema` validation + explicit slug check *and* the unique index
- [x] Shared `DataTable` (TanStack **v8**) with sorting, search and empty state
- [x] `MenuDialog` — slug auto-derives from title but locks the moment it's hand-edited
- [x] **Drag-and-drop reordering** (dnd-kit) → one `PATCH` rewriting orders as dense `0..n-1`
- [x] **Menu delete is BLOCKED while pages exist**, not cascaded — see decision below
- [x] Verified 23/23: 401 unauthenticated, 409 duplicate slug, 422 bad slug, no self-collision when
      re-saving an unchanged slug, reorder persists, 409 on delete-with-pages naming the count

> **Decision — deleting a menu with pages is blocked.** Cascading would destroy every page under it
> from a single click, with no undo. Blocking forces the admin to move or delete pages first, which
> is deliberate. `isActive: false` already covers "hide this from the site", which is what is
> usually actually wanted.

### ✅ 4. Page CRUD

- [x] `GET`/`POST /api/menus/[menuId]/pages`, `GET`/`PUT`/`DELETE /api/pages/[id]`
- [x] **`menuId` is taken from the URL, never the payload** — otherwise a client could create a
      page under a menu it wasn't targeting
- [x] Per-menu slug uniqueness in the handler *and* via the compound index; self excluded on update
- [x] `/admin/menus/[menuId]/pages` list + `new/` + full-route editor at `.../[pageId]`
- [x] Editor 404s if the page id belongs to a different menu than the URL
- [x] `RichTextEditor` — Tiptap v3, `immediatelyRender: false`, loaded via
      `dynamic(..., { ssr: false })`. No H1 button: the page title is the h1
- [x] Tabs: Content / SEO (with character counters) / Settings
- [x] Drag-and-drop reordering scoped to the menu being viewed
- [x] Verified 31/31, plus a 23/23 regression re-run of Menu CRUD after the route rename

### Reordering

Drag-and-drop, via `@dnd-kit`, built into the shared `DataTable`. Pass `getRowId`, `onReorder` and
`reorderLabel` to enable it; omit them and the table behaves as before. Reviews and blogs can adopt
it the same way.

| Concern | How it behaves |
| --- | --- |
| Endpoint | `PATCH /api/menus` · `PATCH /api/menus/[menuId]/pages` — both take `{ items: [{id, order}] }` |
| Payload validation | Shared `lib/reorder.ts` — rejects non-arrays, empty batches, bad ObjectIds, non-integer orders, duplicate ids, and batches over 500 |
| Order values | Rewritten dense `0..n-1` on every drag, so gaps never accumulate |
| Scoping | The pages endpoint filters on `menuId`, so ids from another menu match nothing and report `updated: 0` |
| Failure | `DataTable` reorders optimistically and **rolls back** if `onReorder` returns `false` or throws |
| Sorting conflict | Drag is disabled while a column sort or search filter is active — a list can't be both manually ordered and sorted by title |
| Accessibility | Handle is a real `<button>` with an accessible name; dnd-kit's `KeyboardSensor` makes reordering keyboard-operable |

Listeners are attached to the **grip handle only**, never the whole row — otherwise the row's links
and buttons stop being clickable.

### ✅ 5. Public navigation and service pages

- [x] Server-rendered `Navbar`/`Footer` built from `Menu`/`Page`, `revalidate = 60` on the layout
- [x] `/[menuSlug]` — lists published sub-pages, breadcrumbs, empty state
- [x] **Redirects to the page when a menu has exactly one published page**
- [x] `/[menuSlug]/[pageSlug]` — sanitized content in `.prose-content`, sibling nav, CTA
- [x] `lib/metadata.ts` `buildMetadata()` — canonical, OG, Twitter card, image fallback chain
- [x] Custom public `not-found.tsx` offering the real navigation
- [x] Verified 34/34: drafts 404 and stay out of listings, inactive menus vanish from the site
      *and* the navbar, cross-menu URLs 404, canonical resolves absolute via `metadataBase`

> **`/[menuSlug]` is a bare dynamic segment at the root**, so it catches every unknown top-level
> path. `notFound()` is what stops `/nonsense` rendering an empty shell. Static siblings
> (`/blogs`, `/admin`) still win — Next.js resolves static segments first.

### ✅ 6. Blog CRUD and public blog

- [x] `GET`/`POST /api/blogs`, `GET`/`PUT`/`DELETE /api/blogs/[id]` — **global** slug uniqueness
- [x] `publishedAt` auto-stamped the first time a draft goes live; admin override respected
- [x] `/admin/blogs` list + `new/` + full-route editor (Tiptap, cover image, `ogImage`, author,
      date). Admin list queries `.select("-content")` — the list never shows bodies
- [x] `/blogs` paginated listing (9/page) + `/blogs/[slug]` detail with cover image, related posts
- [x] `article:published_time` / `modified_time` in OG metadata; image chain
      `ogImage → coverImage → site default`
- [x] Verified 41/41: drafts 404 and stay out of the listing, duplicate slug 409, out-of-range and
      non-numeric `?page=` handled without crashing, `/blogs` not shadowed by `/[menuSlug]`

### ✅ 7. Homepage

- [x] `SiteSettings` admin form at `/admin/settings` — **upsert only**, never `create()`.
      `GET`/`PUT /api/settings`, six tabs (Hero / About / Sections / Contact / Footer / SEO),
      Tiptap for the About body, add-remove-reorder repeater for `howTo.steps[]`.
      `lib/settings.ts` owns both shape conversions so the page, the form and the route
      handler can't drift on which fields exist
- [x] `Review` CRUD at `/admin/reviews` — list + modal, **no detail route** (convention 9).
      `GET`/`POST`/`PATCH /api/reviews`, `PUT`/`DELETE /api/reviews/[id]`.
      Star-picker rating, avatar preview with initials fallback, drag reorder,
      deactivate-instead-of-delete offered in the confirm copy.
      New reviews append to the end rather than colliding at order 0.
      Verified 34/34
- [x] Public `POST /api/contact` — honeypot + rate limit, never returns submissions
- [x] `/admin/submissions` inbox — read-only modal, mark read / unread, delete.
      `PATCH`/`DELETE /api/submissions/[id]`; `isRead` is the only mutable field, because a
      submission is a record of what a visitor sent, not content the admin authors.
      Opening an unread message marks it read; the footer toggle puts it back
- [x] Compose the 7 sections; Main Services queries `Menu` directly (no duplicate list)
- [x] Verified 48/48 over HTTP: 401 on every settings and submissions endpoint while signed
      out, 422 on a bad image URL / rating > 5 / a step with an empty title, cleared fields
      stay cleared, exactly one `sitesettings` document after repeated saves, `isRead`
      round-trips both ways, 404 on an unknown id and 400 on a malformed one, and the
      homepage picks up a settings change once the 60s ISR window passes

### ⬜ 8. SEO metadata and OG images

- [ ] `lib/metadata.ts` `buildMetadata()` shared by all public routes
- [ ] `generateMetadata` on all 5 public routes
- [ ] `metadataBase` from `NEXT_PUBLIC_SITE_URL` in the root layout
- [ ] Image fallback chain + `twitter: { card: "summary_large_image" }`
- [ ] `sitemap.ts` and `robots.ts`

### ⬜ 9. Polish

- [ ] `loading.tsx` / `error.tsx` / `not-found.tsx` across admin and public
- [ ] `EmptyState` wired into every admin list; toast feedback on every mutation
- [ ] Accessibility pass
- [ ] **Delete `src/app/test/`**
- [ ] Final production build clean

## Commands

```bash
npm run dev      # dev server (Turbopack)      — works
npm run build    # production build (Turbopack) — works, currently passing
npm run lint     # eslint                       — works
npm run seed      # bootstrap: admin + menus + settings singleton. Idempotent, never overwrites
npm run seed:demo # DEV FIXTURES: overwrites SiteSettings, upserts 19 pages / 6 reviews / 4 blogs.
                  # Do not run against production.
```

Adding a shadcn component: `npx shadcn@latest add <name> -y`. Note the CLI changed — `-b` now
selects the primitive library (`radix` | `base` | `aria`), **not** the base color, and `init`
requires `-p <preset>` (this project used `-b radix -p nova`).

The seed script must be idempotent: re-running it should not duplicate menus or admins.

### Local MongoDB

MongoDB 8.3 runs as a Windows service and is already listening on `localhost:27017`. `mongod` is
**not** on PATH — that's fine, nothing needs it; connect by URI. `mongosh` is available for
inspection.

```
MONGODB_URI=mongodb://127.0.0.1:27017/consultency
```

Prefer `127.0.0.1` over `localhost` — on Windows, `localhost` can resolve to IPv6 `::1` first and
stall the driver before falling back.

## Gotchas

- **Cache the Mongoose connection on `globalThis`** (`lib/db.ts`). Next.js hot-reload re-executes
  modules and will otherwise open a new connection on every request.
- **Guard model registration** — `mongoose.models.Menu || mongoose.model("Menu", schema)`, otherwise
  hot-reload throws `OverwriteModelError`.
- **Tiptap is client-only.** The editor component needs `"use client"` and should be brought in with
  `dynamic(..., { ssr: false })`.
- **Sanitize editor HTML** before rendering with `dangerouslySetInnerHTML` — the content is
  admin-authored but still untrusted input.
- **Deleting a Menu** leaves orphaned Pages. Decide explicitly: cascade-delete or block the delete
  while pages exist.
- **Next.js 15 route params are async** — `params` is a Promise in page and route handlers; await it.
- **`metadataBase` is not optional.** Without it, a relative `ogImage` produces no social preview at
  all, and nothing warns you — the page looks fine, the share card is blank.
- **Why reviews aren't pulled from Google:** the Places API returns at most 5 reviews you cannot
  choose, its terms forbid storing them beyond ~30 days (so they can't live in Mongo like all other
  content), review fields sit in the most expensive Places SKU billed per homepage render, and a
  1-star can't be filtered out. Revisit only if provably-unedited third-party reviews become a
  requirement.
- **`SiteSettings` must stay a singleton** — always `findOneAndUpdate({}, ..., { upsert: true })`.
  A plain `create()` on a second save silently gives you two config documents and a homepage that
  changes depending on which one is read first.
- **Write each settings section as a whole object, never as dotted paths.** Mongoose drops
  `undefined` from an update, so `$set: { "hero.backgroundImage": undefined }` is a no-op and a
  field the admin just cleared comes straight back on the next load. Replacing the whole `hero`
  object removes whatever was emptied. `lib/settings.ts` does both conversions — document → form
  and form → `$set` — so the admin page, the form and the route handler can't disagree about
  which fields exist.
- **shadcn/ui writes into `components/ui/`** — that folder is the one shared exception to the
  "no cross-imports between admin and public" rule. Both sides may import from it; neither may
  import from the other.
- **NextAuth v5, not v4.** The installed package is `next-auth@5.0.0-beta`. v4 tutorials will not
  work: v5 exports `{ handlers, auth, signIn, signOut }` from a root `auth.ts`, the route handler is
  `export const { GET, POST } = handlers`, and session is read server-side with `await auth()` —
  **not** `getServerSession(authOptions)`. v4 was not an option here; it has React 19 peer conflicts.
- **Tailwind v4 has no `tailwind.config.ts`.** Adding one does nothing. Theme tokens go in `@theme`
  in `globals.css`; custom classes go in `@layer components` there too.
- **`npm audit` reports 3 high vulns** (postcss + sharp) inherited transitively from Next 15.5.22.
  `npm audit fix --force` would install Next 16 — a breaking upgrade. Left as-is deliberately since
  the project is pinned to Next 15. Both are build-time/image-pipeline deps, not request-path code.
- **`@tanstack/react-table` is pinned to v8 on purpose.** v9 shipped a full API rewrite — no
  `useReactTable`, no `getCoreRowModel`; it uses `useTable` with composed features
  (`createSortedRowModel`, `rowSortingFeature`, …). Every shadcn data-table example targets v8, and
  these admin lists are simple. Do not "upgrade" to v9 without rewriting `DataTable`.
- **lucide-react v1 removed all brand icons.** `Facebook`, `Linkedin`, `Twitter` and `Youtube` no
  longer exist and fail to typecheck. Social marks live in
  `components/public/social-icons.tsx` as inline SVG.
- **The font variable must be `--font-sans`.** The shadcn preset styles everything off it; naming
  the loader variable `--font-geist-sans` (the create-next-app default) leaves `font-sans`
  resolving to nothing and the whole site silently falls back to the UA font.
- **A honeypot field must never fail validation.** Returning a 422 that names the field tells the
  bot exactly what to remove, and it retries clean. Keep `website` permissive in the Yup schema and
  let the route return a fake success — see `POST /api/contact`.
- **Public pages are ISR-cached for 60s** (`revalidate = 60` on the `(public)` layout), so an
  admin edit can take up to a minute to appear on the site. That is deliberate — the navbar would
  otherwise cost two queries on every request to every page. Don't treat the delay as a bug, and
  don't write tests that assert a just-saved record appears on a public page immediately.
  The homepage also caps testimonials at `getActiveReviews(6)`, so a seventh review will not show
  regardless of caching.
- **Sibling dynamic segments must share one name.** `/api/menus/[id]` and
  `/api/menus/[menuId]/pages` cannot coexist: Next.js throws *"You cannot use different slug names
  for the same dynamic path ('id' !== 'menuId')"*. It **compiles and lints cleanly**, then fails at
  runtime and 500s *every route in the app*, not just those two. The whole tree under
  `/api/menus/` uses `[menuId]`. Only `npm run start` catches this — `npm run build` does not.
- **Tiptap needs `immediatelyRender: false`** under the App Router, on top of
  `dynamic(..., { ssr: false })`. Without it the editor renders during SSR and React throws a
  hydration mismatch on every load.
- **Toolbar buttons inside a form need `type="button"`.** Buttons default to `type="submit"`, so
  clicking Bold would submit the page instead of bolding the selection.
- **Stop `next start` before rebuilding.** A running production server holds `.next` open; on
  Windows `rm -rf .next && next build` underneath it produces corrupted output that looks like a
  code fault and isn't. Three distinct symptoms seen so far, all fixed by stopping the server and
  doing a clean `rm -rf .next && npm run build`:
  1. `PageNotFoundError: /_document` during build
  2. an empty `app-paths-manifest.json`, so every route 404s at runtime
  3. `Module N was instantiated … but the module factory is not available` (Turbopack chunk
     mismatch), so every route 500s
  If something fails in a way that seems structurally impossible, rebuild before debugging it.
- **`create-next-app` refuses to run in a non-empty directory** — CLAUDE.md had to be moved aside
  during scaffolding. Relevant only if the project is ever re-scaffolded.
- **Mongoose builds indexes lazily**, on first write to a collection. A declared index therefore
  does *not* exist until someone saves a document — so the first duplicate can slip past a unique
  index that "should" have caught it. `scripts/seed.ts` calls `syncIndexes()` on all 7 models to
  create them up front. Run `npm run seed` after adding or changing any index.
- **Mongoose 9 deprecated the `new` option** on `findOneAndUpdate`. Use
  `returnDocument: "before" | "after"` instead — `new: true` still works but logs a warning on
  every call.
- **A stale `.next` produces bogus failures.** Two seen so far: `PageNotFoundError: /_document`
  (a Pages Router error in an App Router project) during build, and an **empty
  `app-paths-manifest.json`** that makes every route 404 at runtime *even though the build printed
  a full route table and the HTML exists on disk*. Neither is a code fault. `rm -rf .next` and
  rebuild before debugging anything that looks structurally impossible.
- **Augment `@auth/core/jwt`, not `next-auth/jwt`.** `next-auth/jwt` is only
  `export * from "@auth/core/jwt"`, and declaration-merging against a pure re-export silently does
  nothing — `token.id` stays `unknown`, which `if (token.id)` narrows to `{}`. See
  `src/types/next-auth.d.ts`.
- **Middleware lives at `src/middleware.ts`, not the repo root**, because the project uses a `src`
  directory. Next.js will not pick it up at the root in that layout.
- **Never import `@/auth` from middleware.** It pulls in Mongoose and bcrypt, which cannot run in
  the Edge runtime. Import `@/auth.config` instead — that split is the whole reason the file exists.
- **`passwordHash` is `select: false`** on the Admin schema, so it is absent from query results
  unless explicitly requested with `.select("+passwordHash")`. The credentials provider must ask
  for it or every login silently fails.
