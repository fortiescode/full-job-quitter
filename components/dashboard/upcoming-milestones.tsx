"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import type { Milestone } from "@/lib/milestones/actions"

interface UpcomingMilestonesProps {
  milestones: Milestone[]
  compact?: boolean
}

export function UpcomingMilestones({ milestones, compact = false }: UpcomingMilestonesProps) {
  const upcoming = milestones
    .filter((m) => m.status !== "completed")
    .sort((a, b) => a.order_index - b.order_index)
    .slice(0, 3)

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 ${compact ? "space-y-2" : "space-y-3"}`}>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[#8a8a8a]">No upcoming milestones. You're free!</p>
        ) : (
          upcoming.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className={`rounded-full border-2 border-[#e8e0cc] shrink-0 mt-0.5 ${compact ? "w-4 h-4" : "w-5 h-5"}`} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-[#1d1d1f] ${compact ? "text-xs" : "text-sm"}`}>
                  {milestone.title}
                </p>
                {milestone.description && (
                  <p className={`text-[#8a8a8a] mt-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>
                    {milestone.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Link
        href="/milestones"
        className={`inline-flex items-center text-[#f5c542] hover:text-[#1d1d1f] transition-colors ${
          compact ? "text-xs mt-3" : "text-sm mt-4"
        } font-medium`}
      >
        View all milestones
        <ArrowRight size={compact ? 12 : 14} strokeWidth={2} className="ml-1" />
      </Link>
    </div>
  )
}
