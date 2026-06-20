"use client"

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import {
  DEFAULT_ACCENT_COLOR,
  getAccentColor,
  storeAccentColor,
  applyAccentColor,
} from "@/lib/accent-color"

interface AccentColorContextValue {
  accentColor: string
  setAccentColor: (color: string) => void
}

const AccentColorContext = createContext<AccentColorContextValue>({
  accentColor: DEFAULT_ACCENT_COLOR,
  setAccentColor: () => {},
})

const mountedSubscribe = () => () => {}
const getMountedClientSnapshot = () => true
const getMountedServerSnapshot = () => false

function subscribe(callback: () => void) {
  const storageHandler = (e: StorageEvent) => {
    if (e.key === "accent_color") callback()
  }
  const customHandler = () => callback()
  window.addEventListener("storage", storageHandler)
  window.addEventListener("accent-color-change", customHandler)
  return () => {
    window.removeEventListener("storage", storageHandler)
    window.removeEventListener("accent-color-change", customHandler)
  }
}

export function useAccentColor() {
  return useContext(AccentColorContext)
}

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    mountedSubscribe,
    getMountedClientSnapshot,
    getMountedServerSnapshot
  )

  const accentColor = useSyncExternalStore(
    subscribe,
    getAccentColor,
    () => DEFAULT_ACCENT_COLOR
  )

  useEffect(() => {
    if (mounted) {
      applyAccentColor(accentColor)
    }
  }, [accentColor, mounted])

  const setAccentColor = useCallback((color: string) => {
    applyAccentColor(color)
    storeAccentColor(color)
    window.dispatchEvent(new Event("accent-color-change"))
  }, [])

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
      {mounted && (
        <style>{`
          ::selection {
            background-color: var(--accent-color);
            color: var(--accent-foreground);
          }
        `}</style>
      )}
    </AccentColorContext.Provider>
  )
}
