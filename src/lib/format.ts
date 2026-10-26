export type UiLanguage = 'hi' | 'en'

/** Today's date at midnight, used as the anchor for all relative dates. */
export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Converts a `yyyy-mm-dd` string into a local Date (avoids UTC parsing drift). */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

/** Formats a `yyyy-mm-dd` string back out. */
export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Whole-day difference between two dates (`to` minus `from`). */
export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.round(ms / 86_400_000)
}

/** Adds (or subtracts) whole days and returns a new Date. */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime())
  next.setDate(next.getDate() + days)
  return next
}

const DATE_LOCALE: Record<UiLanguage, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
}

/** "12 Nov 2026" / "12 नवंबर 2026" */
export function formatDate(iso: string, language: UiLanguage = 'en'): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[language], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseISODate(iso))
}

/** "Mon, 12 Nov" / "सोम, 12 नवं" */
export function formatDayDate(date: Date, language: UiLanguage = 'en'): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[language], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

/** "Today" / "Tomorrow" / "in 4 days" - friendlier than a bare date. */
export function formatRelativeDay(iso: string, language: UiLanguage = 'en'): string {
  const diff = daysBetween(startOfToday(), parseISODate(iso))
  const formatter = new Intl.RelativeTimeFormat(DATE_LOCALE[language], {
    numeric: 'auto',
  })

  if (diff === 0) return language === 'hi' ? 'आज' : 'Today'
  if (diff === 1) return language === 'hi' ? 'कल' : 'Tomorrow'
  if (diff === -1) return language === 'hi' ? 'कल' : 'Yesterday'
  return formatter.format(diff, 'day')
}

/** "₹450" / "₹450 प्रति दिन" */
export function formatCurrency(amount: number, language: UiLanguage = 'en'): string {
  const formatted = new Intl.NumberFormat(DATE_LOCALE[language], {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
  return language === 'hi' ? `${formatted} प्रति दिन` : `${formatted}/day`
}

/** "450" without the currency symbol, for compact stat tiles. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

/** Percentage as a whole number, clamped to 0-100. */
export function toPercent(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)))
}

/** Initials for avatar chips, handling single names safely. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}
