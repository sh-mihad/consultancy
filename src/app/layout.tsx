import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
