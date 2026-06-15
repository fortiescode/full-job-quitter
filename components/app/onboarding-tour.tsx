"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, Route, LayoutDashboard, ArrowRight, X } from "lucide-react"

const ONBOARDING_KEY = "fjq:onboarding-completed"

interface TourStep {
  target: string
  text: string
  icon: React.ReactNode
}

const steps: TourStep[] = [
  {
    target: 'a[href="/calculator"]',
    text: "Start here — calculate your freedom number",
    icon: <Calculator size={20} strokeWidth={1.75} />,
  },
  {
    target: 'a[href="/milestones"]',
    text: "Set your escape milestones",
    icon: <Route size={20} strokeWidth={1.75} />,
  },
  {
    target: 'a[href="/dashboard"]',
    text: "Track everything in one place",
    icon: <LayoutDashboard size={20} strokeWidth={1.75} />,
  },
]

function useOnboardingVisible() {
  return useSyncExternalStore(
    (callback) => {
      const handler = (event: StorageEvent) => {
        if (event.key === ONBOARDING_KEY) callback()
      }
      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    },
    () => typeof window !== "undefined" && !localStorage.getItem(ONBOARDING_KEY),
    () => false
  )
}

// Stable window-size store for useSyncExternalStore
const SERVER_SIZE = { width: 0, height: 0 }
let windowSize: { width: number; height: number } =
  typeof window !== "undefined"
    ? { width: window.innerWidth, height: window.innerHeight }
    : { width: 0, height: 0 }
const windowSizeListeners = new Set<() => void>()

function updateWindowSize() {
  const next = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  if (
    next.width === windowSize.width &&
    next.height === windowSize.height
  ) {
    return
  }
  windowSize = next
  windowSizeListeners.forEach((cb) => cb())
}

function subscribeToWindowSize(callback: () => void) {
  if (typeof window !== "undefined") {
    windowSize = { width: window.innerWidth, height: window.innerHeight }
    window.addEventListener("resize", updateWindowSize)
  }
  windowSizeListeners.add(callback)
  return () => {
    windowSizeListeners.delete(callback)
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", updateWindowSize)
    }
  }
}

function useWindowSize() {
  return useSyncExternalStore(
    subscribeToWindowSize,
    () => windowSize,
    () => SERVER_SIZE
  )
}

export function OnboardingTour() {
  const isVisible = useOnboardingVisible()
  const windowSize = useWindowSize()
  const [currentStep, setCurrentStep] = useState(0)

  const targetRect = useMemo(() => {
    if (!isVisible || typeof document === "undefined") return null
    const step = steps[currentStep]
    const target = document.querySelector(step.target) as HTMLElement | null
    return target?.getBoundingClientRect() ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, currentStep, windowSize])

  function completeTour() {
    if (typeof window === "undefined") return
    localStorage.setItem(ONBOARDING_KEY, "true")
    window.dispatchEvent(new StorageEvent("storage", { key: ONBOARDING_KEY }))
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      completeTour()
    }
  }

  if (!isVisible || !targetRect) return null

  const step = steps[currentStep]
  const tooltipWidth = 280
  const gap = 16
  const tooltipLeft = targetRect.right + gap
  const tooltipTop = targetRect.top + targetRect.height / 2

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark overlay — click outside to dismiss */}
      <div
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={completeTour}
        aria-hidden="true"
      />

      {/* Spotlight */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: targetRect.left - 8,
          top: targetRect.top - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      >
        <motion.div
          layoutId="tour-spotlight"
          className="w-full h-full rounded-2xl ring-2 ring-[#f5c542] ring-offset-4 ring-offset-[#f8f1de]/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-white rounded-3xl shadow-xl border border-[#e8e0cc] p-5 w-[280px] pointer-events-auto"
          style={{
            left: Math.min(tooltipLeft, windowSize.width - tooltipWidth - 24),
            top: Math.max(24, Math.min(tooltipTop - 80, windowSize.height - 220)),
          }}
        >
          {/* Arrow pointing to the target */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-l border-b border-[#e8e0cc]" />

          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5c542]/20 flex items-center justify-center text-[#1d1d1f]">
              {step.icon}
            </div>
            <button
              type="button"
              onClick={completeTour}
              className="w-8 h-8 rounded-full bg-[#f8f1de] flex items-center justify-center text-[#8a8a8a] hover:text-[#1d1d1f] transition-colors"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          <p className="text-sm text-[#1d1d1f] mb-5">{step.text}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-[#f5c542]" : "bg-[#e8e0cc]"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="h-9 px-4 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white text-sm font-medium flex items-center"
            >
              {currentStep === steps.length - 1 ? "Got it" : "Next"}
              <ArrowRight size={14} strokeWidth={2} className="ml-1.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
