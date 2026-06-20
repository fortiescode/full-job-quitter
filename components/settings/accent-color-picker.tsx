"use client"

import { Check } from "lucide-react"
import { useAccentColor } from "@/components/providers/accent-color-provider"
import { ACCENT_COLORS } from "@/lib/accent-color"
import { toast } from "sonner"

export function AccentColorPicker() {
  const { accentColor, setAccentColor } = useAccentColor()

  function handleSelect(color: string) {
    setAccentColor(color)
    toast.success("Accent color updated")
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--accent-color-10)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-color-10)] flex items-center justify-center">
          <div
            className="w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-[var(--accent-color-10)] ring-[#1d1d1f]"
            style={{ backgroundColor: accentColor }}
          />
        </div>
        <div>
          <p className="font-medium text-[#1d1d1f]">Accent color</p>
          <p className="text-xs text-[#8a8a8a]">Make the app yours</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {ACCENT_COLORS.map((color) => {
          const isSelected = accentColor.toLowerCase() === color.value.toLowerCase()
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => handleSelect(color.value)}
              title={color.name}
              aria-label={`Select ${color.name} accent color`}
              className={`relative w-8 h-8 rounded-full border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f] focus-visible:ring-offset-2 ${
                isSelected
                  ? "ring-2 ring-[#1d1d1f] ring-offset-2"
                  : "border-black/10"
              }`}
              style={{ backgroundColor: color.value }}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check
                    size={14}
                    strokeWidth={3}
                    className="text-white drop-shadow-sm"
                  />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
