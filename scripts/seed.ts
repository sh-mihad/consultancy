/**
 * Seed the database with the initial admin user, the default menus and the
 * SiteSettings singleton.
 *
 * Idempotent by design: every write is an upsert keyed on a natural unique
 * field, so running it twice changes nothing. It never overwrites content an
 * admin has already edited — an existing menu keeps its title and order.
 *
 * Run with:  npm run seed
 *
 * Uses relative imports rather than the @/ alias so it runs under tsx without
 * depending on tsconfig path resolution.
 */

import "dotenv/config"
import { config as loadEnv } from "dotenv"
import bcrypt from "bcryptjs"

import { dbConnect, dbDisconnect } from "../src/lib/db"
import { Admin } from "../src/models/Admin"
import { Menu } from "../src/models/Menu"
import { Page } from "../src/models/Page"
import { Blog } from "../src/models/Blog"
import { Review } from "../src/models/Review"
import { SiteSettings } from "../src/models/SiteSettings"
import { ContactSubmission } from "../src/models/ContactSubmission"
import { slugify } from "../src/lib/slugify"

// .env.local wins over .env — same precedence Next.js uses.
loadEnv({ path: ".env.local", override: true })

const DEFAULT_MENUS = [
  "Intellectual Property",
  "Startup & License",
  "Taxation",
  "Foreign Entity",
  "Others",
]

const BCRYPT_ROUNDS = 12

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "").trim().toLowerCase()
  const password = process.env.SEED_ADMIN_PASSWORD ?? ""
  const name = process.env.SEED_ADMIN_NAME ?? "Site Admin"

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set. See .env.example."
    )
  }

  const existing = await Admin.findOne({ email }).select("_id")

  if (existing) {
    console.log(`  admin      ${email} — already exists, left unchanged`)
    return
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  await Admin.create({ email, passwordHash, name, role: "admin" })
  console.log(`  admin      ${email} — created`)
}

async function seedMenus() {
  for (const [index, title] of DEFAULT_MENUS.entries()) {
    const slug = slugify(title)

    // $setOnInsert only — an admin who renamed or reordered a menu keeps their
    // change when the seed is re-run.
    const result = await Menu.findOneAndUpdate(
      { slug },
      { $setOnInsert: { title, slug, order: index, isActive: true } },
      // returnDocument: "before" → null means we just inserted it.
      // (Mongoose 9 deprecated the old `new` boolean option.)
      { upsert: true, returnDocument: "before" }
    )

    console.log(`  menu       ${slug} — ${result ? "already exists" : "created"}`)
  }
}

async function seedSettings() {
  const existing = await SiteSettings.findOne({}).select("_id")

  if (existing) {
    console.log("  settings   singleton — already exists, left unchanged")
    return
  }

  // Schema defaults fill in the copy; the admin edits it from /admin/settings.
  await SiteSettings.create({})
  console.log("  settings   singleton — created")
}

/**
 * Mongoose only creates a collection — and therefore its indexes — on first
 * write. Without this, Page's compound unique {menuId, slug} index wouldn't
 * exist until the first page was saved, so the very first duplicate could slip
 * through. Build them all up front instead.
 */
async function syncIndexes() {
  const models = [Admin, Menu, Page, Blog, Review, SiteSettings, ContactSubmission]

  for (const model of models) {
    await model.syncIndexes()
  }

  console.log(`  indexes    synced for ${models.length} models`)
}

async function main() {
  console.log("Seeding database…")
  await dbConnect()
  console.log(`  connected  ${process.env.MONGODB_URI}`)

  await syncIndexes()
  await seedAdmin()
  await seedMenus()
  await seedSettings()

  console.log("Done.")
}

main()
  .catch((err) => {
    console.error("\nSeed failed:")
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(async () => {
    await dbDisconnect()
  })
