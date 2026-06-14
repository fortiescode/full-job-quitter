"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface WelcomeHeaderProps {
  name: string
  avatarUrl?: string | null
  compact?: boolean
}

function isEmoji(avatar: string | null | undefined) {
  return !!avatar && avatar.length <= 4 && /\p{Emoji}/u.test(avatar)
}

const GREETING_HIDDEN_KEY = "fjq:dashboard:greeting-hidden"

export function WelcomeHeader({ name, avatarUrl = "", compact = false }: WelcomeHeaderProps) {
  const displayName = name || "Dreamer"
  const [showGreeting, setShowGreeting] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)

    if (typeof window !== "undefined" && sessionStorage.getItem(GREETING_HIDDEN_KEY) === "true") {
      setShowGreeting(false)
      return
    }

    const timer = setTimeout(() => {
      setShowGreeting(false)
      if (typeof window !== "undefined") {
        sessionStorage.setItem(GREETING_HIDDEN_KEY, "true")
      }
    }, 90_000) // 1.5 minutes

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex items-center gap-3 md:gap-4">
      <Avatar
        key={avatarUrl}
        className={`bg-[#f5c542] text-[#1d1d1f] font-semibold border-2 border-white shadow-sm ${
          compact ? "w-10 h-10 text-sm" : "w-14 h-14 text-lg"
        }`}
      >
        {avatarUrl && !isEmoji(avatarUrl) ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : null}
        <AvatarFallback className="bg-[#f5c542] text-[#1d1d1f]">
          {isEmoji(avatarUrl) ? avatarUrl : displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        {isHydrated && (
          <motion.p
            initial={{ opacity: showGreeting ? 1 : 0 }}
            animate={{ opacity: showGreeting ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className={`text-[#8a8a8a] ${compact ? "text-[10px]" : "text-sm"}`}
          >
            Welcome back,
          </motion.p>
        )}
        <h1
          className={`font-semibold tracking-tight text-[#1d1d1f] ${
            compact ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"
          }`}
        >
          {displayName}
        </h1>
      </div>
    </div>
  )
}
