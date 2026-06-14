"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface WelcomeHeaderProps {
  name: string
  compact?: boolean
}

export function WelcomeHeader({ name, compact = false }: WelcomeHeaderProps) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <Avatar
        className={`bg-[#f5c542] text-[#1d1d1f] font-semibold border-2 border-white shadow-sm ${
          compact ? "w-10 h-10 text-sm" : "w-14 h-14 text-lg"
        }`}
      >
        <AvatarFallback>{name ? name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
      </Avatar>
      <div>
        <p className={`text-[#8a8a8a] ${compact ? "text-[10px]" : "text-sm"}`}>Welcome back,</p>
        <h1
          className={`font-semibold tracking-tight text-[#1d1d1f] ${
            compact ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"
          }`}
        >
          {name || "Dreamer"}
        </h1>
      </div>
    </div>
  )
}
