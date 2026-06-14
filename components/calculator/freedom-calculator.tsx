"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Save, Loader2, Wallet, Briefcase, PiggyBank, TrendingUp, Calendar, Shield, Target, Umbrella } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Input } from "@/components/ui/input"
import { upsertFinancialGoal } from "@/lib/financial/actions"
import { calculateRunway, formatCurrency, formatNumber } from "@/lib/calculator/utils"
import { toast } from "sonner"
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

interface MoneyFieldProps {
  label: string
  icon: React.ElementType
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  note?: React.ReactNode
}

function MoneyField({
  label,
  icon: Icon,
  value,
  onChange,
  min = 0,
  max = 50000,
  step = 500,
  note,
}: MoneyFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-[#1d1d1f]">
          <Icon size={16} strokeWidth={1.75} />
          {label}
        </Label>
        <span className="text-sm font-medium text-[#f5c542]">
          {formatCurrency(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="py-2"
      />
      <CurrencyInput
        value={value}
        onChange={onChange}
        className="rounded-xl"
      />
      {note && <div className="text-xs text-[#8a8a8a]">{note}</div>}
    </div>
  )
}

interface NumberFieldProps {
  label: string
  icon: React.ElementType
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}

function NumberField({
  label,
  icon: Icon,
  value,
  onChange,
  min = 1,
  max = 60,
  step = 1,
  unit,
}: NumberFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-[#1d1d1f]">
          <Icon size={16} strokeWidth={1.75} />
          {label}
        </Label>
        <span className="text-sm font-medium text-[#f5c542]">
          {value} {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="py-2"
      />
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50 pr-16"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8a8a8a]">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

export function FreedomCalculator({ initialGoal, riskTolerance }: FreedomCalculatorProps) {
  // Working state
  const [monthlySalary, setMonthlySalary] = useState(
    Number(initialGoal?.monthly_income) || 0
  )
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    Number(initialGoal?.monthly_expenses) || 0
  )
  const [currentSavings, setCurrentSavings] = useState(
    Number(initialGoal?.current_savings) || 0
  )

  // Post-quit state
  const [postQuitIncome, setPostQuitIncome] = useState(
    Number(initialGoal?.desired_post_quit_income) || 0
  )
  const [postQuitExpenses, setPostQuitExpenses] = useState(
    Number(initialGoal?.monthly_expenses_after_quit) || Number(initialGoal?.monthly_expenses) || 0
  )
  const [hasEditedPostQuitExpenses, setHasEditedPostQuitExpenses] = useState(false)
  const [monthsOfSafety, setMonthsOfSafety] = useState(
    initialGoal?.target_runway_months || 6
  )

  const [isPending, startTransition] = useTransition()

  function handleMonthlyExpensesChange(value: number) {
    setMonthlyExpenses(value)
    if (!hasEditedPostQuitExpenses) {
      setPostQuitExpenses(value)
    }
  }

  function handlePostQuitExpensesChange(value: number) {
    setPostQuitExpenses(value)
    setHasEditedPostQuitExpenses(true)
  }

  const monthlySavings = monthlySalary - monthlyExpenses
  const isOverspending = monthlySavings < 0

  const runway = calculateRunway({
    monthlySalary,
    monthlyExpenses,
    currentSavings,
    postQuitIncome,
    monthlyExpensesAfterQuit: postQuitExpenses,
    monthsOfSafety,
  })

  const whatIfRunway = calculateRunway({
    monthlySalary: monthlySalary + WHAT_IF_EXTRA,
    monthlyExpenses,
    currentSavings,
    postQuitIncome,
    monthlyExpensesAfterQuit: postQuitExpenses,
    monthsOfSafety,
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
    startTransition(async () => {
      const result = await upsertFinancialGoal({
        monthly_income: monthlySalary,
        monthly_expenses: monthlyExpenses,
        current_savings: currentSavings,
        monthly_savings_rate: monthlySavings,
        desired_post_quit_income: postQuitIncome,
        monthly_expenses_after_quit: postQuitExpenses,
        target_runway_months: monthsOfSafety,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Calculator saved")
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
          Freedom Calculator
        </h1>
        <p className="text-[#8a8a8a] mt-1">
          Adjust the numbers to see your path to quitting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: inputs */}
        <div className="space-y-6">
          {/* Section header */}
          <div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Briefcase size={20} strokeWidth={1.75} />
              While you&apos;re working
            </h2>
            <p className="text-sm text-[#8a8a8a]">Your current money situation</p>
          </div>

          <Card className="bg-white rounded-3xl border-none shadow-sm border-l-[3px] border-l-[#3B82F6]">
            <CardContent className="p-6 space-y-8">
              <MoneyField
                label="Monthly salary"
                icon={Briefcase}
                value={monthlySalary}
                onChange={setMonthlySalary}
                min={0}
                max={50000}
                step={500}
              />

              <MoneyField
                label="Monthly expenses"
                icon={Wallet}
                value={monthlyExpenses}
                onChange={handleMonthlyExpensesChange}
                min={0}
                max={20000}
                step={100}
              />

              <MoneyField
                label="Current savings"
                icon={PiggyBank}
                value={currentSavings}
                onChange={setCurrentSavings}
                min={0}
                max={500000}
                step={1000}
              />

              <div className="space-y-2 rounded-2xl bg-[#f8f1de] p-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-[#1d1d1f]">
                    <TrendingUp size={16} strokeWidth={1.75} />
                    Monthly savings
                  </Label>
                  <span
                    className={`text-sm font-semibold ${
                      isOverspending ? "text-[#ff3b30]" : "text-[#34c759]"
                    }`}
                  >
                    {formatCurrency(monthlySavings)}
                  </span>
                </div>
                <p className="text-xs text-[#8a8a8a]">
                  {isOverspending
                    ? "You're spending more than you earn"
                    : "Auto-calculated: salary minus expenses"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section header */}
          <div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Umbrella size={20} strokeWidth={1.75} />
              After you quit
            </h2>
            <p className="text-sm text-[#8a8a8a]">Your future money situation</p>
          </div>

          <Card className="bg-white rounded-3xl border-none shadow-sm border-l-[3px] border-l-[#f5c542]">
            <CardContent className="p-6 space-y-8">
              <MoneyField
                label="Expected monthly income after quitting"
                icon={Briefcase}
                value={postQuitIncome}
                onChange={setPostQuitIncome}
                min={0}
                max={50000}
                step={500}
                note={
                  <>
                    Also set in{" "}
                    <Link
                      href="/settings"
                      className="text-[#3B82F6] hover:underline"
                    >
                      Settings
                    </Link>
                  </>
                }
              />

              <MoneyField
                label="Monthly expenses after quitting"
                icon={Wallet}
                value={postQuitExpenses}
                onChange={handlePostQuitExpensesChange}
                min={0}
                max={20000}
                step={100}
              />

              <NumberField
                label="Months of safety"
                icon={Shield}
                value={monthsOfSafety}
                onChange={setMonthsOfSafety}
                min={1}
                max={60}
                step={1}
                unit="months"
              />

              <Button
                onClick={handleSave}
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
                ) : (
                  <>
                    <Save size={18} strokeWidth={1.75} className="mr-2" />
                    Save calculator
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right side: results */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Target size={20} strokeWidth={1.75} />
              Your freedom forecast
            </h2>
            <p className="text-sm text-[#8a8a8a]">What the numbers mean</p>
          </div>

          <Card className="bg-white rounded-3xl border-none shadow-sm border-l-4 border-l-[#f5c542]">
            <CardContent className="p-6">
              <p className="text-sm text-[#8a8a8a] mb-1">Required savings</p>
              <p className="text-4xl font-semibold text-[#1d1d1f]">
                {formatCurrency(runway.requiredSavings)}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-5">
            <Card className="bg-white rounded-3xl border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-[#8a8a8a] mb-1">Current runway</p>
                <p className="text-2xl font-semibold text-[#1d1d1f]">
                  {formatNumber(runway.currentRunwayMonths, 1)} mo
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-3xl border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-[#8a8a8a] mb-1">Savings gap</p>
                <p className="text-2xl font-semibold text-[#1d1d1f]">
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
              <p className="text-3xl font-semibold text-[#1d1d1f]">
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
                  If you earn{" "}
                  <span className="font-semibold text-[#1d1d1f]">
                    {formatCurrency(WHAT_IF_EXTRA)} more/month
                  </span>
                  {" "}while working, you&apos;d quit{" "}
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
                Safety net fully funded
              </Badge>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
