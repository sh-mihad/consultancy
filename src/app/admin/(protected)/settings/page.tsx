import type { Metadata } from "next"

import { dbConnect } from "@/lib/db"
import { getSiteSettings } from "@/models/SiteSettings"
import { toSettingsInput } from "@/lib/settings"
import { SettingsForm } from "@/components/admin/settings-form"

export const metadata: Metadata = { title: "Settings" }
export const dynamic = "force-dynamic"

/**
 * The SiteSettings singleton. getSiteSettings() upserts, so a database that has
 * never been seeded still renders a fully populated form rather than a blank
 * one — and the form only ever PUTs, never creates.
 */
export default async function AdminSettingsPage() {
  await dbConnect()

  const settings = await getSiteSettings()

  return <SettingsForm settings={toSettingsInput(settings)} />
}
