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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        .select("full_name, avatar_url, compact_mode")
        .eq("id", userData.user.id)
        .single()
    : null

  const fullName = profile?.data?.full_name ?? userData.user?.email?.split("@")[0] ?? ""
  const avatarUrl = profile?.data?.avatar_url ?? ""
  const compact = profile?.data?.compact_mode ?? false

  const completedMilestones = milestones.filter((m) => m.status === "completed").length
  const milestoneProgress = milestones.length > 0
    ? (completedMilestones / milestones.length) * 100
    : 0

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalSubscriptions = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0)
  const totalLoanPayments = loans.reduce((sum, l) => sum + Number(l.monthly_payment), 0)
  const totalOutflows = totalExpenses + totalSubscriptions + totalLoanPayments

  const goalUpdatedAt = goal?.updated_at
  const subscriptionUpdatedAt = latestTimestamp([...subscriptions, ...loans])
  const expenseUpdatedAt = latestTimestamp([...expenses, ...categories])
  const milestoneUpdatedAt = latestTimestamp(milestones)

  const monthlyIncome = Number(goal?.monthly_income) || 0
  const netSavings = monthlyIncome - totalOutflows

  const expensesByCategory: Record<string, number> = {}
  expenses.forEach((expense) => {
    const categoryId = expense.category_id ?? "uncategorized"
    expensesByCategory[categoryId] = (expensesByCategory[categoryId] || 0) + Number(expense.amount)
  })

  const runway = goal
    ? calculateRunway({
        monthlyExpenses: totalOutflows || Number(goal.monthly_expenses),
        currentSavings: Number(goal.current_savings),
        monthlySavingsRate: netSavings > 0 ? netSavings : Number(goal.monthly_savings_rate),
        targetRunwayMonths: goal.target_runway_months,
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

  return (
    <div className={compact ? "space-y-5" : "space-y-8"}>
      {/* Header + status pills + live financial summary */}
      <div className={compact ? "space-y-3" : "space-y-4"}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <WelcomeHeader name={fullName} avatarUrl={avatarUrl} compact={compact} />
          <div className={`flex flex-wrap ${compact ? "gap-2" : "gap-3"}`}>
            <StatPill label="Income" value={formatCurrency(monthlyIncome)} variant="default" compact={compact} />
            <StatPill label="Expenses" value={formatCurrency(totalOutflows)} variant="dark" compact={compact} />
            <StatPill label="Net savings" value={formatCurrency(netSavings)} variant="accent" compact={compact} />
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
        <Card size={compact ? "compact" : "default"} className={`bg-white rounded-3xl border-none shadow-sm ${compact ? "p-3" : "p-6"}`}>
          <div className="flex items-start justify-between mb-1">
            <p className={`text-[#8a8a8a] ${compact ? "text-xs" : "text-sm"}`}>Total savings</p>
            <LastUpdated date={goalUpdatedAt} />
          </div>
          <p className={`font-semibold text-[#1d1d1f] ${compact ? "text-2xl" : "text-4xl"}`}>
            {formatCurrency(Number(goal?.current_savings) || 0)}
          </p>
          <div className={`h-1.5 bg-[#f8f1de] rounded-full overflow-hidden ${compact ? "mt-3" : "mt-4"}`}>
            <div
              className="h-full bg-[#f5c542] rounded-full"
              style={{ width: `${fundingProgress}%` }}
            />
          </div>
        </Card>

        <Card size={compact ? "compact" : "default"} className={`bg-white rounded-3xl border-none shadow-sm ${compact ? "p-3" : "p-6"}`}>
          <div className="flex items-start justify-between mb-1">
            <p className={`text-[#8a8a8a] ${compact ? "text-xs" : "text-sm"}`}>Freedom funded</p>
            <LastUpdated date={goalUpdatedAt} />
          </div>
          <p className={`font-semibold text-[#1d1d1f] ${compact ? "text-2xl" : "text-4xl"}`}>
            {formatNumber(fundingProgress, 1)}%
          </p>
          <p className={`text-[#8a8a8a] ${compact ? "text-xs mt-1.5" : "text-sm mt-2"}`}>
            Goal: {formatCurrency(runway?.requiredSavings ?? 0)}
          </p>
        </Card>

        <Card size={compact ? "compact" : "default"} className={`bg-white rounded-3xl border-none shadow-sm ${compact ? "p-3" : "p-6"}`}>
          <div className="flex items-start justify-between mb-1">
            <p className={`text-[#8a8a8a] ${compact ? "text-xs" : "text-sm"}`}>Months to freedom</p>
            <LastUpdated date={goalUpdatedAt} />
          </div>
          <p className={`font-semibold text-[#1d1d1f] ${compact ? "text-2xl" : "text-4xl"}`}>
            {runway?.projectedMonthsToGoal ?? "—"}
          </p>
          <p className={`text-[#8a8a8a] ${compact ? "text-xs mt-1.5" : "text-sm mt-2"}`}>
            {runway?.projectedQuitDate
              ? runway.projectedQuitDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "Add your finances"}
          </p>
        </Card>

        <Card size={compact ? "compact" : "default"} className={`bg-white rounded-3xl border-none shadow-sm ${compact ? "p-3" : "p-6"}`}>
          <div className="flex items-start justify-between mb-1">
            <p className={`text-[#8a8a8a] ${compact ? "text-xs" : "text-sm"}`}>Active subscriptions</p>
            <LastUpdated date={subscriptionUpdatedAt} />
          </div>
          <p className={`font-semibold text-[#1d1d1f] ${compact ? "text-2xl" : "text-4xl"}`}>
            {subscriptions.length}
          </p>
          <p className={`text-[#8a8a8a] ${compact ? "text-xs mt-1.5" : "text-sm mt-2"}`}>
            {formatCurrency(totalSubscriptions)}/mo
          </p>
        </Card>
      </div>

      {/* Escape fund + projection + quit date */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 ${compact ? "gap-3" : "gap-5"}`}>
        {/* Escape fund CTA */}
        <Card size={compact ? "compact" : "default"} className="lg:col-span-4 bg-[#f5c542] rounded-3xl border-none shadow-sm overflow-hidden">
          <CardContent className={`h-full flex flex-col justify-between ${compact ? "p-5" : "p-8"}`}>
            <div>
              <div className={`rounded-2xl bg-white/30 flex items-center justify-center ${compact ? "w-14 h-14 mb-4" : "w-16 h-16 mb-6"}`}>
                <Wallet size={compact ? 28 : 32} strokeWidth={1.75} className="text-[#1d1d1f]" />
              </div>
              <h3 className={`font-semibold text-[#1d1d1f] mb-2 ${compact ? "text-xl" : "text-2xl"}`}>
                Your escape fund
              </h3>
              <p className={`text-[#1d1d1f]/70 ${compact ? "text-sm" : ""}`}>
                Track every dollar that brings you closer to quitting.
              </p>
            </div>
            <Link href="/finances">
              <Button className={`rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white ${compact ? "mt-4 h-10" : "mt-6"}`}>
                Manage finances
                <ArrowUpRight size={16} strokeWidth={1.75} className="ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Savings projection chart */}
        <Card size={compact ? "compact" : "default"} className="lg:col-span-5 bg-white rounded-3xl border-none shadow-sm">
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
        <Card size={compact ? "compact" : "default"} className="lg:col-span-3 bg-white rounded-3xl border-none shadow-sm">
          <CardContent className={`h-full flex flex-col justify-center ${compact ? "p-5" : "p-8"}`}>
            <div className="flex items-start justify-between mb-2">
              <p className={`text-[#8a8a8a] ${compact ? "text-xs" : "text-sm"}`}>Projected quit date</p>
              <LastUpdated date={goalUpdatedAt} />
            </div>
            <p className={`font-semibold text-[#1d1d1f] leading-tight ${compact ? "text-2xl" : "text-4xl"}`}>
              {projectedQuitDateLabel ?? "—"}
            </p>
            <p className={`text-[#8a8a8a] mt-2 ${compact ? "text-xs" : "text-sm"}`}>{monthsAway}</p>

            <div className={`h-1.5 bg-[#f8f1de] rounded-full overflow-hidden ${compact ? "mt-4" : "mt-6"}`}>
              <div
                className="h-full bg-[#f5c542] rounded-full"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
            <p className={`text-[#8a8a8a] mt-2 ${compact ? "text-[10px]" : "text-xs"}`}>
              {formatNumber(milestoneProgress, 0)}% milestones complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expense breakdown + milestone timeline + upcoming milestones */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 ${compact ? "gap-3" : "gap-5"}`}>
        <Card size={compact ? "compact" : "default"} className="lg:col-span-4 bg-white rounded-3xl border-none shadow-sm">
          <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
            <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <Receipt size={compact ? 16 : 18} strokeWidth={1.75} />
              Expense breakdown
            </CardTitle>
            <div className="flex items-center gap-2">
              <LastUpdated date={expenseUpdatedAt} />
              <Link href="/finances">
                <Button variant="ghost" className={`rounded-xl text-[#8a8a8a] ${compact ? "h-8 text-sm" : ""}`}>
                  Manage
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className={compact ? "pt-2" : ""}>
            <ExpenseBarChart categories={categories} expensesByCategory={expensesByCategory} compact={compact} />
          </CardContent>
        </Card>

        <Card size={compact ? "compact" : "default"} className="lg:col-span-4 bg-white rounded-3xl border-none shadow-sm">
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

        <Card size={compact ? "compact" : "default"} className="lg:col-span-4 bg-white rounded-3xl border-none shadow-sm">
          <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
            <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <Route size={compact ? 16 : 18} strokeWidth={1.75} />
              Next milestones
            </CardTitle>
            <LastUpdated date={milestoneUpdatedAt} />
          </CardHeader>
          <CardContent className={compact ? "pt-2" : ""}>
            <UpcomingMilestones milestones={milestones} compact={compact} />
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions/loans + recent expenses + target details */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 ${compact ? "gap-3" : "gap-5"}`}>
        <Card size={compact ? "compact" : "default"} className="lg:col-span-4 bg-[#1d1d1f] rounded-3xl border-none shadow-sm">
          <CardContent className="h-full">
            <SubscriptionLoanCard subscriptions={subscriptions} loans={loans} compact={compact} />
          </CardContent>
        </Card>

        <Card size={compact ? "compact" : "default"} className="lg:col-span-4 bg-white rounded-3xl border-none shadow-sm">
          <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
            <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <TrendingDown size={compact ? 16 : 18} strokeWidth={1.75} />
              Recent expenses
            </CardTitle>
            <LastUpdated date={expenseUpdatedAt} />
          </CardHeader>
          <CardContent className={compact ? "pt-2" : ""}>
            <RecentExpenses expenses={expenses} categories={categories} compact={compact} />
          </CardContent>
        </Card>

        <Card size={compact ? "compact" : "default"} className="lg:col-span-4 bg-white rounded-3xl border-none shadow-sm">
          <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
            <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
              <Calendar size={compact ? 16 : 18} strokeWidth={1.75} />
              Target timeline
            </CardTitle>
            <LastUpdated date={goalUpdatedAt} />
          </CardHeader>
          <CardContent className={compact ? "space-y-4 pt-2" : "space-y-6"}>
            <div className="flex items-center justify-between">
              <span className={`text-[#8a8a8a] ${compact ? "text-sm" : ""}`}>Monthly runway target</span>
              <span className={`font-semibold text-[#1d1d1f] ${compact ? "text-sm" : ""}`}>
                {goal?.target_runway_months ?? 0} months
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[#8a8a8a] ${compact ? "text-sm" : ""}`}>Required savings</span>
              <span className={`font-semibold text-[#1d1d1f] ${compact ? "text-sm" : ""}`}>
                {formatCurrency(runway?.requiredSavings ?? 0)}
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
                {formatCurrency(runway?.monthlySurplus ?? 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roadmap */}
      <Card size={compact ? "compact" : "default"} className="bg-white rounded-3xl border-none shadow-sm">
        <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2" : ""}`}>
          <CardTitle className={`font-semibold text-[#1d1d1f] flex items-center gap-2 ${compact ? "text-base" : "text-lg"}`}>
            <Route size={compact ? 16 : 18} strokeWidth={1.75} />
            Your roadmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <LastUpdated date={milestoneUpdatedAt} />
            <Link href="/milestones">
              <Button variant="ghost" className={`rounded-xl text-[#8a8a8a] ${compact ? "h-8 text-sm" : ""}`}>
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
                <Button className="rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white">
                  Add milestones
                </Button>
              </Link>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compact ? "gap-3" : "gap-4"}`}>
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`rounded-2xl border-l-4 ${
                    milestone.status === "completed"
                      ? "bg-[#34c759]/5 border-[#34c759]"
                      : "bg-[#f8f1de] border-[#f5c542]"
                  } ${compact ? "p-3" : "p-4"}`}
                >
                  <p
                    className={`font-medium ${
                      milestone.status === "completed"
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
