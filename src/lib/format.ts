/**
 * Shared formatters.
 *
 * Locale and timeZone are pinned deliberately. If they're left to the runtime,
 * the server renders one string and the browser renders another, and React
 * throws a hydration mismatch on every date on the page.
 */

const DATE_LOCALE = "en-GB"
const DATE_TIMEZONE = "UTC"

export function formatDate(value: Date | string | number | null | undefined): string {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: DATE_TIMEZONE,
  }).format(date)
}

export function formatDateTime(value: Date | string | number | null | undefined): string {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DATE_TIMEZONE,
  }).format(date)
}

/** Machine-readable value for a <time dateTime> attribute. */
export function toDateTimeAttr(value: Date | string | number | null | undefined): string | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/** "AB" from "Ariful Bari" — avatar fallback when no image is set. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}
