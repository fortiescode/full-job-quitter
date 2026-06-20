"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Expense, ExpenseCategory } from "@/lib/finances/actions"
import { useCurrency } from "@/components/providers/currency-provider"
import { formatCurrency } from "@/lib/calculator/utils"

interface RecentExpensesProps {
  expenses: Expense[]
  categories: ExpenseCategory[]
  compact?: boolean
}

export function RecentExpenses({ expenses, categories, compact = false }: RecentExpensesProps) {
  const currency = useCurrency()
  const recent = expenses.slice(0, compact ? 4 : 5)

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {recent.length === 0 ? (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-6" : "py-10"}`}>
          <p className={`text-[#8a8a8a] mb-3 ${compact ? "text-xs" : "text-sm"}`}>
            No expenses recorded yet
          </p>
          <Link href="/finances?tab=expenses">
            <Button
              variant="outline"
              className={`rounded-xl border-[#e8e0cc] bg-white hover:bg-[#f8f1de] text-[#1d1d1f] ${compact ? "h-8 text-xs" : "h-10"}`}
            >
              <Plus size={compact ? 14 : 16} strokeWidth={1.75} className="mr-1.5" />
              Record your first expense
            </Button>
          </Link>
        </div>
      ) : (
        recent.map((expense, index) => {
          const category = categories.find((c) => c.id === expense.category_id)
          return (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl flex items-center justify-center ${compact ? "w-9 h-9" : "w-10 h-10"}`}
                  style={{ background: `${category?.color ?? "#8a8a8a"}15` }}
                >
                  <div
                    className={`rounded-full ${compact ? "w-2.5 h-2.5" : "w-3 h-3"}`}
                    style={{ background: category?.color ?? "#8a8a8a" }}
                  />
                </div>
                <div>
                  <p className={`font-medium text-[#1d1d1f] ${compact ? "text-xs" : "text-sm"}`}>{expense.name}</p>
                  <p className={`text-[#8a8a8a] ${compact ? "text-[10px]" : "text-xs"}`}>
                    {category?.name ?? "Uncategorized"} • {expense.expense_date}
                  </p>
                </div>
              </div>
              <span className={`font-semibold text-[#1d1d1f] ${compact ? "text-xs" : "text-sm"}`}>
                {formatCurrency(Number(expense.amount), currency)}
              </span>
            </motion.div>
          )
        })
      )}
    </div>
  )
}
