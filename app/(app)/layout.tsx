import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/app/dashboard-shell"
import { CurrencyProvider } from "@/components/providers/currency-provider"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    redirect("/auth/sign-in")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", data.user.id)
    .single()

  return (
    <CurrencyProvider currency={profile?.currency ?? "USD"}>
      <DashboardShell>{children}</DashboardShell>
    </CurrencyProvider>
  )
}
