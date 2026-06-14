"use client"

import { Check } from "lucide-react"
import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        className:
          "bg-white text-[#1d1d1f] border-none shadow-lg rounded-full px-4 py-3",
        descriptionClassName: "text-[#8a8a8a]",
      }}
      icons={{
        success: (
          <div className="w-5 h-5 rounded-full bg-[#34c759] flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={2.5} className="text-white" />
          </div>
        ),
      }}
      closeButton={false}
      duration={3000}
    />
  )
}
