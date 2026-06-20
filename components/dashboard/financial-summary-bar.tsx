"use client"

import { useCurrency } from "@/components/providers/currency-provider"
import { formatCurrency } from "@/lib/calculator/utils"

interface FinancialSummaryBarProps {
  income: number
  expenses: number
  obligations: number
  compact?: boolean
}

export function FinancialSummaryBar({
  income,
  expenses,
  obligations,
  compact = false,
}: FinancialSummaryBarProps) {
  const currency = useCurrency()
  const net = income - expenses - obligations

  const items = [
    { label: "Income", value: income, color: "text-[#1d1d1f]" },
    { label: "Expenses", value: expenses, color: "text-[#ff3b30]" },
    { label: "Obligations", value: obligations, color: "text-[#ff9500]" },
    { label: "Net", value: net, color: net >= 0 ? "text-[#34c759]" : "text-[#ff3b30]" },
  ]

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-[#e8e0cc] flex flex-wrap items-center ${compact ? "px-4 py-2 gap-3" : "px-5 py-3 gap-4"}`}>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-[#8a8a8a] mr-1">
              {index === items.length - 1 ? "=" : "-"}
            </span>
          )}
          <span className={`text-[#8a8a8a] ${compact ? "text-xs" : "text-sm"}`}>{item.label}</span>
          <span className={`font-semibold ${item.color} ${compact ? "text-sm" : "text-base"}`}>
            {formatCurrency(item.value, currency)}
          </span>
        </div>
      ))}
    </div>
  )
}
