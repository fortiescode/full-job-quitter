"use client"

import { useEffect, useMemo, useState } from "react"
import { timeAgo } from "@/lib/time"

interface LastUpdatedProps {
  date: string | Date | null | undefined
  className?: string
}

export function LastUpdated({ date, className }: LastUpdatedProps) {
  const [tick, setTick] = useState(0)

  const label = useMemo(() => {
    if (!date) return ""
    return timeAgo(date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, tick])

  useEffect(() => {
    if (!date) return
    const interval = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(interval)
  }, [date])

  if (!date || !label) return null

  return (
    <span className={`text-[11px] text-[#8a8a8a] ${className}`}>
      Updated {label}
    </span>
  )
}
