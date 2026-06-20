"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type Milestone = Tables<"milestones">

const DEFAULT_MILESTONES: {
  title: string
  description: string | null
  category: "financial" | "career" | "personal"
  order_index: number
}[] = [
  {
    title: "Build a financial cushion",
    description: "Save your first 3 months of expenses.",
    category: "financial",
    order_index: 0,
  },
  {
    title: "Eliminate high-interest debt",
    description: "Pay off credit cards and personal loans.",
    category: "financial",
    order_index: 1,
  },
  {
    title: "Establish side income",
    description: "Earn your first $1,000 outside your day job.",
    category: "financial",
    order_index: 2,
  },
  {
    title: "Reach full runway target",
    description: "Save enough to cover your target Months of safety.",
    category: "financial",
    order_index: 3,
  },
  {
    title: "Practice the conversation",
    description: "Plan and rehearse your resignation conversation.",
    category: "career",
    order_index: 4,
  },
  {
    title: "Set your exit date",
    description: "Choose the day you hand in your notice.",
    category: "career",
    order_index: 5,
  },
]

export async function getMilestones(): Promise<Milestone[]> {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return []
  }

  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("order_index", { ascending: true })

  if (error) {
    return []
  }

  return data ?? []
}

export async function seedDefaultMilestones() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: "Not authenticated" }
  }

  const milestones = DEFAULT_MILESTONES.map((m) => ({
    ...m,
    user_id: userData.user.id,
  }))

  const { error } = await supabase.from("milestones").insert(milestones)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/(app)", "layout")
  return { success: true }
}

export async function resetDefaultMilestones() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: "Not authenticated" }
  }

  await supabase.from("milestones").delete().eq("user_id", userData.user.id)

  const milestones = DEFAULT_MILESTONES.map((m) => ({
    ...m,
    user_id: userData.user.id,
  }))

  const { error } = await supabase.from("milestones").insert(milestones)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/(app)", "layout")
  return { success: true }
}

export async function toggleMilestone(
  id: string,
  currentStatus: Milestone["status"]
) {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: "Not authenticated" }
  }

  const nextStatus: Milestone["status"] =
    currentStatus === "completed" ? "pending" : "completed"
  const completedAt: string | null =
    nextStatus === "completed" ? new Date().toISOString() : null

  const { error } = await supabase
    .from("milestones")
    .update({
      status: nextStatus,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userData.user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/(app)", "layout")
  return { success: true }
}

export async function addMilestone(data: {
  title: string
  description?: string
  category?: Milestone["category"]
}) {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: "Not authenticated" }
  }

  const { data: existing } = await supabase
    .from("milestones")
    .select("order_index")
    .eq("user_id", userData.user.id)
    .order("order_index", { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase.from("milestones").insert({
    user_id: userData.user.id,
    title: data.title,
    description: data.description ?? null,
    category: data.category ?? "personal",
    order_index: (existing?.order_index ?? -1) + 1,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/(app)", "layout")
  return { success: true }
}

export async function deleteMilestone(id: string) {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/(app)", "layout")
  return { success: true }
}
