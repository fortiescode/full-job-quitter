"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calculator,
  Route,
  Wallet,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { signOut } from "@/lib/auth/actions"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/milestones", label: "Milestones", icon: Route },
  { href: "/finances", label: "Finances", icon: Wallet },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isSettingsActive = pathname === "/settings" || pathname.startsWith("/settings/")

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 p-4">
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/trans-logo.png"
              alt="full-jog-quitter logo"
              width={28}
              height={28}
              className="h-7 w-auto"
              priority
            />
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
              className="lg:hidden fixed top-0 right-0 bottom-0 w-72 bg-[#f8f1de] z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-semibold text-[#1d1d1f]">
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
                        variant="ghost"
                        className={`w-full justify-start gap-3 h-12 rounded-r-xl rounded-l-none border-l-[3px] transition-colors ${
                          isActive
                            ? "bg-white text-[#1d1d1f] border-[var(--accent-color)]"
                            : "text-[#1d1d1f] hover:bg-white/50 border-transparent"
                        }`}
                      >
                        <item.icon size={18} strokeWidth={1.75} />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>

              <Separator className="bg-[#e8e0cc] my-4" />

              <div className="space-y-2">
                <Link href="/settings" onClick={() => setOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-12 rounded-r-xl rounded-l-none border-l-[3px] transition-colors ${
                      isSettingsActive
                        ? "bg-white text-[#1d1d1f] border-[var(--accent-color)]"
                        : "text-[#1d1d1f] hover:bg-white/50 border-transparent"
                    }`}
                  >
                    <Settings size={18} strokeWidth={1.75} />
                    Settings
                  </Button>
                </Link>
                <form action={signOut}>
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 rounded-xl text-[#1d1d1f] hover:bg-white/50"
                  >
                    <LogOut size={18} strokeWidth={1.75} />
                    Sign out
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
