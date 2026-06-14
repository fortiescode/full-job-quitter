"use client"

import { useEffect, useState } from "react"
import { timeAgo } from "@/lib/time"

interface LastUpdatedProps {
  date: string | Date | null | undefined
  className?: string
}

export function LastUpdated({ date, className }: LastUpdatedProps) {
  const [label, setLabel] = useState(() => (date ? timeAgo(date) : ""))

  useEffect(() => {
    if (!date) return
    setLabel(timeAgo(date))
    const interval = setInterval(() => setLabel(timeAgo(date)), 60_000)
    return () => clearInterval(interval)
  }, [date])

  if (!date || !label) return null

  return (
    <span
      className={`text-[10px] uppercase tracking-wide text-[#8a8a8a] ${className}`}
    >
      Updated {label}
    </span>
  )
}
