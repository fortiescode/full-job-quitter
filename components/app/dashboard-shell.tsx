"use client"

import { useCallback, useSyncExternalStore } from "react"
import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"
import { OnboardingTour } from "./onboarding-tour"
import { Toaster } from "@/components/ui/sonner"

const COLLAPSED_KEY = "sidebar-collapsed"

function subscribe(callback: () => void) {
  const handler = (event: StorageEvent) => {
    if (event.key === COLLAPSED_KEY) callback()
  }
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}

function getSnapshot() {
  return localStorage.getItem(COLLAPSED_KEY) === "true"
}

function getServerSnapshot() {
  return false
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const handleCollapseChange = useCallback((value: boolean) => {
    localStorage.setItem(COLLAPSED_KEY, String(value))
    window.dispatchEvent(new StorageEvent("storage", { key: COLLAPSED_KEY }))
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f1de]">
      <Sidebar collapsed={collapsed} onCollapseChange={handleCollapseChange} />
      <MobileNav />
      <OnboardingTour />
      <Toaster />
      <main
        className={`min-w-0 pt-24 transition-[margin] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          collapsed ? "lg:ml-[7rem]" : "lg:ml-[20rem]"
        } lg:pt-6`}
      >
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
