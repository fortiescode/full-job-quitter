"use client"

interface StatPillProps {
  label: string
  value: string
  variant?: "default" | "dark" | "accent"
  compact?: boolean
}

export function StatPill({ label, value, variant = "default", compact = false }: StatPillProps) {
  const variants = {
    default: "bg-white text-[#1d1d1f]",
    dark: "bg-[#1d1d1f] text-white",
    accent: "bg-[#f5c542] text-[#1d1d1f]",
  }

  return (
    <div
      className={`flex flex-col rounded-2xl shadow-sm ${variants[variant]} ${
        compact ? "px-3 py-1.5" : "px-5 py-3"
      }`}
    >
      <span className={`opacity-70 ${compact ? "text-[9px]" : "text-xs"}`}>{label}</span>
      <span className={`font-semibold ${compact ? "text-sm" : "text-lg"}`}>{value}</span>
    </div>
  )
}
