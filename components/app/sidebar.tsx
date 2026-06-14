"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calculator,
  Route,
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
  { href: "/finances", label: "Finances", icon: Wallet },
]

interface SidebarProps {
  collapsed: boolean
  onCollapseChange: (collapsed: boolean) => void
}

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
}: {
  href: string
  label: string
  icon: React.ElementType
  collapsed: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link key={href} href={href} title={label}>
      <Button
        variant="ghost"
        className={`relative w-full h-11 rounded-r-xl rounded-l-none transition-all duration-200 border-l-[3px] ${
          isActive
            ? "bg-[#f5f5f5] text-[#1d1d1f] border-[#f5c542]"
            : "text-[#1d1d1f] hover:bg-[#f8f1de] border-transparent"
        } ${collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"}`}
      >
        <Icon size={20} strokeWidth={1.75} className="shrink-0" />
        <AnimatePresence mode="wait" initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="font-medium whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </Link>
  )
}

export function Sidebar({ collapsed, onCollapseChange }: SidebarProps) {
  const pathname = usePathname()
  const isSettingsActive = pathname === "/settings" || pathname.startsWith("/settings/")

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
        {/* Header with logo */}
        <div className="p-4 flex items-center justify-center min-h-[72px]">
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Collapse / expand toggle */}
        <div className="px-3 pb-2 pt-1 flex justify-center border-b border-[#e8e0cc]">
          <Button
            variant="ghost"
            onClick={() => onCollapseChange(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`rounded-full bg-[#f8f1de] hover:bg-[#f5c542]/30 text-[#1d1d1f] shadow-sm transition-all duration-200 ${
              collapsed
                ? "w-9 h-9 p-0 justify-center"
                : "h-9 px-4 gap-2 justify-start"
            }`}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </motion.div>
            <AnimatePresence mode="wait" initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Footer */}
        <div className="p-3 space-y-1">
          <Link href="/settings" title="Settings">
            <Button
              variant="ghost"
              className={`w-full h-11 rounded-r-xl rounded-l-none transition-all duration-200 border-l-[3px] ${
                isSettingsActive
                  ? "bg-[#f5f5f5] text-[#1d1d1f] border-[#f5c542]"
                  : "text-[#1d1d1f] hover:bg-[#f8f1de] border-transparent"
              } ${collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"}`}
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
