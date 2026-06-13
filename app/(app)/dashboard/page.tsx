import Link from "next/link"
import {
  Calculator,
  Route,
  TrendingUp,
  Wallet,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getFinancialGoal } from "@/lib/financial/actions"
import { getMilestones } from "@/lib/milestones/actions"
import { calculateRunway, formatCurrency, formatNumber } from "@/lib/calculator/utils"

export default async function DashboardPage() {
  const [goal, milestones] = await Promise.all([
    getFinancialGoal(),
    getMilestones(),
  ])

  const hasGoal = !!goal
  const completedMilestones = milestones.filter((m) => m.status === "completed").length
  const milestoneProgress = milestones.length > 0
    ? Math.round((completedMilestones / milestones.length) * 100)
    : 0

  const runway = hasGoal
    ? calculateRunway({
        monthlyExpenses: Number(goal.monthly_expenses),
        currentSavings: Number(goal.current_savings),
        monthlySavingsRate: Number(goal.monthly_savings_rate),
        targetRunwayMonths: goal.target_runway_months,
      })
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Dashboard
        </h1>
        <p className="text-[#6e6e73] mt-1">
          Your exit strategy at a glance.
        </p>
      </div>

      {!hasGoal && (
        <Card className="glass-panel rounded-2xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#0066cc]/10 flex items-center justify-center mx-auto mb-6">
              <Calculator size={28} strokeWidth={1.75} className="text-[#0066cc]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
              Start with your Freedom Calculator
            </h2>
            <p className="text-[#6e6e73] mb-6">
              Tell us about your expenses and savings, and we&apos;ll calculate your runway to freedom.
            </p>
            <Link href="/calculator">
              <Button className="rounded-xl bg-[#0066cc] hover:bg-[#0066cc]/90 text-white px-6 h-12">
                Open calculator
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {hasGoal && runway && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="glass-panel rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#6e6e73] flex items-center gap-2">
                  <Wallet size={16} strokeWidth={1.75} />
                  Current runway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {formatNumber(runway.currentRunwayMonths, 1)} months
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#6e6e73] flex items-center gap-2">
                  <TrendingUp size={16} strokeWidth={1.75} />
                  Target runway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {goal.target_runway_months} months
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#6e6e73] flex items-center gap-2">
                  <Calendar size={16} strokeWidth={1.75} />
                  Projected quit date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {runway.projectedQuitDate
                    ? runway.projectedQuitDate.toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "Funded"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-panel rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Funding progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6e6e73]">
                  {formatCurrency(Number(goal.current_savings))} saved
                </span>
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
                  Goal: {formatCurrency(runway.requiredSavings)}
                </span>
              </div>
              <Progress
                value={Math.min(
                  (Number(goal.current_savings) / runway.requiredSavings) * 100,
                  100
                )}
                className="h-3 rounded-full bg-black/5 dark:bg-white/10"
              />
              {runway.isFunded && (
                <p className="text-sm text-[#34c759] font-medium">
                  You&apos;re fully funded for your target runway.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card className="glass-panel rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            <Route size={18} strokeWidth={1.75} />
            Milestones
          </CardTitle>
          <Link href="/milestones">
            <Button variant="ghost" className="rounded-xl text-[#0066cc]">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[#6e6e73] mb-4">
                No milestones yet. Create your roadmap to quitting.
              </p>
              <Link href="/milestones">
                <Button className="rounded-xl bg-[#0066cc] hover:bg-[#0066cc]/90 text-white">
                  Add milestones
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6e6e73]">
                  {completedMilestones} of {milestones.length} completed
                </span>
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
                  {milestoneProgress}%
                </span>
              </div>
              <Progress
                value={milestoneProgress}
                className="h-3 rounded-full bg-black/5 dark:bg-white/10"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
