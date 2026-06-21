"use client"

interface StatPillProps {
  label: string
  value: string
  variant?: "default" | "dark" | "accent"
  compact?: boolean
}

export function StatPill({ label, value, variant = "default", compact = false }: StatPillProps) {
  const variants = {
    default: "glass-card text-[#1d1d1f]",
    dark: "glass-card-dark text-white",
    accent:
      "bg-[var(--accent-color)]/55 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-accent-foreground",
  }

  return (
    <div
      className={`flex flex-col rounded-2xl ${variants[variant]} ${
        compact ? "px-3 py-1.5" : "px-5 py-3"
      }`}
    >
      <span className={`opacity-70 ${compact ? "text-[9px]" : "text-xs"}`}>{label}</span>
      <span className={`font-semibold ${compact ? "text-sm" : "text-lg"}`}>{value}</span>
    </div>
  )
}
