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
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e8e0cc] px-4 py-1.5 mb-8 shadow-sm"
        >
          <Sparkles size={16} strokeWidth={1.75} className="text-[var(--accent-color)]" />
          <span className="text-sm font-medium text-[#1d1d1f]">
            Your tool to escape
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-[#1d1d1f] leading-[1.05] mb-8"
        >
          Quit your 9-to-5
          <br />
          <span className="text-[var(--accent-color)]">with confidence.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="text-xl md:text-2xl text-[#8a8a8a] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Calculate your financial runway, track milestones, and build a clear plan
          to leave your day job on your own terms.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="h-14 px-8 rounded-2xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white text-lg font-medium"
            >
              Start your plan
              <ArrowRight size={20} strokeWidth={1.75} className="ml-2" />
            </Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 rounded-2xl border-[#e8e0cc] bg-white text-[#1d1d1f] text-lg font-medium hover:bg-[#f8f1de]"
            >
              Sign in
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Soft gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#f5c542]/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </section>
  )
}
