import { FreedomCalculator } from "@/components/calculator/freedom-calculator"
import { getFinancialGoal } from "@/lib/financial/actions"

export default async function CalculatorPage() {
  const goal = await getFinancialGoal()
  return <FreedomCalculator initialGoal={goal} />
}
