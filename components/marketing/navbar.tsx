"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className="mx-4 mt-4 md:mx-6 md:mt-6">
        <div className="glass-card rounded-2xl px-5 py-3 max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/fjq-logo.png"
              alt="full-jog-quitter logo"
              width={60}
              height={60}
              className="h-15 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/auth/sign-in">
              <Button
                variant="ghost"
                className="rounded-xl text-[#1d1d1f] hover:bg-[#f8f1de]"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-5">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </motion.header>
  )
}
