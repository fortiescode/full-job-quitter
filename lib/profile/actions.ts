"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfile(data: {
  full_name?: string
  avatar_url?: string
  current_job_title?: string
  why_quit?: string
  risk_tolerance?: "conservative" | "moderate" | "aggressive" | null
  compact_mode?: boolean
  email_reminders?: boolean
}) {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: "Not authenticated" }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (data.full_name !== undefined) updateData.full_name = data.full_name
  if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url
  if (data.current_job_title !== undefined) updateData.current_job_title = data.current_job_title
  if (data.why_quit !== undefined) updateData.why_quit = data.why_quit
  if (data.risk_tolerance !== undefined) updateData.risk_tolerance = data.risk_tolerance
  if (data.compact_mode !== undefined) updateData.compact_mode = data.compact_mode
  if (data.email_reminders !== undefined) updateData.email_reminders = data.email_reminders

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userData.user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/(app)", "layout")
  return { success: true }
}

export async function updateEscapePlan(data: {
  target_quit_date?: string | null
  target_runway_months?: number
  desired_post_quit_income?: number
  emergency_fund_months?: number
}) {
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
        ...data,
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
        ...data,
      })
      .select()
      .single()
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath("/(app)", "layout")
  return { success: true }
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return null
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single()

  return data
}
