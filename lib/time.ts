const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
  { unit: "day", ms: 1000 * 60 * 60 * 24 },
  { unit: "hour", ms: 1000 * 60 * 60 },
  { unit: "minute", ms: 1000 * 60 },
  { unit: "second", ms: 1000 },
]

export function timeAgo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return ""
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60_000) return "just now"

  for (const { unit, ms } of UNITS) {
    const value = Math.floor(diff / ms)
    if (value >= 1) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        -value,
        unit
      )
    }
  }

  return "just now"
}

export function latestTimestamp(
  items: { updated_at?: string | null }[]
): string | null {
  if (!items.length) return null
  const timestamps = items
    .map((i) => i.updated_at)
    .filter((t): t is string => !!t)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  return timestamps[0] ?? null
}
