import type { Metadata } from "next"
import { Geist, Geist_Mono, Newsreader } from "next/font/google"

import "./globals.css"

// The shadcn preset styles everything off `--font-sans`, so the loader must
// publish that exact variable name — not --font-geist-sans, or `font-sans`
// silently resolves to nothing and the whole site falls back to the UA font.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Display face for every heading on the site — globals.css maps
// --font-heading onto it. Italic is loaded because testimonials are set in it.
const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  /**
   * Without metadataBase, a relative ogImage stays relative and social
   * scrapers render no preview at all — with no warning anywhere. Set once,
   * here, for every route.
   */
  metadataBase: new URL(siteUrl),
  title: {
    default: "Corporate & Legal Advisory in Bangladesh",
    template: "%s · Consultancy",
  },
  description:
    "Company formation, trademark registration, taxation and foreign investment advisory in Dhaka, Bangladesh.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Consultancy",
  },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* The font variables must be declared on <html>, not <body>: globals.css
       applies `font-sans` to the html element, and a var defined one level
       lower resolves to nothing there — the whole site silently falls back to
       the UA serif. */
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
