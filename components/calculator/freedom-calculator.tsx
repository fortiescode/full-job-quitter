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
}

export function FreedomCalculator({ initialGoal }: FreedomCalculatorProps) {
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
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Freedom Calculator
        </h1>
        <p className="text-[#6e6e73] mt-1">
          Adjust the numbers to see your path to quitting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-panel rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Calculator size={18} strokeWidth={1.75} />
              Your inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <Wallet size={16} strokeWidth={1.75} />
                  Monthly expenses
                </Label>
                <span className="text-sm font-medium text-[#0066cc]">
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
                className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <TrendingUp size={16} strokeWidth={1.75} />
                  Current savings
                </Label>
                <span className="text-sm font-medium text-[#0066cc]">
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
                className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <Calendar size={16} strokeWidth={1.75} />
                  Monthly savings / income
                </Label>
                <span className="text-sm font-medium text-[#0066cc]">
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
                className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <Target size={16} strokeWidth={1.75} />
                  Target runway
                </Label>
                <span className="text-sm font-medium text-[#0066cc]">
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
                className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-[#0066cc] hover:bg-[#0066cc]/90 text-white"
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
          <Card className="glass-panel rounded-2xl border-l-4 border-l-[#0066cc]">
            <CardContent className="p-6">
              <p className="text-sm text-[#6e6e73] mb-1">Required savings</p>
              <p className="text-4xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {formatCurrency(runway.requiredSavings)}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-5">
            <Card className="glass-panel rounded-2xl">
              <CardContent className="p-6">
                <p className="text-sm text-[#6e6e73] mb-1">Current runway</p>
                <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {formatNumber(runway.currentRunwayMonths, 1)} mo
                </p>
              </CardContent>
            </Card>
            <Card className="glass-panel rounded-2xl">
              <CardContent className="p-6">
                <p className="text-sm text-[#6e6e73] mb-1">Savings gap</p>
                <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {formatCurrency(Math.max(runway.savingsGap, 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-panel rounded-2xl">
            <CardContent className="p-6">
              <p className="text-sm text-[#6e6e73] mb-1">Projected quit date</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {runway.isFunded
                  ? "You're funded"
                  : runway.projectedQuitDate
                  ? runway.projectedQuitDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Need positive monthly surplus"}
              </p>
              {!runway.isFunded && runway.projectedMonthsToGoal && (
                <p className="text-sm text-[#6e6e73] mt-2">
                  About {runway.projectedMonthsToGoal} months away
                </p>
              )}
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
