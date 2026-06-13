"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Calculator,
  Route,
  BarChart3,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { signOut } from "@/lib/auth/actions"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/milestones", label: "Milestones", icon: Route },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hidden lg:flex flex-col w-64 h-screen sticky top-0 glass-panel border-r border-white/20"
    >
      <div className="p-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]"
        >
          full-job-quitter
        </Link>
      </div>

      <Separator className="bg-black/5 dark:bg-white/10" />

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-11 rounded-xl text-[#1d1d1f] dark:text-[#f5f5f7] ${
                  isActive
                    ? "bg-[#0066cc]/10 text-[#0066cc] hover:bg-[#0066cc]/15"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <item.icon size={18} strokeWidth={1.75} />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 h-11 rounded-xl text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Sign out
          </Button>
        </form>
      </div>
    </motion.aside>
  )
}
