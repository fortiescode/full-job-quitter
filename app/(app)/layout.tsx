import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/app/sidebar"
import { MobileNav } from "@/components/app/mobile-nav"

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

  return (
    <div className="min-h-screen flex bg-[#f5f5f7] dark:bg-black">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 min-w-0 pt-24 lg:pt-0">
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
