"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import {
  Check,
  Circle,
  Plus,
  Trash2,
  Loader2,
  Route,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import {
  addMilestone,
  deleteMilestone,
  seedDefaultMilestones,
  toggleMilestone,
} from "@/lib/milestones/actions"
import type { Milestone } from "@/lib/milestones/actions"

interface MilestoneListProps {
  milestones: Milestone[]
}

export function MilestoneList({ milestones }: MilestoneListProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const hasMilestones = milestones.length > 0
  const completedCount = milestones.filter((m) => m.status === "completed").length
  const progress = hasMilestones
    ? Math.round((completedCount / milestones.length) * 100)
    : 0

  function handleSeed() {
    startTransition(async () => {
      await seedDefaultMilestones()
    })
  }

  function handleToggle(id: string, status: Milestone["status"]) {
    setPendingId(id)
    startTransition(async () => {
      await toggleMilestone(id, status)
      setPendingId(null)
    })
  }

  function handleDelete(id: string) {
    setPendingId(id)
    startTransition(async () => {
      await deleteMilestone(id)
      setPendingId(null)
    })
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    startTransition(async () => {
      await addMilestone({ title, description })
      setTitle("")
      setDescription("")
    })
  }

  if (!hasMilestones) {
    return (
      <Card className="glass-panel rounded-2xl p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0066cc]/10 flex items-center justify-center mx-auto mb-6">
          <Route size={28} strokeWidth={1.75} className="text-[#0066cc]" />
        </div>
        <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
          Build your exit roadmap
        </h2>
        <p className="text-[#6e6e73] mb-8 max-w-md mx-auto">
          Add the milestones that stand between you and your last day. Or start with our recommended checklist.
        </p>
        <Button
          onClick={handleSeed}
          disabled={isPending}
          className="rounded-xl bg-[#0066cc] hover:bg-[#0066cc]/90 text-white px-6 h-12"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
          ) : (
            <>
              <Sparkles size={18} strokeWidth={1.75} className="mr-2" />
              Start with recommended milestones
            </>
          )}
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Milestone Tracker
          </h1>
          <p className="text-[#6e6e73] mt-1">
            {completedCount} of {milestones.length} completed ({progress}%)
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="New milestone title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5 flex-1"
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5 flex-1"
        />
        <Button
          type="submit"
          disabled={isPending || !title.trim()}
          className="h-12 rounded-xl bg-[#0066cc] hover:bg-[#0066cc]/90 text-white px-6"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
          ) : (
            <>
              <Plus size={18} strokeWidth={1.75} className="mr-2" />
              Add
            </>
          )}
        </Button>
      </form>

      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`glass-panel rounded-2xl border-l-4 transition-colors ${
                milestone.status === "completed"
                  ? "border-l-[#34c759]"
                  : "border-l-[#0066cc]"
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <Checkbox
                  checked={milestone.status === "completed"}
                  onCheckedChange={() =>
                    handleToggle(milestone.id, milestone.status)
                  }
                  disabled={pendingId === milestone.id}
                  className="mt-1 rounded-md border-[#0066cc] data-[state=checked]:bg-[#0066cc] data-[state=checked]:text-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {milestone.status === "completed" ? (
                      <Check
                        size={16}
                        strokeWidth={1.75}
                        className="text-[#34c759]"
                      />
                    ) : (
                      <Circle
                        size={16}
                        strokeWidth={1.75}
                        className="text-[#0066cc]"
                      />
                    )}
                    <h3
                      className={`font-semibold truncate ${
                        milestone.status === "completed"
                          ? "text-[#6e6e73] line-through"
                          : "text-[#1d1d1f] dark:text-[#f5f5f7]"
                      }`}
                    >
                      {milestone.title}
                    </h3>
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-[#6e6e73] mt-1">
                      {milestone.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(milestone.id)}
                  disabled={pendingId === milestone.id}
                  className="rounded-xl text-[#6e6e73] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10"
                >
                  {pendingId === milestone.id ? (
                    <Loader2 className="animate-spin" size={16} strokeWidth={1.75} />
                  ) : (
                    <Trash2 size={16} strokeWidth={1.75} />
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
