export interface RunwayInputs {
  monthlyExpenses: number
  currentSavings: number
  monthlySavingsRate: number
  targetRunwayMonths: number
}

export interface RunwayResult {
  requiredSavings: number
  savingsGap: number
  monthlySurplus: number
  projectedMonthsToGoal: number | null
  projectedQuitDate: Date | null
  currentRunwayMonths: number
  isFunded: boolean
}

export function calculateRunway(inputs: RunwayInputs): RunwayResult {
  const {
    monthlyExpenses,
    currentSavings,
    monthlySavingsRate,
    targetRunwayMonths,
  } = inputs

  const requiredSavings = monthlyExpenses * targetRunwayMonths
  const savingsGap = requiredSavings - currentSavings
  const currentRunwayMonths =
    monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0

  const monthlySurplus = monthlySavingsRate - monthlyExpenses
  const isFunded = currentSavings >= requiredSavings

  let projectedMonthsToGoal: number | null = null
  let projectedQuitDate: Date | null = null

  if (!isFunded && monthlySurplus > 0) {
    projectedMonthsToGoal = Math.ceil(savingsGap / monthlySurplus)
    const date = new Date()
    date.setMonth(date.getMonth() + projectedMonthsToGoal)
    projectedQuitDate = date
  }

  return {
    requiredSavings,
    savingsGap,
    monthlySurplus,
    projectedMonthsToGoal,
    projectedQuitDate,
    currentRunwayMonths,
    isFunded,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}
