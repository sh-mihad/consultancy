# CLAUDE.md

Project documentation for the **Consultancy CMS** — read this before making changes.

## Overview

A public-facing business consultancy website backed by a protected admin panel that manages all of
its content. Services, sub-menus, pages, and blog posts are stored in MongoDB and rendered
dynamically.

> **Guiding constraint:** an admin must never need a code change to add a new service, sub-menu, or
> page. If a feature requires editing source to add content, the design is wrong.

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | Server Components by default; `"use client"` only where needed |
| Language | TypeScript | Strict mode |
| Backend | Next.js Route Handlers | **No separate Express server.** `src/app/api/**/route.ts` is the API |
| Database | MongoDB + Mongoose | Single connection, globally cached |
| Styling | Tailwind CSS | |
| Components | **shadcn/ui** | `npx shadcn@latest init`. Copies source into `components/ui/` — owned code, not a dependency. Built on Radix primitives |
| Auth | NextAuth.js (credentials provider) | Admin login only; no public accounts |
| Forms | Formik + Yup | Same Yup schema reused server-side |
| Rich text | **Tiptap** | Chosen over React-Quill (unmaintained, React 19 friction). Wrapped in `RichTextEditor` so it stays swappable |

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
│   │   │   ├── menus/[id]/route.ts             # PUT, DELETE
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
│   │   ├── admin/     # AdminShell, MenuTable, MenuDialog, ReviewDialog, SubmissionDialog,
│   │   │              # PageForm, BlogForm, RichTextEditor
│   │   ├── public/    # Navbar, Footer, ServiceCard, BlogCard, Pagination
│   │   └── home/      # Hero, AboutUs, MainServices, HowToOpen, Reviews, ContactForm
│   ├── models/        # Menu.ts, Page.ts, Blog.ts, Admin.ts, Review.ts,
│   │                  # SiteSettings.ts, ContactSubmission.ts
│   ├── lib/           # db.ts, auth.ts, api-response.ts, slugify.ts, metadata.ts, validation/
│   └── types/
├── scripts/seed.ts
├── middleware.ts      # NextAuth protection for /admin/*
├── .env.example
└── CLAUDE.md
```

Keep `components/admin/` and `components/public/` strictly separate — no cross-imports. Both may
import from `components/ui/` (shadcn primitives); `components/home/` is public-side only.

> **Scaffold note:** the repo currently contains empty `backend/` and `frontend/` directories left
> over from an earlier layout. Delete both when scaffolding; the app lives at the root.

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
| `/api/menus/[id]` | api | `PUT`, `DELETE` |
| `/api/menus/[menuId]/pages` | api | `GET`, `POST` |
| `/api/pages/[id]` | api | `PUT`, `DELETE` |
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
7. **Env vars** — `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`.
   Keep `.env.example` in sync; never commit `.env.local`.
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

## Build order

- [ ] 1. Scaffold + `shadcn/ui` init + MongoDB connection + Mongoose models
- [ ] 2. NextAuth admin login + protected middleware
- [ ] 3. Menu CRUD (admin UI + API routes)
- [ ] 4. Page CRUD nested under a menu (admin UI + API routes)
- [ ] 5. Public dynamic navigation + service page rendering
- [ ] 6. Blog CRUD + public listing/detail pages
- [ ] 7. Home page — `SiteSettings` + admin settings form, `Review` CRUD (list + modal),
       contact form + submissions inbox, then compose the seven sections
- [ ] 8. SEO metadata + OG images across all public routes
- [ ] 9. Polish — loading states, error handling, empty states

## Commands

> Not yet available — no `package.json` exists. These are the intended scripts once step 1 is done.

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
npm run seed     # scripts/seed.ts — initial admin user + default menus
```

The seed script must be idempotent: re-running it should not duplicate menus or admins.

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
- **shadcn/ui writes into `components/ui/`** — that folder is the one shared exception to the
  "no cross-imports between admin and public" rule. Both sides may import from it; neither may
  import from the other.
