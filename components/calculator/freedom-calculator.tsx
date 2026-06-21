"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Save, Loader2, Wallet, Briefcase, PiggyBank, TrendingUp, Calendar, Shield, Target, Umbrella, ArrowRight, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/components/providers/currency-provider"
import { upsertFinancialGoal } from "@/lib/financial/actions"
import { calculateRunway, formatCurrency, formatNumber } from "@/lib/calculator/utils"
import { toast } from "sonner"
import type { FinancialGoal } from "@/lib/financial/actions"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FreedomCalculatorProps {
  initialGoal: FinancialGoal | null
  riskTolerance: "conservative" | "moderate" | "aggressive" | null
}

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function ProjectionBars({
  currentSavings,
  requiredSavings,
  currency,
}: {
  currentSavings: number
  requiredSavings: number
  currency: string
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
            bar.isProjected ? "bg-[var(--accent-color)]" : "bg-[#d4d0c5]"
          }`}
          title={formatCurrency(bar.value, currency)}
        />
      ))}
    </div>
  )
}

function FieldTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex text-[#b0b0b0] hover:text-[#8a8a8a] transition-colors"
        >
          <HelpCircle size={14} strokeWidth={1.75} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start">
        {children}
      </TooltipContent>
    </Tooltip>
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
  tooltip?: React.ReactNode
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
  tooltip,
}: MoneyFieldProps) {
  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-[#1d1d1f]">
            <Icon size={16} strokeWidth={1.75} />
            {label}
            {tooltip && <FieldTooltip>{tooltip}</FieldTooltip>}
          </Label>
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
    </TooltipProvider>
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
  tooltip?: React.ReactNode
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
  tooltip,
}: NumberFieldProps) {
  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-[#1d1d1f]">
            <Icon size={16} strokeWidth={1.75} />
            {label}
            {tooltip && <FieldTooltip>{tooltip}</FieldTooltip>}
          </Label>
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
    </TooltipProvider>
  )
}

interface QuitFasterTipsProps {
  monthlySalary: number
  monthlyExpenses: number
  monthlySavings: number
  postQuitIncome: number
  postQuitExpenses: number
  currentSavings: number
  monthsOfSafety: number
  currentProjectedMonths: number
  currency: string
  onScenario: (changes: {
    monthlySalary?: number
    monthlyExpenses?: number
    postQuitIncome?: number
  }) => void
}

function QuitFasterTips({
  monthlySalary,
  monthlyExpenses,
  monthlySavings,
  postQuitIncome,
  postQuitExpenses,
  currentSavings,
  monthsOfSafety,
  currentProjectedMonths,
  currency,
  onScenario,
}: QuitFasterTipsProps) {
  // Scenario 1: save 2x current monthly savings by raising salary
  const scenario1Salary = monthlySalary + monthlySavings
  const scenario1Runway = calculateRunway({
    monthlySalary: scenario1Salary,
    monthlyExpenses,
    currentSavings,
    postQuitIncome,
    monthlyExpensesAfterQuit: postQuitExpenses,
    monthsOfSafety,
  })
  const scenario1MonthsSaved =
    currentProjectedMonths - (scenario1Runway.projectedMonthsToGoal ?? currentProjectedMonths)

  // Scenario 2: earn 1.5x post-quit income
  const scenario2PostIncome = Math.round(postQuitIncome * 1.5)
  const lessAmount = Math.max(
    0,
    (scenario2PostIncome - postQuitIncome) * monthsOfSafety
  )

  // Scenario 3: cut expenses by 20%
  const scenario3Expenses = Math.round(monthlyExpenses * 0.8)
  const scenario3Runway = calculateRunway({
    monthlySalary,
    monthlyExpenses: scenario3Expenses,
    currentSavings,
    postQuitIncome,
    monthlyExpensesAfterQuit: postQuitExpenses,
    monthsOfSafety,
  })
  const scenario3MonthsSaved =
    currentProjectedMonths - (scenario3Runway.projectedMonthsToGoal ?? currentProjectedMonths)

  return (
    <div className="rounded-2xl bg-[#f8f1de] p-4 space-y-3">
      <p className="text-sm font-medium text-[#1d1d1f]">How to quit faster</p>

      <button
        type="button"
        onClick={() => onScenario({ monthlySalary: scenario1Salary })}
        className="w-full flex items-center justify-between text-left text-sm text-[#8a8a8a] hover:text-[#1d1d1f] transition-colors group"
      >
        <span>
          If you saved{" "}
          <span className="font-medium text-[#1d1d1f]">
            {formatCurrency(monthlySavings * 2, currency)}/month
          </span>
          , you&apos;d quit{" "}
          <span className="font-medium text-[#1d1d1f]">
            {scenario1MonthsSaved} months earlier
          </span>
        </span>
        <ArrowRight
          size={16}
          strokeWidth={1.75}
          className="shrink-0 ml-2 text-[var(--accent-color)] group-hover:translate-x-1 transition-transform"
        />
      </button>

      {postQuitIncome < postQuitExpenses && (
        <button
          type="button"
          onClick={() => onScenario({ postQuitIncome: scenario2PostIncome })}
          className="w-full flex items-center justify-between text-left text-sm text-[#8a8a8a] hover:text-[#1d1d1f] transition-colors group"
        >
          <span>
            If you earned{" "}
            <span className="font-medium text-[#1d1d1f]">
              {formatCurrency(scenario2PostIncome, currency)}/month
            </span>{" "}
            after quitting, you&apos;d need{" "}
            <span className="font-medium text-[#1d1d1f]">
              {formatCurrency(lessAmount, currency)} less
            </span>
          </span>
          <ArrowRight
            size={16}
            strokeWidth={1.75}
            className="shrink-0 ml-2 text-[var(--accent-color)] group-hover:translate-x-1 transition-transform"
          />
        </button>
      )}

      <button
        type="button"
        onClick={() => onScenario({ monthlyExpenses: scenario3Expenses })}
        className="w-full flex items-center justify-between text-left text-sm text-[#8a8a8a] hover:text-[#1d1d1f] transition-colors group"
      >
        <span>
          If you cut expenses by{" "}
          <span className="font-medium text-[#1d1d1f]">20%</span>, you&apos;d quit{" "}
          <span className="font-medium text-[#1d1d1f]">
            {scenario3MonthsSaved} months earlier
          </span>
        </span>
        <ArrowRight
          size={16}
          strokeWidth={1.75}
          className="shrink-0 ml-2 text-[var(--accent-color)] group-hover:translate-x-1 transition-transform"
        />
      </button>
    </div>
  )
}

export function FreedomCalculator({ initialGoal, riskTolerance }: FreedomCalculatorProps) {
  const currency = useCurrency()

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

  // Baseline to detect unsaved changes against
  const [savedSnapshot, setSavedSnapshot] = useState({
    monthlySalary: Number(initialGoal?.monthly_income) || 0,
    monthlyExpenses: Number(initialGoal?.monthly_expenses) || 0,
    currentSavings: Number(initialGoal?.current_savings) || 0,
    postQuitIncome: Number(initialGoal?.desired_post_quit_income) || 0,
    postQuitExpenses:
      Number(initialGoal?.monthly_expenses_after_quit) || Number(initialGoal?.monthly_expenses) || 0,
    monthsOfSafety: initialGoal?.target_runway_months || 6,
  })

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

  function applyScenario(changes: {
    monthlySalary?: number
    monthlyExpenses?: number
    postQuitIncome?: number
  }) {
    const previous = { monthlySalary, monthlyExpenses, postQuitIncome }

    if (changes.monthlySalary !== undefined) setMonthlySalary(changes.monthlySalary)
    if (changes.monthlyExpenses !== undefined) handleMonthlyExpensesChange(changes.monthlyExpenses)
    if (changes.postQuitIncome !== undefined) setPostQuitIncome(changes.postQuitIncome)

    toast.success("Scenario applied", {
      action: {
        label: "Undo",
        onClick: () => {
          setMonthlySalary(previous.monthlySalary)
          handleMonthlyExpensesChange(previous.monthlyExpenses)
          setPostQuitIncome(previous.postQuitIncome)
        },
      },
    })
  }

  const monthlySavings = monthlySalary - monthlyExpenses
  const isOverspending = monthlySavings < 0

  const isDirty =
    monthlySalary !== savedSnapshot.monthlySalary ||
    monthlyExpenses !== savedSnapshot.monthlyExpenses ||
    currentSavings !== savedSnapshot.currentSavings ||
    postQuitIncome !== savedSnapshot.postQuitIncome ||
    postQuitExpenses !== savedSnapshot.postQuitExpenses ||
    monthsOfSafety !== savedSnapshot.monthsOfSafety

  const runway = calculateRunway({
    monthlySalary,
    monthlyExpenses,
    currentSavings,
    postQuitIncome,
    monthlyExpensesAfterQuit: postQuitExpenses,
    monthsOfSafety,
  })

  const riskConfig = {
    conservative: { label: "Play it safe", className: "bg-[#e8e0cc] text-[#1d1d1f] hover:bg-[#e8e0cc]/80" },
    moderate: { label: "Balanced", className: "bg-[var(--accent-color)] text-accent-foreground hover:bg-[var(--accent-color)]/80" },
    aggressive: { label: "Go for it", className: "bg-[#ff9500] text-white hover:bg-[#ff9500]/80" },
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
      setSavedSnapshot({
        monthlySalary,
        monthlyExpenses,
        currentSavings,
        postQuitIncome,
        postQuitExpenses,
        monthsOfSafety,
      })
      toast.success("Quit plan saved")
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

      {/* Hero: the answer, front and center */}
      <Card className="glass-card rounded-3xl border-l-4 border-l-[var(--accent-color)]">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-sm font-medium text-[#8a8a8a] flex items-center gap-2">
              <Target size={16} strokeWidth={1.75} />
              Projected quit date
            </p>
            {riskBadge && (
              <Badge className={`rounded-full text-xs font-medium ${riskBadge.className}`}>
                {riskBadge.label}
              </Badge>
            )}
          </div>
          {monthlySalary <= 0 ? (
            <>
              <p className="text-3xl md:text-4xl font-semibold text-[#1d1d1f]">
                Enter your salary
              </p>
              <p className="text-sm text-[#8a8a8a] mt-2">
                Enter your monthly salary below to see your quit date.
              </p>
            </>
          ) : runway.monthlySurplus <= 0 ? (
            <>
              <p className="text-3xl md:text-4xl font-semibold text-[#ff3b30]">
                You&apos;re spending more than you earn
              </p>
              <p className="text-sm text-[#8a8a8a] mt-2">
                You&apos;re spending{" "}
                {formatCurrency(Math.abs(runway.monthlySurplus), currency)} more than you
                earn. Reduce expenses or increase income to start saving for your
                escape.
              </p>
            </>
          ) : runway.savingsGap <= 0 ? (
            <>
              <p className="text-4xl md:text-5xl font-semibold text-[#34c759]">
                You&apos;ve saved enough!
              </p>
              <p className="text-sm text-[#8a8a8a] mt-2">
                You&apos;re ready to plan your exit.
              </p>
            </>
          ) : runway.projectedMonthsToGoal && runway.projectedMonthsToGoal > 120 ? (
            <>
              <p className="text-4xl md:text-5xl font-semibold text-[#1d1d1f]">
                {formatDate(runway.projectedQuitDate)}
              </p>
              <p className="text-sm text-[#ff9500] mt-2">
                At this rate, you&apos;ll be ready in about{" "}
                {Math.ceil(runway.projectedMonthsToGoal / 12)} years. See tips
                below to speed things up.
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl md:text-5xl font-semibold text-[#1d1d1f]">
                {formatDate(runway.projectedQuitDate)}
              </p>
              {runway.projectedMonthsToGoal && (
                <p className="text-sm text-[#8a8a8a] mt-2">
                  About {runway.projectedMonthsToGoal} months away
                </p>
              )}
            </>
          )}

          <div className="mt-6">
            <ProjectionBars
              currentSavings={currentSavings}
              requiredSavings={runway.requiredSavings}
              currency={currency}
            />
            <div className="flex items-center gap-4 mt-3 text-xs text-[#8a8a8a]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4d0c5]" />
                Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)]" />
                Projected
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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

          <Card className="glass-card rounded-3xl border-l-[3px] border-l-[var(--accent-color)]">
            <CardContent className="p-6 space-y-8">
              <MoneyField
                label="Monthly salary"
                icon={Briefcase}
                value={monthlySalary}
                onChange={setMonthlySalary}
                min={0}
                max={50000}
                step={500}
                tooltip="Your total take-home pay from your current job after taxes"
              />

              <MoneyField
                label="Monthly expenses"
                icon={Wallet}
                value={monthlyExpenses}
                onChange={handleMonthlyExpensesChange}
                min={0}
                max={20000}
                step={100}
                tooltip="Everything you spend to live: rent, food, bills, subscriptions, fun"
              />

              <MoneyField
                label="Current savings"
                icon={PiggyBank}
                value={currentSavings}
                onChange={setCurrentSavings}
                min={0}
                max={500000}
                step={1000}
                tooltip="Cash you have right now in savings accounts — don't count investments"
              />

              <TooltipProvider>
                <div className="space-y-2 rounded-2xl bg-[#f8f1de] p-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-[#1d1d1f]">
                      <TrendingUp size={16} strokeWidth={1.75} />
                      Monthly savings
                      <FieldTooltip>
                        Automatically calculated: salary minus expenses
                      </FieldTooltip>
                    </Label>
                  <span
                    className={`text-sm font-semibold ${
                      isOverspending ? "text-[#ff3b30]" : "text-[#34c759]"
                    }`}
                  >
                    {formatCurrency(monthlySavings, currency)}
                  </span>
                </div>
                  <p className="text-xs text-[#8a8a8a]">
                    {isOverspending
                      ? "You're spending more than you earn"
                      : "Auto-calculated: salary minus expenses"}
                  </p>
                </div>
              </TooltipProvider>
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

          <Card className="glass-card rounded-3xl border-l-[3px] border-l-[var(--accent-color)]">
            <CardContent className="p-6 space-y-8">
              <MoneyField
                label="Expected monthly income after quitting"
                icon={Briefcase}
                value={postQuitIncome}
                onChange={setPostQuitIncome}
                min={0}
                max={50000}
                step={500}
                tooltip="Money from freelancing, side work, or part-time gigs after you quit"
                note={
                  <>
                    Also set in{" "}
                    <Link
                      href="/settings"
                      className="text-[var(--accent-color)] hover:underline"
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
                tooltip="Your costs might change: no commute, different city, cheaper lifestyle?"
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
                tooltip="How many months you want savings to last if post-quit income drops to zero"
              />

              {isDirty && (
                <p className="text-xs text-[#ff9500] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500]" />
                  Unsaved changes — your dashboard won&apos;t reflect these until you save
                </p>
              )}

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

          <Card className="glass-card rounded-3xl border-l-4 border-l-[var(--accent-color)]">
            <CardContent className="p-6">
              <p className="text-sm text-[#8a8a8a] mb-1">Required savings</p>
              <p className="text-4xl font-semibold text-[#1d1d1f]">
                {formatCurrency(runway.requiredSavings, currency)}
              </p>
              <p className="text-xs text-[#8a8a8a] mt-2">
                Monthly shortfall × months of safety
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-5">
            <Card className="glass-card rounded-3xl">
              <CardContent className="p-6">
                <p className="text-sm text-[#8a8a8a] mb-1">Monthly savings</p>
                <p
                  className={`text-2xl font-semibold ${
                    runway.monthlySurplus < 0 ? "text-[#ff3b30]" : "text-[#34c759]"
                  }`}
                >
                  {formatCurrency(runway.monthlySurplus, currency)}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card rounded-3xl">
              <CardContent className="p-6">
                <p className="text-sm text-[#8a8a8a] mb-1">
                  Monthly shortfall after quitting
                </p>
                {runway.monthlyShortfallAfterQuit > 0 ? (
                  <>
                    <p className="text-2xl font-semibold text-[#ff9500]">
                      {formatCurrency(runway.monthlyShortfallAfterQuit, currency)}
                    </p>
                    <p className="text-xs text-[#8a8a8a] mt-1">
                      Your savings must cover this each month
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-[#34c759]">
                      Your post-quit income covers expenses!
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card rounded-3xl">
            <CardContent className="p-6">
              <p className="text-sm text-[#8a8a8a] mb-1">Savings gap</p>
              <p className="text-3xl font-semibold text-[#1d1d1f]">
                {formatCurrency(runway.savingsGap, currency)}
              </p>
            </CardContent>
          </Card>

          {runway.monthlySurplus > 0 && runway.savingsGap > 0 && (
            <QuitFasterTips
              monthlySalary={monthlySalary}
              monthlyExpenses={monthlyExpenses}
              monthlySavings={runway.monthlySurplus}
              postQuitIncome={postQuitIncome}
              postQuitExpenses={postQuitExpenses}
              currentSavings={currentSavings}
              monthsOfSafety={monthsOfSafety}
              currentProjectedMonths={runway.projectedMonthsToGoal ?? 0}
              currency={currency}
              onScenario={applyScenario}
            />
          )}

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
