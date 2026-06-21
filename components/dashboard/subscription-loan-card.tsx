"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Repeat, Landmark, ArrowUpRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Subscription, Loan } from "@/lib/finances/actions"
import { useCurrency } from "@/components/providers/currency-provider"
import { formatCurrency } from "@/lib/calculator/utils"

interface SubscriptionLoanCardProps {
  subscriptions: Subscription[]
  loans: Loan[]
  compact?: boolean
}

export function SubscriptionLoanCard({ subscriptions, loans, compact = false }: SubscriptionLoanCardProps) {
  const currency = useCurrency()
  const totalSubscriptions = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0)
  const totalLoanRemaining = loans.reduce((sum, l) => sum + Number(l.remaining_amount), 0)
  const totalLoanPayment = loans.reduce((sum, l) => sum + Number(l.monthly_payment), 0)
  const isEmpty = subscriptions.length === 0 && loans.length === 0

  return (
    <div className="h-full flex flex-col">
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className={`text-white/70 mb-3 ${compact ? "text-xs" : "text-sm"}`}>
            No subscriptions or loans tracked
          </p>
          <Link href="/finances?tab=subscriptions">
            <Button
              variant="outline"
              className={`rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white ${compact ? "h-8 text-xs" : "h-10"}`}
            >
              <Plus size={compact ? 14 : 16} strokeWidth={1.75} className="mr-1.5" />
              Add subscription or loan
            </Button>
          </Link>
        </div>
      ) : (
        <>
      <div className={`flex items-center justify-between ${compact ? "mb-4" : "mb-6"}`}>
        <h3 className={`font-semibold text-white ${compact ? "text-base" : "text-lg"}`}>Subscriptions & Loans</h3>
        <ArrowUpRight size={compact ? 16 : 18} strokeWidth={1.75} className="text-white/60" />
      </div>

      <div className={`grid grid-cols-2 ${compact ? "gap-3 mb-4" : "gap-4 mb-6"}`}>
        <div className={`bg-white/10 rounded-2xl ${compact ? "p-3" : "p-4"}`}>
          <p className={`text-white/60 mb-1 ${compact ? "text-[10px]" : "text-xs"}`}>Monthly subs</p>
          <p className={`font-semibold text-white ${compact ? "text-lg" : "text-xl"}`}>
            {formatCurrency(totalSubscriptions, currency)}
          </p>
        </div>
        <div className={`bg-white/10 rounded-2xl ${compact ? "p-3" : "p-4"}`}>
          <p className={`text-white/60 mb-1 ${compact ? "text-[10px]" : "text-xs"}`}>Loan remaining</p>
          <p className={`font-semibold text-white ${compact ? "text-lg" : "text-xl"}`}>
            {formatCurrency(totalLoanRemaining, currency)}
          </p>
        </div>
      </div>

      <div className={`flex-1 overflow-auto ${compact ? "space-y-3" : "space-y-4"}`}>
        {subscriptions.slice(0, compact ? 2 : 3).map((sub, index) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl bg-[#f5c542]/20 flex items-center justify-center ${compact ? "w-8 h-8" : "w-9 h-9"}`}>
                <Repeat size={compact ? 14 : 16} strokeWidth={1.75} className="text-[#f5c542]" />
              </div>
              <div>
                <p className={`font-medium text-white ${compact ? "text-xs" : "text-sm"}`}>{sub.name}</p>
                <p className={`text-white/50 ${compact ? "text-[10px]" : "text-xs"}`}>{sub.frequency}</p>
              </div>
            </div>
            <span className={`font-medium text-white ${compact ? "text-xs" : "text-sm"}`}>
              {formatCurrency(Number(sub.amount), currency)}
            </span>
          </motion.div>
        ))}

        {loans.slice(0, compact ? 1 : 2).map((loan, index) => (
          <motion.div
            key={loan.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (subscriptions.length + index) * 0.05 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl bg-white/10 flex items-center justify-center ${compact ? "w-8 h-8" : "w-9 h-9"}`}>
                <Landmark size={compact ? 14 : 16} strokeWidth={1.75} className="text-white/70" />
              </div>
              <div>
                <p className={`font-medium text-white ${compact ? "text-xs" : "text-sm"}`}>{loan.name}</p>
                <p className={`text-white/50 ${compact ? "text-[10px]" : "text-xs"}`}>
                  {formatCurrency(Number(loan.remaining_amount), currency)} remaining
                </p>
              </div>
            </div>
            <span className={`font-medium text-white ${compact ? "text-xs" : "text-sm"}`}>
              {formatCurrency(Number(loan.monthly_payment), currency)}
            </span>
          </motion.div>
        ))}
      </div>

      <div className={`border-t border-white/10 ${compact ? "mt-4 pt-3" : "mt-6 pt-4"}`}>
        <div className={`flex items-center justify-between ${compact ? "text-xs" : "text-sm"}`}>
          <span className="text-white/60">Total monthly obligations</span>
          <span className="font-semibold text-white">
            {formatCurrency(totalSubscriptions + totalLoanPayment, currency)}
          </span>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
