"use client"

import { useCurrency } from "@/components/providers/currency-provider"
import { formatCurrency } from "@/lib/calculator/utils"

interface SavingsProjectionChartProps {
  currentSavings: number
  monthlySurplus: number
  requiredSavings: number
  projectedMonthsToGoal: number | null
  compact?: boolean
}

export function SavingsProjectionChart({
  currentSavings,
  monthlySurplus,
  requiredSavings,
  projectedMonthsToGoal,
  compact = false,
}: SavingsProjectionChartProps) {
  const currency = useCurrency()
  if (projectedMonthsToGoal === null || projectedMonthsToGoal <= 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${compact ? "h-40" : "h-56"}`}>
        <p className="text-sm text-[#8a8a8a]">
          {currentSavings >= requiredSavings
            ? "You're fully funded."
            : "Add income or reduce expenses to see your projection."}
        </p>
      </div>
    )
  }

  const months = Math.min(projectedMonthsToGoal, 60)
  const data: { month: number; savings: number }[] = []
  for (let i = 0; i <= months; i++) {
    data.push({
      month: i,
      savings: Math.min(currentSavings + monthlySurplus * i, requiredSavings * 1.05),
    })
  }

  const maxSavings = Math.max(requiredSavings, data[data.length - 1].savings)
  const width = 600
  const height = compact ? 180 : 260
  const padding = { top: 24, right: 24, bottom: 40, left: 64 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const xScale = (month: number) =>
    padding.left + (month / months) * chartWidth
  const yScale = (savings: number) =>
    padding.top + chartHeight - (savings / maxSavings) * chartHeight

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.month)} ${yScale(d.savings)}`)
    .join(" ")

  const areaPath = `${linePath} L ${xScale(months)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`

  const yTicks = [0, maxSavings * 0.5, maxSavings]
  const xTicks = [0, Math.round(months / 2), months]

  return (
    <div className="w-full">
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={yScale(tick)}
              x2={padding.left + chartWidth}
              y2={yScale(tick)}
              stroke="#e8e0cc"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}

          {/* Area under projection line */}
          <path
            d={areaPath}
            fill="url(#savingsGradient)"
            opacity={0.15}
          />

          {/* Goal line */}
          <line
            x1={padding.left}
            y1={yScale(requiredSavings)}
            x2={padding.left + chartWidth}
            y2={yScale(requiredSavings)}
            stroke="var(--accent-color)"
            strokeWidth={2}
            strokeDasharray="6 4"
          />

          {/* Projection line */}
          <path
            d={linePath}
            fill="none"
            stroke="#1d1d1f"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Quit date indicator */}
          <line
            x1={xScale(months)}
            y1={padding.top}
            x2={xScale(months)}
            y2={padding.top + chartHeight}
            stroke="var(--accent-color)"
            strokeWidth={2}
          />
          <circle
            cx={xScale(months)}
            cy={yScale(Math.min(currentSavings + monthlySurplus * months, requiredSavings))}
            r={6}
            fill="var(--accent-color)"
            stroke="white"
            strokeWidth={3}
          />

          {/* Y-axis labels */}
          {yTicks.map((tick, i) => (
            <text
              key={`y-${i}`}
              x={padding.left - 12}
              y={yScale(tick) + 4}
              textAnchor="end"
              className="text-xs fill-[#8a8a8a]"
            >
              {formatCurrency(tick, currency)}
            </text>
          ))}

          {/* X-axis labels */}
          {xTicks.map((tick, i) => (
            <text
              key={`x-${i}`}
              x={xScale(tick)}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-[#8a8a8a]"
            >
              {tick === 0 ? "Now" : `${tick} mo`}
            </text>
          ))}

          {/* Goal label */}
          <text
            x={padding.left + chartWidth}
            y={yScale(requiredSavings) - 8}
            textAnchor="end"
            className="text-xs fill-[var(--accent-color)] font-medium"
          >
            Goal {formatCurrency(requiredSavings, currency)}
          </text>

          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d1d1f" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1d1d1f" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
