/**
 * Demo content for local development — realistic copy so the homepage and
 * service pages can be built and reviewed against something other than lorem
 * ipsum.
 *
 * Deliberately separate from `seed.ts`:
 *   seed.ts       bootstrap — admin user, menus, empty settings singleton.
 *                 Never overwrites anything.
 *   seed-demo.ts  development fixtures — OVERWRITES SiteSettings and upserts
 *                 sample pages, reviews and blogs.
 *
 * Do not run this against production: it replaces the whole settings document.
 *
 * Run with:  npm run seed:demo
 */

import "dotenv/config"
import { config as loadEnv } from "dotenv"

import { dbConnect, dbDisconnect } from "../src/lib/db"
import { Menu } from "../src/models/Menu"
import { Page } from "../src/models/Page"
import { Blog } from "../src/models/Blog"
import { Review } from "../src/models/Review"
import { SiteSettings } from "../src/models/SiteSettings"
import { slugify } from "../src/lib/slugify"

loadEnv({ path: ".env.local", override: true })

/* ----------------------------------------------------------------- content */

const SETTINGS = {
  hero: {
    heading: "Build your business in Bangladesh, on solid legal ground.",
    subheading:
      "Company formation, trademarks, tax and foreign investment — handled end to end by advisors who file these papers every week.",
    ctaLabel: "Book a free consultation",
    ctaHref: "#contact",
    backgroundImage: "",
  },
  aboutUs: {
    eyebrow: "About us",
    heading: "Fifteen years of getting the paperwork right",
    body: `<p>We are a Dhaka-based corporate advisory firm working with founders, family businesses and foreign investors entering the Bangladeshi market. Since 2011 we have registered more than <strong>1,200 companies</strong> and filed over 3,000 trademark applications.</p><p>Most of what we do is unglamorous and consequential: name clearance at RJSC, encashment certificates, BIN registration, opposition responses. Getting these wrong costs months. We do not outsource that work — the person advising you is the person filing.</p>`,
    image: "",
  },
  mainServices: {
    eyebrow: "What we do",
    heading: "Advisory across the full company lifecycle",
    description:
      "From the first name-clearance application to annual compliance, each area is handled by a dedicated team.",
  },
  howTo: {
    eyebrow: "Step by step",
    heading: "How to open a company in Bangladesh",
    description:
      "The full route from idea to certificate of incorporation. Most private limited companies complete this in four to six weeks.",
    steps: [
      {
        title: "Choose a company structure",
        description:
          "Private limited, branch office or liaison office. Each differs in ownership limits, tax treatment and what you may legally invoice for.",
      },
      {
        title: "Clear the company name",
        description:
          "Apply to RJSC for name clearance. Once approved the name is reserved for a limited window, so the remaining steps need to move.",
      },
      {
        title: "Draft the constitution",
        description:
          "Memorandum and Articles of Association setting out the objects, share capital and internal governance of the company.",
      },
      {
        title: "Open a bank account and remit capital",
        description:
          "Foreign shareholders must remit paid-up capital into a temporary account and obtain an encashment certificate before incorporation.",
      },
      {
        title: "File for incorporation",
        description:
          "Submit the full document set to RJSC with the filing fee and stamp duty, and receive the certificate of incorporation.",
      },
      {
        title: "Post-registration licences",
        description:
          "Trade licence from the city corporation, TIN, BIN/VAT registration, and any sector-specific permits before you begin trading.",
      },
    ],
  },
  reviewsSection: {
    eyebrow: "Client feedback",
    heading: "What our clients say",
    description:
      "A selection of the businesses we have helped incorporate, protect and keep compliant.",
    googleRatingValue: 4.9,
    googleReviewCount: 87,
    googleListingUrl: "https://www.google.com/maps",
  },
  contact: {
    heading: "Talk to an advisor",
    description:
      "Tell us what you are trying to set up and we will tell you what it actually takes — timelines, documents and cost, before you commit.",
    email: "hello@consultancy.com.bd",
    phone: "+880 1711 000 000",
    address: "Level 7, Concord Tower, 113 Kazi Nazrul Islam Ave, Banglamotor, Dhaka 1000",
    mapEmbedUrl: "",
  },
  footer: {
    about:
      "A corporate advisory firm helping founders and foreign investors establish and run compliant businesses in Bangladesh.",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
    twitter: "",
    youtube: "",
  },
  seo: {
    defaultTitle: "Corporate & Legal Advisory in Bangladesh",
    defaultDescription:
      "Company formation, trademark registration, taxation and foreign investment advisory in Dhaka, Bangladesh.",
    defaultOgImage: "",
  },
}

const REVIEWS = [
  {
    authorName: "Farhana Rahman",
    authorTitle: "Managing Director, Nexus Textiles",
    rating: 5,
    quote:
      "They registered our trademark portfolio across three classes in under two months. Clear advice throughout and no surprises on the invoice.",
    order: 0,
  },
  {
    authorName: "David Chen",
    authorTitle: "Regional Head, Meridian Logistics",
    rating: 5,
    quote:
      "Setting up a foreign branch office looked impossible from Singapore. They handled RJSC, the bank account and BIDA approval end to end while we focused on hiring.",
    order: 1,
  },
  {
    authorName: "Tanvir Ahmed",
    authorTitle: "Founder, Shodai",
    rating: 5,
    quote:
      "Straightforward VAT registration and genuinely useful compliance reminders every quarter. They answer the phone, which is rarer than it should be.",
    order: 2,
  },
  {
    authorName: "Nusrat Jahan",
    authorTitle: "Partner, Meridian Architects",
    rating: 5,
    quote:
      "Our trademark was opposed three weeks after publication. They drafted the response, and the opposition was withdrawn before it reached a hearing.",
    order: 3,
  },
  {
    authorName: "Imran Hossain",
    authorTitle: "CFO, Bengal Agro Ltd",
    rating: 4,
    quote:
      "We moved our annual filings and income tax work to them after two bad years elsewhere. Everything has been filed on time since.",
    order: 4,
  },
  {
    authorName: "Sarah Whitfield",
    authorTitle: "Director, Ashgrove Ventures",
    rating: 5,
    quote:
      "The clearest explanation of repatriation rules we received from anyone. They told us what would not work before we spent money finding out.",
    order: 5,
  },
]

/** Pages keyed by the slug of the menu they belong under. */
const PAGES: Record<string, { title: string; excerpt: string }[]> = {
  "intellectual-property": [
    { title: "Trademark Registration", excerpt: "Search, filing and prosecution of trademarks across all 45 Nice classes." },
    { title: "Patent Registration", excerpt: "Drafting, filing and prosecution of patent applications before the DPDT." },
    { title: "Copyright Registration", excerpt: "Protection for literary, artistic, software and audiovisual works." },
    { title: "Trademark Opposition", excerpt: "Responding to oppositions and filing them on your behalf." },
    { title: "IP Assignment & Licensing", excerpt: "Recordal of assignments, licences and changes of ownership." },
  ],
  "startup-and-license": [
    { title: "Private Limited Company Registration", excerpt: "Name clearance through to certificate of incorporation." },
    { title: "Trade Licence", excerpt: "City corporation trade licence application and annual renewal." },
    { title: "Partnership & Proprietorship", excerpt: "Registration for smaller and unincorporated business structures." },
    { title: "Import & Export Registration", excerpt: "IRC and ERC certificates for businesses trading across borders." },
  ],
  taxation: [
    { title: "VAT & BIN Registration", excerpt: "Business Identification Number registration and VAT onboarding." },
    { title: "Income Tax Filing", excerpt: "Corporate and personal income tax return preparation and filing." },
    { title: "Tax Advisory & Planning", excerpt: "Structuring advice to keep liability lawful and predictable." },
    { title: "TIN Registration", excerpt: "Taxpayer Identification Number registration for companies and directors." },
  ],
  "foreign-entity": [
    { title: "Branch Office Setup", excerpt: "BIDA permission, RJSC registration and operational licensing." },
    { title: "Liaison Office Setup", excerpt: "For representative activity without local revenue generation." },
    { title: "Foreign Investment Approval", excerpt: "BIDA registration and equity structuring for foreign shareholders." },
    { title: "Profit Repatriation", excerpt: "Bangladesh Bank approvals for dividend and capital remittance." },
  ],
  others: [
    { title: "Contract Drafting & Review", excerpt: "Commercial agreements drafted and reviewed for enforceability." },
    { title: "Corporate Compliance", excerpt: "Annual returns, board resolutions and statutory register upkeep." },
  ],
}

const BLOGS = [
  {
    title: "What changed in the 2026 VAT compliance rules",
    author: "Tanvir Ahmed",
    publishedAt: new Date("2026-07-14"),
    excerpt:
      "The threshold for mandatory BIN registration moved again this year. Here is what it means for small importers and how to prepare before the next filing window.",
  },
  {
    title: "Branch office vs. subsidiary: picking the right structure",
    author: "Farhana Rahman",
    publishedAt: new Date("2026-06-02"),
    excerpt:
      "Liability, tax treatment and repatriation rules differ sharply between the two. A practical comparison for foreign investors entering Bangladesh.",
  },
  {
    title: "Trademark oppositions: what to do when yours is challenged",
    author: "Nusrat Jahan",
    publishedAt: new Date("2026-05-21"),
    excerpt:
      "An opposition is not a rejection. The timelines are tight, though, and missing one is usually fatal to the application.",
  },
  {
    title: "A realistic timeline for incorporating in Bangladesh",
    author: "Imran Hossain",
    publishedAt: new Date("2026-04-09"),
    excerpt:
      "Four to six weeks is achievable, but only if the bank remittance and name clearance are sequenced correctly. Where the delays actually come from.",
  },
]

function body(title: string, excerpt: string): string {
  return `<p class="lead">${excerpt}</p>
<h2>Overview</h2>
<p>${title} is one of the areas we handle most frequently. This page sets out what the process involves, what we need from you, and how long each stage typically takes.</p>
<h3>What we handle</h3>
<ul>
  <li>Preparing and reviewing the full document set before submission</li>
  <li>Filing with the relevant authority and tracking the application</li>
  <li>Responding to objections, queries and requests for clarification</li>
  <li>Delivering the final certificate and advising on what follows</li>
</ul>
<h3>What we need from you</h3>
<ol>
  <li>Photocopies of the National ID or passport of each director or applicant</li>
  <li>Proof of the business address — a registered lease or ownership deed</li>
  <li>A short written description of the intended business activity</li>
</ol>
<blockquote>Applications submitted with an unregistered rental agreement are the single most common cause of avoidable delay.</blockquote>
<p>If you would like to discuss your specific situation, <a href="/#contact">get in touch</a> and we will give you a realistic timeline before you commit to anything.</p>`
}

/* -------------------------------------------------------------------- seed */

async function seedSettings() {
  await SiteSettings.findOneAndUpdate(
    {},
    { $set: SETTINGS },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  )
  console.log("  settings   overwritten with demo content")
}

async function seedReviews() {
  let created = 0
  for (const review of REVIEWS) {
    const before = await Review.findOneAndUpdate(
      { authorName: review.authorName },
      { $set: { ...review, isActive: true } },
      { upsert: true, returnDocument: "before" }
    )
    if (!before) created++
  }
  console.log(`  reviews    ${REVIEWS.length} upserted (${created} new)`)
}

async function seedPages() {
  let total = 0

  for (const [menuSlug, pages] of Object.entries(PAGES)) {
    const menu = await Menu.findOne({ slug: menuSlug }).select("_id")
    if (!menu) {
      console.log(`  pages      SKIPPED — no menu "${menuSlug}" (run npm run seed first)`)
      continue
    }

    for (const [index, { title, excerpt }] of pages.entries()) {
      const slug = slugify(title)
      await Page.findOneAndUpdate(
        { menuId: menu._id, slug },
        {
          $set: {
            menuId: menu._id,
            title,
            slug,
            metaTitle: `${title} in Bangladesh`,
            metaDescription: excerpt,
            content: body(title, excerpt),
            order: index,
            isPublished: true,
          },
        },
        { upsert: true, returnDocument: "after" }
      )
      total++
    }
  }

  console.log(`  pages      ${total} upserted across ${Object.keys(PAGES).length} menus`)
}

async function seedBlogs() {
  for (const blog of BLOGS) {
    const slug = slugify(blog.title)
    await Blog.findOneAndUpdate(
      { slug },
      {
        $set: {
          title: blog.title,
          slug,
          metaTitle: blog.title,
          metaDescription: blog.excerpt,
          content: body(blog.title, blog.excerpt),
          author: blog.author,
          isPublished: true,
          publishedAt: blog.publishedAt,
        },
      },
      { upsert: true, returnDocument: "after" }
    )
  }
  console.log(`  blogs      ${BLOGS.length} upserted`)
}

async function main() {
  console.log("Seeding DEMO content…")
  await dbConnect()

  await seedSettings()
  await seedPages()
  await seedReviews()
  await seedBlogs()

  console.log("Done.")
}

main()
  .catch((err) => {
    console.error("\nDemo seed failed:")
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(async () => {
    await dbDisconnect()
  })
