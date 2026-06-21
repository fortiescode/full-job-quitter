import Link from "next/link"
import {
  Wallet,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  Target,
  Route,
  Receipt,
  TrendingUp,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { WelcomeHeader } from "@/components/dashboard/welcome-header"
import { StatPill } from "@/components/dashboard/stat-pill"
import { ExpenseBarChart } from "@/components/dashboard/expense-bar-chart"
import { SubscriptionLoanCard } from "@/components/dashboard/subscription-loan-card"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { SavingsProjectionChart } from "@/components/dashboard/savings-projection-chart"
import { MilestoneTimeline } from "@/components/dashboard/milestone-timeline"
import { UpcomingMilestones } from "@/components/dashboard/upcoming-milestones"
import { FinancialSummaryBar } from "@/components/dashboard/financial-summary-bar"
import { LastUpdated } from "@/components/dashboard/last-updated"
import { getFinancialGoal } from "@/lib/financial/actions"
import { latestTimestamp } from "@/lib/time"
import { getMilestones } from "@/lib/milestones/actions"
import {
  getCategories,
  getExpenses,
  getSubscriptions,
  getLoans,
} from "@/lib/finances/actions"
import { createClient } from "@/lib/supabase/server"
import { calculateRunway, formatCurrency, formatNumber } from "@/lib/calculator/utils"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  const [goal, milestones, categories, expenses, subscriptions, loans] = await Promise.all([
    getFinancialGoal(),
    getMilestones(),
    getCategories(),
    getExpenses(),
    getSubscriptions(),
    getLoans(),
  ])

  const profile = userData.user
    ? await supabase
        .from("profiles")
        .select("full_name, avatar_url, compact_mode, risk_tolerance, currency")
        .eq("id", userData.user.id)
        .single()
    : null

  const fullName = profile?.data?.full_name ?? userData.user?.email?.split("@")[0] ?? ""
  const avatarUrl = profile?.data?.avatar_url ?? ""
  const compact = profile?.data?.compact_mode ?? false
  const currency = profile?.data?.currency ?? "USD"

  const completedMilestones = milestones.filter((m) => m.status === "completed").length
  const milestoneProgress = milestones.length > 0
    ? (completedMilestones / milestones.length) * 100
    : 0

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalSubscriptions = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0)
  const totalLoanPayments = loans.reduce((sum, l) => sum + Number(l.monthly_payment), 0)

  const goalUpdatedAt = goal?.updated_at
  const subscriptionUpdatedAt = latestTimestamp([...subscriptions, ...loans])
  const expenseUpdatedAt = latestTimestamp([...expenses, ...categories])
  const milestoneUpdatedAt = latestTimestamp(milestones)

  const monthlyIncome = Number(goal?.monthly_income) || 0
  const netSavings = monthlyIncome - totalExpenses

  const expensesByCategory: Record<string, number> = {}
  expenses.forEach((expense) => {
    const categoryId = expense.category_id ?? "uncategorized"
    expensesByCategory[categoryId] = (expensesByCategory[categoryId] || 0) + Number(expense.amount)
  })

  const runway = goal
    ? calculateRunway({
        monthlySalary: monthlyIncome,
        monthlyExpenses: Number(goal.monthly_expenses),
        currentSavings: Number(goal.current_savings),
        postQuitIncome: Number(goal.desired_post_quit_income),
        monthlyExpensesAfterQuit:
          Number(goal.monthly_expenses_after_quit) || Number(goal.monthly_expenses),
        monthsOfSafety: goal.target_runway_months,
      })
    : null

  const fundingProgress = goal && runway
    ? Math.min((Number(goal.current_savings) / runway.requiredSavings) * 100, 100)
    : 0

  const projectedQuitDateLabel = runway?.projectedQuitDate
    ? runway.projectedQuitDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null

  const monthsAway = runway?.projectedMonthsToGoal
    ? `About ${runway.projectedMonthsToGoal} months away`
    : runway?.isFunded
      ? "You're fully funded"
      : "Add your finances to project a date"

  const riskTolerance = profile?.data?.risk_tolerance as
    | "conservative"
    | "moderate"
    | "aggressive"
    | null
    | undefined

  const riskConfig = {
    conservative: { label: "Play it safe", className: "bg-[#e8e0cc] text-[#1d1d1f]" },
    moderate: { label: "Balanced", className: "bg-[var(--accent-color)] text-accent-foreground" },
    aggressive: { label: "Go for it", className: "bg-[#ff9500] text-white" },
  }
  const riskBadge = riskTolerance ? riskConfig[riskTolerance] : null

  const glass = "glass-card"

  return (
    <div className={`relative ${compact ? "space-y-5" : "space-y-8"}`}>
      {/* Decorative color blobs — fixed so every glass card refracts them while scrolling */}
      <div className="pointer-events-none fixed -top-10 -left-10 h-72 w-72 rounded-full bg-[var(--accent-color)]/30 blur-3xl z-0" aria-hidden="true" />
      <div className="pointer-events-none fixed top-20 right-0 h-80 w-80 rounded-full bg-[#0066cc]/20 blur-3xl z-0" aria-hidden="true" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#ff9500]/15 blur-3xl z-0" aria-hidden="true" />

      <div className={`relative z-10 ${compact ? "space-y-5" : "space-y-8"}`}>
      {/* Header + status pills + live financial summary */}
      <div className={compact ? "space-y-3" : "space-y-4"}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <WelcomeHeader name={fullName} avatarUrl={avatarUrl} compact={compact} />
          <div className={`flex flex-wrap ${compact ? "gap-2" : "gap-3"}`}>
            <StatPill label="Income" value={formatCurrency(monthlyIncome, currency)} variant="default" compact={compact} />
            <StatPill label="Expenses" value={formatCurrency(totalExpenses, currency)} variant="dark" compact={compact} />
            <StatPill label="Net savings" value={formatCurrency(netSavings, currency)} variant="accent" compact={compact} />
            <StatPill
              label="Runway"
              value={`${formatNumber(runway?.currentRunwayMonths ?? 0, 1)} mo`}
              variant="default"
              compact={compact}
            />
          </div>
        </div>
        <FinancialSummaryBar
          income={monthlyIncome}
          expenses={totalExpenses}
          obligations={totalSubscriptions + totalLoanPayments}
          compact={compact}
        />
      </div>

      {/* Main metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${compact ? "gap-3" : "gap-5"}`}>
        <Card size={compact ? "compact" : "default"} className={`${glass} rounded-3xl ${compact ? "p-3" : "p-6"}`}>
          <div className="mb-1">
            <p className={`text-[#1d1d1f] font-semibold ${compact ? "text-base" : "text-lg"}`}>Total savings</p>
            <LastUpdated date={goalUpdatedAt} />
          </div>
          <p className={`font-semibold text-[#1d1d1f] ${compact ? "text-2xl" : "text-4xl"}`}>
            {formatCurrency(Number(goal?.current_savings) || 0, currency)}
          </p>
          <div className={`h-1.5 bg-white/50 rounded-full overflow-hidden ${compact ? "mt-3" : "mt-4"}`}>
            <div
              className="h-full bg-(--accent-color) rounded-full"
              style={{ width: `${fundingProgress}%` }}
            />
          </div>
        </Card>

        <Card size={compact ? "compact" : "default"} className={`${glass} rounded-3xl ${compact ? "p-3" : "p-6"}`}>
          <div className="mb-1">
            <p className={`text-[#1d1d1f] font-semibold ${compact ? "text-base" : "text-lg"}`}>Freedom funded</p>
            <LastUpdated date={goalUpdatedAt} />
          </div>
          <p className={`font-semibold text-[#1d1d1f] ${compact ? "text-2xl" : "text-4xl"}`}>
            {formatNumber(fundingProgress, 1)}%
          </p>
          <p className={`text-[#6e6e73] ${compact ? "text-xs mt-1.5" : "text-sm mt-2"}`}>
            Goal: {formatCurrency(runway?.requiredSavings ?? 0, currency)}
          </p>
        </Card>

        <Card size={compact ? "compact" : "default"} className={`${glass} rounded-3xl ${compact ? "p-3" : "p-6"}`}>
          <div className="mb-1">
            <p className={`text-[#1d1d1f] font-semibold ${compact ? "text-base" : "text-lg"}`}>Months to freedom</p>
            <LastUpdated date={goalUpdatedAt} />
          </div>
          <p className={`font-semibold text-[#1d1d1f] ${compact ? "text-2xl" : "text-4xl"}`}>
            {runway?.projectedMonthsToGoal ?? "—"}
          </p>
          <p className={`text-[#6e6e73] ${compact ? "text-xs mt-1.5" : "text-sm mt-2"}`}>
            {runway?.projectedQuitDate
              ? runway.projectedQuitDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "Add your finances"}
          </p>
        </Card>

        <Card size={compact ? "compact" : "default"} className={`${glass} rounded-3xl ${compact ? "p-3" : "p-6"}`}>
          <div className="mb-1">
            <p className={`text-[#1d1d1f] font-semibold ${compact ? "text-base" : "text-lg"}`}>Active subscriptions</p>
            <LastUpdated date={subscriptionUpdatedAt} />
          </div>
          <p className={`font-semibold text-[#1d1d1f] ${compact ? "text-2xl" : "text-4xl"}`}>
            {subscriptions.length}
          </p>
          <p className={`text-[#6e6e73] ${compact ? "text-xs mt-1.5" : "text-sm mt-2"}`}>
            {formatCurrency(totalSubscriptions, currency)}/mo
          </p>
        </Card>
      </div>

      {/* Escape fund + projection + quit date */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 ${compact ? "gap-3" : "gap-5"}`}>
        {/* Escape fund CTA */}
        <Card size={compact ? "compact" : "default"} className="lg:col-span-4 bg-[var(--accent-color)]/55 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden">
          <CardContent className={`h-full flex flex-col justify-between ${compact ? "p-5" : "p-8"}`}>
            <div>
              <div className={`rounded-2xl bg-white/30 flex items-center justify-center ${compact ? "w-14 h-14 mb-4" : "w-16 h-16 mb-6"}`}>
                <Wallet size={compact ? 28 : 32} strokeWidth={1.75} className="text-accent-foreground" />
              </div>
              <h3 className={`font-semibold text-accent-foreground mb-2 ${compact ? "text-xl" : "text-2xl"}`}>
                Your escape fund
              </h3>
              <p className={`text-accent-foreground/70 ${compact ? "text-sm" : ""}`}>
                Track every dollar that brings you closer to quitting.
              </p>
            </div>
            <Link href="/finances">
              <Button className={`rounded-xl bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-accent-foreground ${compact ? "mt-4 h-10" : "mt-6"}`}>
                Manage finances
                <ArrowUpRight size={16} strokeWidth={1.75} className="ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Savings projection chart */}
        <Card size={compact ? "compact" : "default"} className={`lg:col-span-5 ${glass} rounded-3xl`}>
          <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
            <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <TrendingUp size={compact ? 16 : 18} strokeWidth={1.75} />
              Savings projection
            </CardTitle>
            <LastUpdated date={goalUpdatedAt} />
          </CardHeader>
          <CardContent className={compact ? "pt-2" : ""}>
            <SavingsProjectionChart
              currentSavings={Number(goal?.current_savings) || 0}
              monthlySurplus={runway?.monthlySurplus ?? 0}
              requiredSavings={runway?.requiredSavings ?? 0}
              projectedMonthsToGoal={runway?.projectedMonthsToGoal ?? null}
              compact={compact}
            />
          </CardContent>
        </Card>

        {/* Projected quit date — hero card */}
        <Card size={compact ? "compact" : "default"} className={`lg:col-span-3 ${glass} rounded-3xl`}>
          <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
            <div>
              <CardTitle className={`${compact ? "text-base" : "text-lg"}`}>Projected quit date</CardTitle>
              <LastUpdated date={goalUpdatedAt} />
            </div>
            {riskBadge && (
              <Badge className={`rounded-full text-xs font-medium ${riskBadge.className}`}>
                {riskBadge.label}
              </Badge>
            )}
          </CardHeader>
          <CardContent className={`h-full flex flex-col ${compact ? "pt-2" : ""}`}>
            <p className={`font-semibold text-[#1d1d1f] leading-tight ${compact ? "text-2xl" : "text-4xl"}`}>
              {projectedQuitDateLabel ?? "—"}
            </p>
            <p className={`text-[#8a8a8a] mt-2 ${compact ? "text-xs" : "text-sm"}`}>{monthsAway}</p>

            <div className={`h-1.5 bg-[#f8f1de] rounded-full overflow-hidden ${compact ? "mt-4" : "mt-6"}`}>
              <div
                className="h-full bg-(--accent-color) rounded-full"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
            <p className={`text-[#8a8a8a] mt-2 ${compact ? "text-[10px]" : "text-xs"}`}>
              {formatNumber(milestoneProgress, 0)}% milestones complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Milestone timeline + checklist */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 ${compact ? "gap-3" : "gap-5"}`}>
        <Card size={compact ? "compact" : "default"} className={`lg:col-span-8 ${glass} rounded-3xl`}>
          <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
            <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <Target size={compact ? 16 : 18} strokeWidth={1.75} />
              Milestone timeline
            </CardTitle>
            <LastUpdated date={milestoneUpdatedAt} />
          </CardHeader>
          <CardContent className={compact ? "pt-2" : ""}>
            <MilestoneTimeline milestones={milestones} compact={compact} />
          </CardContent>
        </Card>

        <Card size={compact ? "compact" : "default"} className={`lg:col-span-4 ${glass} rounded-3xl`}>
          <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
            <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <Route size={compact ? 16 : 18} strokeWidth={1.75} />
              Up next
            </CardTitle>
            <LastUpdated date={milestoneUpdatedAt} />
          </CardHeader>
          <CardContent className={compact ? "pt-2" : ""}>
            <UpcomingMilestones milestones={milestones} compact={compact} />
          </CardContent>
        </Card>
      </div>

      {/* Expense breakdown */}
      <Card size={compact ? "compact" : "default"} className={`${glass} rounded-3xl`}>
        <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
          <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
            <Receipt size={compact ? 16 : 18} strokeWidth={1.75} />
            Expense breakdown
          </CardTitle>
          <div className="flex items-center gap-2">
            <LastUpdated date={expenseUpdatedAt} />
            <Link href="/finances">
              <Button className={`rounded-xl bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-accent-foreground ${compact ? "h-8 text-sm" : ""}`}>
                Manage
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className={compact ? "pt-2" : ""}>
          <ExpenseBarChart categories={categories} expensesByCategory={expensesByCategory} compact={compact} />
        </CardContent>
      </Card>

      {/* Subscriptions/loans + recent expenses + target details */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 ${compact ? "gap-3" : "gap-5"}`}>
        <Card size={compact ? "compact" : "default"} className="lg:col-span-4 glass-card-dark rounded-3xl">
          <CardContent className="h-full">
            <SubscriptionLoanCard subscriptions={subscriptions} loans={loans} compact={compact} />
          </CardContent>
        </Card>

        <Card size={compact ? "compact" : "default"} className={`lg:col-span-4 ${glass} rounded-3xl`}>
          <CardHeader className={`${compact ? "pb-2" : ""}`}>
            <CardTitle className={`flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <TrendingDown size={compact ? 16 : 18} strokeWidth={1.75} />
              Recent expenses
            </CardTitle>
            <LastUpdated date={expenseUpdatedAt} />
            {expenses.length > 0 && (
              <CardAction>
                <Link href="/finances?tab=expenses">
                  <Button
                    className={`rounded-xl bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-accent-foreground ${compact ? "h-8 text-xs" : "h-9"}`}
                  >
                    <Plus size={compact ? 14 : 16} strokeWidth={1.75} className="mr-1.5" />
                    Add expense
                  </Button>
                </Link>
              </CardAction>
            )}
          </CardHeader>
          <CardContent className={compact ? "pt-2" : ""}>
            <RecentExpenses expenses={expenses} categories={categories} compact={compact} />
          </CardContent>
        </Card>

        <Card size={compact ? "compact" : "default"} className={`lg:col-span-4 ${glass} rounded-3xl`}>
          <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
            <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <Calendar size={compact ? 16 : 18} strokeWidth={1.75} />
              Target timeline
            </CardTitle>
            <LastUpdated date={goalUpdatedAt} />
          </CardHeader>
          <CardContent className={compact ? "space-y-4 pt-2" : "space-y-6"}>
            <div className="flex items-center justify-between">
              <span className={`text-[#8a8a8a] ${compact ? "text-sm" : ""}`}>Months of safety</span>
              <span className={`font-semibold text-[#1d1d1f] ${compact ? "text-sm" : ""}`}>
                {goal?.target_runway_months ?? 0} months
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[#8a8a8a] ${compact ? "text-sm" : ""}`}>Required savings</span>
              <span className={`font-semibold text-[#1d1d1f] ${compact ? "text-sm" : ""}`}>
                {formatCurrency(runway?.requiredSavings ?? 0, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[#8a8a8a] ${compact ? "text-sm" : ""}`}>Current runway</span>
              <span className={`font-semibold text-[#1d1d1f] ${compact ? "text-sm" : ""}`}>
                {formatNumber(runway?.currentRunwayMonths ?? 0, 1)} months
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[#8a8a8a] ${compact ? "text-sm" : ""}`}>Monthly surplus</span>
              <span className={`font-semibold ${(runway?.monthlySurplus ?? 0) >= 0 ? "text-[#34c759]" : "text-[#ff3b30]"} ${compact ? "text-sm" : ""}`}>
                {formatCurrency(runway?.monthlySurplus ?? 0, currency)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roadmap */}
      <Card size={compact ? "compact" : "default"} className={`${glass} rounded-3xl`}>
        <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
          <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
            <Route size={compact ? 16 : 18} strokeWidth={1.75} />
            Your roadmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <LastUpdated date={milestoneUpdatedAt} />
            <Link href="/milestones">
              <Button className={`rounded-xl bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-accent-foreground ${compact ? "h-8 text-sm" : ""}`}>
                View all
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className={compact ? "pt-2" : ""}>
          {milestones.length === 0 ? (
            <div className={`text-center ${compact ? "py-4" : "py-6"}`}>
              <p className={`text-[#8a8a8a] mb-4 ${compact ? "text-sm" : ""}`}>
                No milestones yet. Create your roadmap to quitting.
              </p>
              <Link href="/milestones">
                <Button className="rounded-xl bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-accent-foreground">
                  Add milestones
                </Button>
              </Link>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compact ? "gap-3" : "gap-4"}`}>
              {(() => {
                const sorted = [...milestones].sort(
                  (a, b) => a.order_index - b.order_index
                )
                const currentId = sorted.find((m) => m.status !== "completed")?.id
                return sorted.map((milestone) => {
                  const isCompleted = milestone.status === "completed"
                  const isCurrent = milestone.id === currentId
                  return (
                    <div
                      key={milestone.id}
                      className={`rounded-2xl ${
                        isCompleted
                          ? "bg-[#34c759]/5 border-l-[3px] border-[#34c759]"
                          : isCurrent
                            ? "bg-[#f8f1de] border-l-[3px] border-[#f5c542]"
                            : "bg-[#f8f1de]/40"
                      } ${compact ? "p-3" : "p-4"}`}
                    >
                      <p
                        className={`font-medium ${
                          isCompleted
                            ? "text-[#8a8a8a] line-through"
                            : "text-[#1d1d1f]"
                        } ${compact ? "text-sm" : ""}`}
                      >
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className={`text-[#8a8a8a] mt-1 ${compact ? "text-[10px]" : "text-xs"}`}>
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
