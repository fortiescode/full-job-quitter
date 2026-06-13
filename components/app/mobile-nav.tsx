"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calculator,
  Route,
  BarChart3,
  Menu,
  X,
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

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 p-4">
        <div className="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]"
          >
            full-jog-quitter
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="rounded-xl"
          >
            <Menu size={20} strokeWidth={1.75} />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-72 glass-panel z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Menu
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="rounded-xl"
                >
                  <X size={20} strokeWidth={1.75} />
                </Button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start gap-3 h-12 rounded-xl ${
                          isActive
                            ? "bg-[#0066cc]/10 text-[#0066cc] hover:bg-[#0066cc]/15"
                            : "text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                      >
                        <item.icon size={18} strokeWidth={1.75} />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>

              <Separator className="bg-black/5 dark:bg-white/10 my-4" />

              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 rounded-xl text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                >
                  <LogOut size={18} strokeWidth={1.75} />
                  Sign out
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
