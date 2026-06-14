"use client"

import { Check } from "lucide-react"
import { motion } from "framer-motion"
import type { Milestone } from "@/lib/milestones/actions"

interface MilestoneTimelineProps {
  milestones: Milestone[]
  compact?: boolean
}

export function MilestoneTimeline({ milestones, compact = false }: MilestoneTimelineProps) {
  const sorted = [...milestones].sort((a, b) => a.order_index - b.order_index)
  const display = sorted.slice(0, 6)
  const completedCount = display.filter((m) => m.status === "completed").length
  const currentIndex = display.findIndex((m) => m.status !== "completed")
  const progress = display.length > 0 ? (completedCount / display.length) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#e8e0cc] rounded-full" />

        {display.map((milestone, index) => {
          const isCompleted = milestone.status === "completed"
          const isCurrent = index === currentIndex

          return (
            <div key={milestone.id} className="relative z-10 flex flex-col items-center">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`rounded-full bg-[#34c759] text-white flex items-center justify-center border-2 border-white shadow-sm ${
                    compact ? "w-7 h-7" : "w-9 h-9"
                  }`}
                >
                  <Check size={compact ? 14 : 16} strokeWidth={2.5} />
                </motion.div>
              ) : isCurrent ? (
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-[#f5c542] animate-ping opacity-40" />
                  <div
                    className={`relative rounded-full bg-[#f5c542] text-[#1d1d1f] flex items-center justify-center border-2 border-white shadow-sm ${
                      compact ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
                    } font-semibold`}
                  >
                    {index + 1}
                  </div>
                </div>
              ) : (
                <div
                  className={`rounded-full border-2 border-[#e8e0cc] bg-white flex items-center justify-center text-[#8a8a8a] ${
                    compact ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
                  } font-medium`}
                >
                  {index + 1}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress label */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#8a8a8a]">Milestone progress</span>
          <span className="font-medium text-[#1d1d1f]">
            {completedCount} of {display.length} completed
          </span>
        </div>
        <div className="h-2 bg-[#f8f1de] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-[#f5c542] rounded-full"
          />
        </div>
      </div>
    </div>
  )
}
