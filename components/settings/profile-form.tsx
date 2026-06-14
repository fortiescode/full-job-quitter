"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Loader2,
  Save,
  Briefcase,
  Heart,
  Target,
  Calendar,
  Shield,
  TrendingUp,
  PiggyBank,
  Bell,
  Moon,
  Flag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AvatarUpload } from "./avatar-upload"
import { updateProfile, updateEscapePlan } from "@/lib/profile/actions"
import type { Tables } from "@/types/database"
import { formatCurrency } from "@/lib/calculator/utils"

type Profile = Tables<"profiles">
type FinancialGoal = Tables<"financial_goals">

interface ProfileFormProps {
  profile: Profile | null
  goal: FinancialGoal | null
  email: string
  userId: string
}

const AVATAR_OPTIONS = ["🏖️", "🚀", "🌴", "💼", "🎯", "🦁", "🐼", "🦊", "🐱", "🐶"]

function isEmoji(avatar: string) {
  return avatar && avatar.length <= 4 && /\p{Emoji}/u.test(avatar)
}

const riskOptions: {
  value: "conservative" | "moderate" | "aggressive"
  label: string
  description: string
}[] = [
  {
    value: "conservative",
    label: "Conservative",
    description: "I want 12+ months runway before I quit.",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "6-12 months runway feels right.",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    description: "I'll jump at 3-6 months with a solid plan.",
  },
]

export function ProfileForm({ profile, goal, email, userId }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [savedSection, setSavedSection] = useState<string | null>(null)

  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [jobTitle, setJobTitle] = useState(profile?.current_job_title || "")
  const [whyQuit, setWhyQuit] = useState(profile?.why_quit || "")
  const [riskTolerance, setRiskTolerance] = useState<
    "conservative" | "moderate" | "aggressive" | ""
  >(profile?.risk_tolerance || "")

  // Escape plan fields
  const [targetQuitDate, setTargetQuitDate] = useState(goal?.target_quit_date || "")
  const [targetRunway, setTargetRunway] = useState(goal?.target_runway_months || 12)
  const [postQuitIncome, setPostQuitIncome] = useState(
    Number(goal?.desired_post_quit_income) || 0
  )
  const [emergencyFundMonths, setEmergencyFundMonths] = useState(
    goal?.emergency_fund_months || 6
  )

  // Preferences (local-only for now)
  const [notifications, setNotifications] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  function showSaved(section: string) {
    setSavedSection(section)
    setTimeout(() => setSavedSection(null), 3000)
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
        current_job_title: jobTitle,
        why_quit: whyQuit,
        risk_tolerance: riskTolerance || null,
      })
      showSaved("profile")
    })
  }

  function handleSaveEscapePlan(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateEscapePlan({
        target_quit_date: targetQuitDate || null,
        target_runway_months: targetRunway,
        desired_post_quit_income: postQuitIncome,
        emergency_fund_months: emergencyFundMonths,
      })
      showSaved("escape")
    })
  }

  const displayName = fullName || email.split("@")[0] || "Dreamer"

  return (
    <div className="space-y-6">
      {/* Hero preview card */}
      <Card className="bg-linear-to-r from-[#f5c542] to-[#f8e4a8] rounded-3xl border-none shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar key={avatarUrl} className="w-24 h-24 border-4 border-white shadow-lg">
                {avatarUrl && !isEmoji(avatarUrl) ? (
                  <AvatarImage src={avatarUrl} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-white text-[#1d1d1f] text-4xl font-semibold">
                  {isEmoji(avatarUrl) ? avatarUrl : displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <AvatarUpload
                  currentAvatar={avatarUrl}
                  onAvatarChange={setAvatarUrl}
                  userId={userId}
                  compact
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-[#1d1d1f]/60 text-center">Pick an emoji</p>
              <div className="grid grid-cols-5 gap-1.5">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarUrl(emoji)}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                      avatarUrl === emoji
                        ? "bg-white scale-110 shadow-sm"
                        : "bg-[#1d1d1f]/10 hover:bg-white/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center md:text-left md:pt-2">
            <p className="text-[#1d1d1f]/70 text-sm uppercase tracking-wide font-medium">
              Escape artist
            </p>
            <h2 className="text-3xl font-semibold text-[#1d1d1f]">{displayName}</h2>
            <p className="text-[#1d1d1f]/70 mt-1">
              {jobTitle || "Future free agent"} • Target: {targetQuitDate || "TBD"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile identity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-white rounded-3xl border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <User size={20} strokeWidth={1.75} />
                Identity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[#1d1d1f]">Full name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1d1d1f] flex items-center gap-2">
                    <Briefcase size={14} strokeWidth={1.75} />
                    Current job title
                  </Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior Software Engineer"
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1d1d1f] flex items-center gap-2">
                    <Mail size={14} strokeWidth={1.75} />
                    Email
                  </Label>
                  <Input
                    value={email}
                    disabled
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/30 text-[#8a8a8a]"
                  />
                  <p className="text-xs text-[#8a8a8a]">Email cannot be changed here.</p>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
                  ) : (
                    <>
                      <Save size={18} strokeWidth={1.75} className="mr-2" />
                      Save identity
                    </>
                  )}
                </Button>
                {savedSection === "profile" && (
                  <p className="text-sm text-[#34c759]">Identity saved.</p>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Escape plan */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-white rounded-3xl border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <Flag size={20} strokeWidth={1.75} />
                Escape plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEscapePlan} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[#1d1d1f] flex items-center gap-2">
                    <Calendar size={14} strokeWidth={1.75} />
                    Target quit date
                  </Label>
                  <Input
                    type="date"
                    value={targetQuitDate}
                    onChange={(e) => setTargetQuitDate(e.target.value)}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#1d1d1f] flex items-center gap-2">
                      <Target size={14} strokeWidth={1.75} />
                      Runway months
                    </Label>
                    <Input
                      type="number"
                      value={targetRunway}
                      onChange={(e) => setTargetRunway(Number(e.target.value))}
                      min={1}
                      className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#1d1d1f] flex items-center gap-2">
                      <Shield size={14} strokeWidth={1.75} />
                      Emergency fund
                    </Label>
                    <Input
                      type="number"
                      value={emergencyFundMonths}
                      onChange={(e) => setEmergencyFundMonths(Number(e.target.value))}
                      min={1}
                      className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1d1d1f] flex items-center gap-2">
                    <TrendingUp size={14} strokeWidth={1.75} />
                    Desired post-quit monthly income
                  </Label>
                  <Input
                    type="number"
                    value={postQuitIncome}
                    onChange={(e) => setPostQuitIncome(Number(e.target.value))}
                    placeholder="3000"
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                  <p className="text-xs text-[#8a8a8a]">
                    How much you expect to earn monthly after quitting.
                  </p>
                </div>

                <div className="bg-[#f8f1de] rounded-2xl p-4 space-y-2">
                  <Label className="text-[#1d1d1f] flex items-center gap-2">
                    <PiggyBank size={14} strokeWidth={1.75} />
                    Total target savings
                  </Label>
                  <p className="text-2xl font-semibold text-[#1d1d1f]">
                    {formatCurrency(postQuitIncome * targetRunway)}
                  </p>
                  <p className="text-xs text-[#8a8a8a]">
                    Based on desired income × runway months
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
                  ) : (
                    <>
                      <Save size={18} strokeWidth={1.75} className="mr-2" />
                      Save escape plan
                    </>
                  )}
                </Button>
                {savedSection === "escape" && (
                  <p className="text-sm text-[#34c759]">Escape plan saved.</p>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-[#1d1d1f] rounded-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Heart size={20} strokeWidth={1.75} />
                Why I want to quit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <Textarea
                  value={whyQuit}
                  onChange={(e) => setWhyQuit(e.target.value)}
                  placeholder="Write your personal manifesto. What will freedom let you do? Travel? Build your own thing? Spend more time with family?"
                  className="min-h-30 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 resize-none"
                />

                <div className="space-y-3">
                  <Label className="text-white">Risk tolerance</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {riskOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRiskTolerance(option.value)}
                        className={`p-4 rounded-2xl text-left border transition-all ${
                          riskTolerance === option.value
                            ? "bg-[#f5c542] border-[#f5c542] text-[#1d1d1f]"
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p
                          className={`text-xs mt-1 ${
                            riskTolerance === option.value
                              ? "text-[#1d1d1f]/70"
                              : "text-white/50"
                          }`}
                        >
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 rounded-xl bg-[#f5c542] hover:bg-[#f5c542]/90 text-[#1d1d1f] font-medium px-6"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
                  ) : (
                    <>
                      <Save size={18} strokeWidth={1.75} className="mr-2" />
                      Save motivation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white rounded-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <Bell size={20} strokeWidth={1.75} />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f1de]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f5c542]/20 flex items-center justify-center">
                      <Bell size={18} strokeWidth={1.75} className="text-[#1d1d1f]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1d1d1f]">Email reminders</p>
                      <p className="text-xs text-[#8a8a8a]">
                        Monthly check-ins on your escape progress
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      notifications ? "bg-[#1d1d1f]" : "bg-[#e8e0cc]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                        notifications ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f1de]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f5c542]/20 flex items-center justify-center">
                      <Moon size={18} strokeWidth={1.75} className="text-[#1d1d1f]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1d1d1f]">Compact dashboard</p>
                      <p className="text-xs text-[#8a8a8a]">
                        Show smaller cards with more data density
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompactMode(!compactMode)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      compactMode ? "bg-[#1d1d1f]" : "bg-[#e8e0cc]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                        compactMode ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Separator className="bg-[#e8e0cc]" />

      <p className="text-sm text-[#8a8a8a] text-center">
        Your data is private and secured with Row Level Security in Supabase.
      </p>
    </div>
  )
}
