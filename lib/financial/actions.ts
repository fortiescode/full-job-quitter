"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type FinancialGoal = Tables<"financial_goals">

export async function getFinancialGoal(): Promise<FinancialGoal | null> {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return null
  }

  const { data, error } = await supabase
    .from("financial_goals")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function upsertFinancialGoal(
  goal: Partial<Omit<FinancialGoal, "id" | "user_id" | "created_at" | "updated_at">>
) {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: "Not authenticated" }
  }

  const existing = await supabase
    .from("financial_goals")
    .select("id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .single()

  let result
  if (existing.data) {
    result = await supabase
      .from("financial_goals")
      .update({
        ...goal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.data.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from("financial_goals")
      .insert({
        user_id: userData.user.id,
        ...goal,
      })
      .select()
      .single()
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath("/(app)", "layout")
  return { data: result.data as FinancialGoal }
}
