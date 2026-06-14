import { FreedomCalculator } from "@/components/calculator/freedom-calculator"
import { getFinancialGoal } from "@/lib/financial/actions"
import { getProfile } from "@/lib/profile/actions"

export default async function CalculatorPage() {
  const [goal, profile] = await Promise.all([getFinancialGoal(), getProfile()])
  return <FreedomCalculator initialGoal={goal} riskTolerance={profile?.risk_tolerance ?? null} />
}
