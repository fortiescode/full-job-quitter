"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative pt-40 pb-24 md:pt-52 md:pb-32 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 mb-8"
        >
          <Sparkles size={16} strokeWidth={1.75} className="text-[#0066cc]" />
          <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
            Your exit strategy, reimagined
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] leading-[1.05] mb-8"
        >
          Quit your 9-to-5
          <br />
          <span className="text-[#0066cc]">with confidence.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="text-xl md:text-2xl text-[#6e6e73] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Calculate your financial runway, track milestones, and build a clear plan
          to leave your day job on your own terms.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="h-14 px-8 rounded-2xl bg-[#0066cc] hover:bg-[#0066cc]/90 text-white text-lg font-medium"
            >
              Start your plan
              <ArrowRight size={20} strokeWidth={1.75} className="ml-2" />
            </Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 rounded-2xl border-[rgba(0,0,0,0.08)] dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] text-lg font-medium"
            >
              Sign in
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Soft gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0066cc]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </section>
  )
}
