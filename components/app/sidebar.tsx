"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calculator,
  Route,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth/actions"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/milestones", label: "Milestones", icon: Route },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/finances", label: "Finances", icon: Wallet },
]

interface SidebarProps {
  collapsed: boolean
  onCollapseChange: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, onCollapseChange }: SidebarProps) {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hidden lg:flex flex-col h-[calc(100vh-48px)] max-h-[900px] fixed top-6 left-6 z-40"
    >
      <div
        className={`flex flex-col h-full bg-white/80 backdrop-blur-xl border border-[#e8e0cc] rounded-3xl shadow-xl shadow-black/5 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header with logo and toggle */}
        <div className="p-4 flex items-center justify-between min-h-[72px]">
          <AnimatePresence mode="wait" initial={false}>
            {!collapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/"
                  title="full-jog-quitter"
                  className="text-lg font-semibold tracking-tight text-[#1d1d1f] whitespace-nowrap"
                >
                  full-jog-quitter
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="logo-collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-full flex justify-center"
              >
                <Link
                  href="/"
                  title="full-jog-quitter"
                  className="w-10 h-10 rounded-xl bg-[#f5c542] flex items-center justify-center text-[#1d1d1f] font-bold text-sm shadow-sm"
                >
                  FJ
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapseChange(!collapsed)}
            className={`h-8 w-8 rounded-lg hover:bg-[#f8f1de] text-[#8a8a8a] shrink-0 transition-all ${
              collapsed ? "absolute -right-3 top-5 bg-white border border-[#e8e0cc] shadow-sm" : ""
            }`}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </motion.div>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link key={item.href} href={item.href} title={item.label}>
                <Button
                  variant="ghost"
                  className={`relative w-full h-11 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#f5c542]/20 text-[#1d1d1f]"
                      : "text-[#1d1d1f] hover:bg-[#f8f1de]"
                  } ${collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"}`}
                >
                  <item.icon size={20} strokeWidth={1.75} className="shrink-0" />
                  <AnimatePresence mode="wait" initial={false}>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#f5c542] rounded-r-full" />
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-1 border-t border-[#e8e0cc]">
          <Link href="/settings" title="Settings">
            <Button
              variant="ghost"
              className={`w-full h-11 rounded-xl text-[#1d1d1f] hover:bg-[#f8f1de] transition-all duration-200 ${
                collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
              }`}
            >
              <Settings size={20} strokeWidth={1.75} className="shrink-0" />
              <AnimatePresence mode="wait" initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="font-medium whitespace-nowrap"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>

          <form action={signOut} className="w-full">
            <Button
              type="submit"
              variant="ghost"
              className={`w-full h-11 rounded-xl text-[#1d1d1f] hover:bg-[#f8f1de] transition-all duration-200 ${
                collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
              }`}
            >
              <LogOut size={20} strokeWidth={1.75} className="shrink-0" />
              <AnimatePresence mode="wait" initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="font-medium whitespace-nowrap"
                  >
                    Sign out
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </form>
        </div>
      </div>
    </motion.aside>
  )
}
