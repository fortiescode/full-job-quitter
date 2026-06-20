"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ExpenseCategory } from "@/lib/finances/actions"
import { useCurrency } from "@/components/providers/currency-provider"
import { formatCurrency } from "@/lib/calculator/utils"

interface ExpenseBarChartProps {
  categories: ExpenseCategory[]
  expensesByCategory: Record<string, number>
  compact?: boolean
}

export function ExpenseBarChart({ categories, expensesByCategory, compact = false }: ExpenseBarChartProps) {
  const currency = useCurrency()
  const data = categories.map((category) => ({
    name: category.name,
    amount: expensesByCategory[category.id] || 0,
    color: category.color,
    budget: Number(category.budget_limit),
  }))

  const maxAmount = Math.max(...data.map((d) => d.amount), ...data.map((d) => d.budget), 1)

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      {data.length === 0 ? (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-6" : "py-10"}`}>
          <p className={`text-[#8a8a8a] mb-3 ${compact ? "text-xs" : "text-sm"}`}>
            No expense categories yet
          </p>
          <Link href="/finances?tab=categories">
            <Button
              variant="outline"
              className={`rounded-xl border-[#e8e0cc] bg-white hover:bg-[#f8f1de] text-[#1d1d1f] ${compact ? "h-8 text-xs" : "h-10"}`}
            >
              <Plus size={compact ? 14 : 16} strokeWidth={1.75} className="mr-1.5" />
              Add your first category
            </Button>
          </Link>
        </div>
      ) : (
        data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={compact ? "space-y-1.5" : "space-y-2"}
          >
            <div className={`flex items-center justify-between ${compact ? "text-xs" : "text-sm"}`}>
              <span className="font-medium text-[#1d1d1f]">{item.name}</span>
              <span className="text-[#8a8a8a]">
                {formatCurrency(item.amount, currency)}
                {item.budget > 0 && (
                  <span className="ml-1">/ {formatCurrency(item.budget, currency)}</span>
                )}
              </span>
            </div>
            <div className={`bg-[#f8f1de] rounded-full overflow-hidden ${compact ? "h-2" : "h-3"}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((item.amount / maxAmount) * 100, 100)}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
                className="h-full rounded-full"
                style={{ background: item.color }}
              />
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}
