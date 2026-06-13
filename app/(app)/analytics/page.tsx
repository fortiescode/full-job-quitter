import Link from "next/link"
import { BarChart3, TrendingUp, Wallet, Route, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getFinancialGoal } from "@/lib/financial/actions"
import { getMilestones } from "@/lib/milestones/actions"
import { calculateRunway, formatCurrency, formatNumber } from "@/lib/calculator/utils"

export default async function AnalyticsPage() {
  const [goal, milestones] = await Promise.all([
    getFinancialGoal(),
    getMilestones(),
  ])

  const completedMilestones = milestones.filter((m) => m.status === "completed").length
  const milestoneProgress = milestones.length > 0
    ? Math.round((completedMilestones / milestones.length) * 100)
    : 0

  const runway = goal
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
          Analytics
        </h1>
        <p className="text-[#6e6e73] mt-1">
          Track your progress toward freedom.
        </p>
      </div>

      {!goal && (
        <Card className="glass-panel rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0066cc]/10 flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={28} strokeWidth={1.75} className="text-[#0066cc]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">
            No data yet
          </h2>
          <p className="text-[#6e6e73] mb-6 max-w-md mx-auto">
            Set up your Freedom Calculator first to unlock analytics.
          </p>
          <Link href="/calculator">
            <Button className="rounded-xl bg-[#0066cc] hover:bg-[#0066cc]/90 text-white px-6 h-12">
              Open calculator
            </Button>
          </Link>
        </Card>
      )}

      {goal && runway && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="glass-panel rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#6e6e73] flex items-center gap-2">
                  <Wallet size={16} strokeWidth={1.75} />
                  Current savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {formatCurrency(Number(goal.current_savings))}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#6e6e73] flex items-center gap-2">
                  <TrendingUp size={16} strokeWidth={1.75} />
                  Monthly surplus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {formatCurrency(runway.monthlySurplus)}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#6e6e73] flex items-center gap-2">
                  <Calendar size={16} strokeWidth={1.75} />
                  Target runway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {goal.target_runway_months} months
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#6e6e73] flex items-center gap-2">
                  <Route size={16} strokeWidth={1.75} />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {completedMilestones}/{milestones.length}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="glass-panel rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Funding progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6e6e73]">Saved</span>
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
                <p className="text-3xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {formatNumber(
                    Math.min(
                      (Number(goal.current_savings) / runway.requiredSavings) * 100,
                      100
                    ),
                    1
                  )}
                  %
                </p>
                {runway.isFunded && (
                  <Badge className="rounded-xl bg-[#34c759]/10 text-[#34c759] hover:bg-[#34c759]/15 px-3 py-1">
                    Fully funded
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Milestone completion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6e6e73]">Completed</span>
                  <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
                    {milestoneProgress}%
                  </span>
                </div>
                <Progress
                  value={milestoneProgress}
                  className="h-3 rounded-full bg-black/5 dark:bg-white/10"
                />
                <p className="text-3xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {completedMilestones}{" "}
                  <span className="text-[#6e6e73] text-lg font-normal">
                    of {milestones.length} milestones
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
