"use client"

import { useState, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/components/providers/currency-provider"

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | string
  onChange: (value: number) => void
  className?: string
}

function formatCurrencyInput(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function getCurrencySymbol(currency: string): string {
  try {
    return (
      new Intl.NumberFormat("en-US", { style: "currency", currency })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? "$"
    )
  } catch {
    return "$"
  }
}

function parseCurrencyInput(value: string): number {
  const digits = value.replace(/[^0-9.-]/g, "")
  const parsed = Number(digits)
  return Number.isNaN(parsed) ? 0 : parsed
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const currency = useCurrency()
    const numericValue = typeof value === "string" ? parseCurrencyInput(value) : Number(value) || 0
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(String(numericValue))

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      setIsEditing(true)
      setEditValue(String(numericValue))
      props.onFocus?.(e)
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      setIsEditing(false)
      const parsed = parseCurrencyInput(editValue)
      onChange(parsed)
      props.onBlur?.(e)
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value
      setEditValue(raw)
      const parsed = parseCurrencyInput(raw)
      onChange(parsed)
    }

    return (
      <div className={cn("relative", className)}>
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a] font-medium pointer-events-none">
          {getCurrencySymbol(currency)}
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          {...props}
          value={isEditing ? editValue : formatCurrencyInput(numericValue, currency)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            "w-full h-12 rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50 pl-8 pr-4 text-[#1d1d1f] placeholder:text-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#f5c542]/50",
            className
          )}
        />
      </div>
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"
