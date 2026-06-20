"use client"

import { Check, Loader2 } from "lucide-react"

export type SectionStatus = "saved" | "saving" | "unsaved" | "error"

interface SectionStatusProps {
  status: SectionStatus
  onRetry?: () => void
}

export function SectionStatusIndicator({ status, onRetry }: SectionStatusProps) {
  if (status === "saved") {
    return (
      <div className="flex items-center gap-1.5 text-[#86868b] text-xs font-normal transition-colors duration-200">
        <Check size={14} strokeWidth={1.75} />
        <span>Saved</span>
      </div>
    )
  }

  if (status === "saving") {
    return (
      <div className="flex items-center gap-1.5 text-[#86868b] text-xs font-normal transition-colors duration-200">
        <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
        <span>Saving...</span>
      </div>
    )
  }

  if (status === "unsaved") {
    return (
      <div className="flex items-center gap-1.5 text-[#6e6e73] text-xs font-normal transition-colors duration-200">
        <span className="w-2 h-2 rounded-full bg-[#6e6e73]" />
        <span>Unsaved changes</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onRetry}
      className="flex items-center gap-1.5 text-[#ff3b30] text-xs font-normal transition-colors duration-200 hover:opacity-80"
    >
      <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
      <span>Couldn&apos;t save</span>
    </button>
  )
}
