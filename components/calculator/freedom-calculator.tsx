"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { Calculator, Save, Loader2, TrendingUp, Wallet, Calendar, Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { upsertFinancialGoal } from "@/lib/financial/actions"
import { calculateRunway, formatCurrency, formatNumber } from "@/lib/calculator/utils"
import type { FinancialGoal } from "@/lib/financial/actions"

interface FreedomCalculatorProps {
  initialGoal: FinancialGoal | null
  riskTolerance: "conservative" | "moderate" | "aggressive" | null
}

const WHAT_IF_EXTRA = 500

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function ProjectionBars({
  currentSavings,
  requiredSavings,
}: {
  currentSavings: number
  requiredSavings: number
}) {
  const bars = Array.from({ length: 6 }, (_, i) => {
    const progress = i / 5
    const value = currentSavings + (requiredSavings - currentSavings) * progress
    const clampedValue = Math.max(0, Math.min(value, requiredSavings))
    const heightPercent = requiredSavings > 0 ? (clampedValue / requiredSavings) * 100 : 0
    return { value: clampedValue, heightPercent, isProjected: i >= 3 }
  })

  return (
    <div className="flex items-end justify-between gap-2 h-24">
      {bars.map((bar, index) => (
        <motion.div
          key={index}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(bar.heightPercent, 8)}%` }}
          transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
          className={`flex-1 rounded-t-lg ${
            bar.isProjected ? "bg-[#f5c542]" : "bg-[#d4d0c5]"
          }`}
          title={formatCurrency(bar.value)}
        />
      ))}
    </div>
  )
}

export function FreedomCalculator({ initialGoal, riskTolerance }: FreedomCalculatorProps) {
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    Number(initialGoal?.monthly_expenses) || 3000
  )
  const [currentSavings, setCurrentSavings] = useState(
    Number(initialGoal?.current_savings) || 10000
  )
  const [monthlySavingsRate, setMonthlySavingsRate] = useState(
    Number(initialGoal?.monthly_savings_rate) || 4000
  )
  const [targetRunwayMonths, setTargetRunwayMonths] = useState(
    initialGoal?.target_runway_months || 12
  )
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const runway = calculateRunway({
    monthlyExpenses,
    currentSavings,
    monthlySavingsRate,
    targetRunwayMonths,
  })

  const whatIfRunway = calculateRunway({
    monthlyExpenses,
    currentSavings,
    monthlySavingsRate: monthlySavingsRate + WHAT_IF_EXTRA,
    targetRunwayMonths,
  })

  const monthsSaved =
    runway.projectedMonthsToGoal && whatIfRunway.projectedMonthsToGoal
      ? runway.projectedMonthsToGoal - whatIfRunway.projectedMonthsToGoal
      : 0

  const riskConfig = {
    conservative: { label: "Conservative plan", className: "bg-[#e8e0cc] text-[#1d1d1f] hover:bg-[#e8e0cc]/80" },
    moderate: { label: "Moderate plan", className: "bg-[#f5c542] text-[#1d1d1f] hover:bg-[#f5c542]/80" },
    aggressive: { label: "Aggressive plan", className: "bg-[#ff9500] text-white hover:bg-[#ff9500]/80" },
  }

  const riskBadge = riskTolerance ? riskConfig[riskTolerance] : null

  function handleSave() {
    setSaved(false)
    startTransition(async () => {
      await upsertFinancialGoal({
        monthly_expenses: monthlyExpenses,
        current_savings: currentSavings,
        monthly_savings_rate: monthlySavingsRate,
        target_runway_months: targetRunwayMonths,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] ">
          Freedom Calculator
        </h1>
        <p className="text-[#8a8a8a] mt-1">
          Adjust the numbers to see your path to quitting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white rounded-3xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#1d1d1f]  flex items-center gap-2">
              <Calculator size={18} strokeWidth={1.75} />
              Your inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[#1d1d1f] ">
                  <Wallet size={16} strokeWidth={1.75} />
                  Monthly expenses
                </Label>
                <span className="text-sm font-medium text-[#f5c542]">
                  {formatCurrency(monthlyExpenses)}
                </span>
              </div>
              <Slider
                value={[monthlyExpenses]}
                onValueChange={([v]) => setMonthlyExpenses(v)}
                min={500}
                max={20000}
                step={100}
                className="py-2"
              />
              <Input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[#1d1d1f] ">
                  <TrendingUp size={16} strokeWidth={1.75} />
                  Current savings
                </Label>
                <span className="text-sm font-medium text-[#f5c542]">
                  {formatCurrency(currentSavings)}
                </span>
              </div>
              <Slider
                value={[currentSavings]}
                onValueChange={([v]) => setCurrentSavings(v)}
                min={0}
                max={500000}
                step={1000}
                className="py-2"
              />
              <Input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[#1d1d1f] ">
                  <Calendar size={16} strokeWidth={1.75} />
                  Monthly savings / income
                </Label>
                <span className="text-sm font-medium text-[#f5c542]">
                  {formatCurrency(monthlySavingsRate)}
                </span>
              </div>
              <Slider
                value={[monthlySavingsRate]}
                onValueChange={([v]) => setMonthlySavingsRate(v)}
                min={0}
                max={50000}
                step={500}
                className="py-2"
              />
              <Input
                type="number"
                value={monthlySavingsRate}
                onChange={(e) => setMonthlySavingsRate(Number(e.target.value))}
                className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[#1d1d1f] ">
                  <Target size={16} strokeWidth={1.75} />
                  Target runway
                </Label>
                <span className="text-sm font-medium text-[#f5c542]">
                  {targetRunwayMonths} months
                </span>
              </div>
              <Slider
                value={[targetRunwayMonths]}
                onValueChange={([v]) => setTargetRunwayMonths(v)}
                min={3}
                max={60}
                step={1}
                className="py-2"
              />
              <Input
                type="number"
                value={targetRunwayMonths}
                onChange={(e) => setTargetRunwayMonths(Number(e.target.value))}
                className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white"
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
              ) : saved ? (
                "Saved"
              ) : (
                <>
                  <Save size={18} strokeWidth={1.75} className="mr-2" />
                  Save goal
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="bg-white rounded-3xl border-none shadow-sm border-l-4 border-l-[#f5c542]">
            <CardContent className="p-6">
              <p className="text-sm text-[#8a8a8a] mb-1">Required savings</p>
              <p className="text-4xl font-semibold text-[#1d1d1f] ">
                {formatCurrency(runway.requiredSavings)}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-5">
            <Card className="bg-white rounded-3xl border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-[#8a8a8a] mb-1">Current runway</p>
                <p className="text-2xl font-semibold text-[#1d1d1f] ">
                  {formatNumber(runway.currentRunwayMonths, 1)} mo
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-3xl border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-[#8a8a8a] mb-1">Savings gap</p>
                <p className="text-2xl font-semibold text-[#1d1d1f] ">
                  {formatCurrency(Math.max(runway.savingsGap, 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white rounded-3xl border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-sm text-[#8a8a8a]">Projected quit date</p>
                {riskBadge && (
                  <Badge className={`rounded-full text-xs font-medium ${riskBadge.className}`}>
                    {riskBadge.label}
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-semibold text-[#1d1d1f] ">
                {runway.isFunded
                  ? "You're funded"
                  : formatDate(runway.projectedQuitDate)}
              </p>
              {!runway.isFunded && runway.projectedMonthsToGoal && (
                <p className="text-sm text-[#8a8a8a] mt-2">
                  About {runway.projectedMonthsToGoal} months away
                </p>
              )}

              {!runway.isFunded && monthsSaved > 0 && (
                <p className="text-sm text-[#8a8a8a] mt-3">
                  If you save{" "}
                  <span className="font-semibold text-[#1d1d1f]">
                    {formatCurrency(WHAT_IF_EXTRA)} more/month
                  </span>
                  , you&apos;d quit{" "}
                  <span className="font-semibold text-[#1d1d1f]">
                    {monthsSaved} months earlier
                  </span>{" "}
                  ({formatDate(whatIfRunway.projectedQuitDate)})
                </p>
              )}

              <div className="mt-6">
                <ProjectionBars
                  currentSavings={currentSavings}
                  requiredSavings={runway.requiredSavings}
                />
              </div>
            </CardContent>
          </Card>

          {runway.isFunded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Badge className="w-full h-12 rounded-xl bg-[#34c759]/10 text-[#34c759] hover:bg-[#34c759]/15 text-sm font-medium flex items-center justify-center">
                Target runway fully funded
              </Badge>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
