"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface CurrencyContextValue {
  currency: string
  setCurrency: (currency: string) => void
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
})

export function CurrencyProvider({
  children,
  currency = "USD",
}: {
  children: React.ReactNode
  currency?: string
}) {
  const [resolvedCurrency, setResolvedCurrency] = useState(currency)

  useEffect(() => {
    setResolvedCurrency(currency)
  }, [currency])

  return (
    <CurrencyContext.Provider
      value={{ currency: resolvedCurrency, setCurrency: setResolvedCurrency }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext).currency
}

export function useSetCurrency() {
  return useContext(CurrencyContext).setCurrency
}
