export interface RunwayInputs {
  monthlySalary: number
  monthlyExpenses: number
  currentSavings: number
  postQuitIncome: number
  monthlyExpensesAfterQuit: number
  monthsOfSafety: number
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
    monthlySalary,
    monthlyExpenses,
    currentSavings,
    postQuitIncome,
    monthlyExpensesAfterQuit,
    monthsOfSafety,
  } = inputs

  // Money left over each month while still working
  const monthlySurplus = monthlySalary - monthlyExpenses

  // Shortfall each month after quitting (only cover what income doesn't)
  const postQuitMonthlyGap = Math.max(0, monthlyExpensesAfterQuit - postQuitIncome)

  // Total safety net needed after quitting
  const requiredSavings = postQuitMonthlyGap * monthsOfSafety
  const savingsGap = Math.max(0, requiredSavings - currentSavings)

  // How long current savings would last after quitting with no income
  const currentRunwayMonths =
    monthlyExpensesAfterQuit > 0 ? currentSavings / monthlyExpensesAfterQuit : 0

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
