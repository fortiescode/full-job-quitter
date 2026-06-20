"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Loader2,
  Route,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  addMilestone,
  deleteMilestone,
  seedDefaultMilestones,
  resetDefaultMilestones,
  toggleMilestone,
} from "@/lib/milestones/actions"
import { toast } from "sonner"
import type { Milestone } from "@/lib/milestones/actions"

interface MilestoneListProps {
  milestones: Milestone[]
}

const CATEGORY_STYLES: Record<
  Milestone["category"],
  { label: string; className: string }
> = {
  financial: {
    label: "Financial",
    className:
      "bg-[#f5c542]/15 text-[#b3860f] border-[#f5c542]/30 hover:bg-[#f5c542]/20",
  },
  career: {
    label: "Career",
    className:
      "bg-[#1d1d1f]/10 text-[#555555] border-[#1d1d1f]/15 hover:bg-[#1d1d1f]/15",
  },
  personal: {
    label: "Personal",
    className:
      "bg-[#f2f2f2] text-[#8a8a8a] border-[#e5e5e5] hover:bg-[#e5e5e5]/70",
  },
}

function formatCompletedDate(dateString: string | null) {
  if (!dateString) return null
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function MilestoneList({ milestones }: MilestoneListProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Milestone["category"]>("personal")
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)

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

  function handleReset() {
    setPendingId("reset")
    startTransition(async () => {
      await resetDefaultMilestones()
      toast.success("Milestones reset to recommended")
      setPendingId(null)
    })
  }

  function handleToggle(milestone: Milestone) {
    const isCompleting = milestone.status !== "completed"
    setFlashId(null)
    if (isCompleting) setFlashId(milestone.id)
    setPendingId(milestone.id)
    startTransition(async () => {
      await toggleMilestone(milestone.id, milestone.status)
      if (isCompleting) {
        const completed = completedCount + 1
        toast.success(
          `${milestone.title} complete! ${completed} of ${milestones.length} done.`
        )
        setTimeout(
          () =>
            setFlashId((current) =>
              current === milestone.id ? null : current
            ),
          200
        )
      } else {
        toast.success("Milestone reopened")
      }
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
      await addMilestone({ title, description, category })
      toast.success("Milestone added")
      setTitle("")
      setDescription("")
      setCategory("personal")
    })
  }

  if (!hasMilestones) {
    return (
      <Card className="bg-white rounded-3xl border-none shadow-sm p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1d1d1f]/10 flex items-center justify-center mx-auto mb-6">
          <Route size={28} strokeWidth={1.75} className="text-[#f5c542]" />
        </div>
        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-3">
          Build your exit roadmap
        </h2>
        <p className="text-[#8a8a8a] mb-8 max-w-md mx-auto">
          Add the milestones that stand between you and your last day. Or start
          with our recommended checklist.
        </p>
        <Button
          onClick={handleSeed}
          disabled={isPending}
          className="rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6 h-12"
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
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            Milestone Tracker
          </h1>
          <p className="text-[#8a8a8a] mt-1">
            {completedCount} of {milestones.length} completed ({progress}%)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isPending || pendingId === "reset"}
          className="rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 hover:bg-white text-[#555555] h-11 px-4"
        >
          {pendingId === "reset" ? (
            <Loader2 className="animate-spin" size={16} strokeWidth={1.75} />
          ) : (
            <>
              <RotateCcw size={16} strokeWidth={1.75} className="mr-2" />
              Reset to recommended
            </>
          )}
        </Button>
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
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as Milestone["category"])}
        >
          <SelectTrigger className="h-12 min-h-12 py-0 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5 w-full md:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="career">Career</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="submit"
          disabled={isPending || !title.trim()}
          className="h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
          ) : (
            <>
              
              Add
            </>
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {milestones.map((milestone, index) => {
            const isCompleted = milestone.status === "completed"
            const categoryStyle = CATEGORY_STYLES[milestone.category]
            const completedDate = formatCompletedDate(milestone.completed_at)
            const isFlashing = flashId === milestone.id

            return (
              <motion.div
                key={milestone.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`rounded-3xl border-none shadow-sm border-l-4 transition-all duration-200 ${
                    isFlashing ? "bg-[#f5c542]/20" : "bg-white"
                  } ${
                    isCompleted ? "opacity-75" : "opacity-100"
                  } ${
                    isCompleted
                      ? "border-l-[#34c759]"
                      : "border-l-[#f5c542]"
                  }`}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="relative mt-0.5">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleToggle(milestone)}
                        disabled={pendingId === milestone.id}
                        className="size-6 rounded-full border-[#0066cc] data-[state=checked]:bg-[#1d1d1f] data-[state=checked]:text-white"
                      />
                      <AnimatePresence>
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                            }}
                            className="pointer-events-none absolute inset-0 flex items-center justify-center"
                          >
                            <Check
                              size={14}
                              strokeWidth={2.5}
                              className="text-white"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-semibold truncate ${
                            isCompleted
                              ? "text-[#8a8a8a] line-through"
                              : "text-[#1d1d1f]"
                          }`}
                        >
                          {milestone.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase tracking-wide font-semibold ${categoryStyle.className}`}
                        >
                          {categoryStyle.label}
                        </Badge>
                      </div>
                      {milestone.description && (
                        <p
                          className={`text-sm mt-1 ${
                            isCompleted ? "text-[#b0b0b0]" : "text-[#8a8a8a]"
                          }`}
                        >
                          {milestone.description}
                        </p>
                      )}
                      {isCompleted && completedDate && (
                        <p className="text-xs text-[#34c759] font-medium mt-2">
                          Completed {completedDate}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(milestone.id)}
                      disabled={pendingId === milestone.id}
                      className="rounded-xl text-[#8a8a8a] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10"
                    >
                      {pendingId === milestone.id ? (
                        <Loader2
                          className="animate-spin"
                          size={16}
                          strokeWidth={1.75}
                        />
                      ) : (
                        <Trash2 size={16} strokeWidth={1.75} />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
