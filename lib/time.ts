export function timeAgo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return ""
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes < 5) return "just now"
  if (minutes < 60) return `${minutes} minutes ago`

  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 24) return `${hours} hours ago`

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 2) return "yesterday"

  return `${days} days ago`
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
