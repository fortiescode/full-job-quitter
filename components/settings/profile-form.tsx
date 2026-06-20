"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
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
  Coins,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AvatarUpload } from "./avatar-upload"
import { AccentColorPicker } from "./accent-color-picker"
import { SectionStatusIndicator, type SectionStatus } from "./section-status"
import { useSetCurrency } from "@/components/providers/currency-provider"
import { updateProfile, updateEscapePlan } from "@/lib/profile/actions"
import type { Tables } from "@/types/database"
import { formatCurrency } from "@/lib/calculator/utils"
import { toast } from "sonner"

type Profile = Tables<"profiles">
type FinancialGoal = Tables<"financial_goals">

interface ProfileFormProps {
  profile: Profile | null
  goal: FinancialGoal | null
  email: string
  userId: string
}

const SECTIONS = ["identity", "escape", "motivation", "preferences"] as const
type SectionName = (typeof SECTIONS)[number]

const riskOptions: {
  value: "conservative" | "moderate" | "aggressive"
  label: string
  description: string
}[] = [
  {
    value: "conservative",
    label: "Play it safe",
    description: "I want 12+ months saved before I quit.",
  },
  {
    value: "moderate",
    label: "Balanced",
    description: "6-12 months feels right.",
  },
  {
    value: "aggressive",
    label: "Go for it",
    description: "I'll jump at 3-6 months with a solid plan.",
  },
]

function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

export function ProfileForm({ profile, goal, email, userId }: ProfileFormProps) {
  const setGlobalCurrency = useSetCurrency()
  const [isOnline, setIsOnline] = useState(true)
  const [offlineQueue, setOfflineQueue] = useState<(() => void)[]>([])

  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [jobTitle, setJobTitle] = useState(profile?.current_job_title || "")
  const [whyQuit, setWhyQuit] = useState(profile?.why_quit || "")
  const [riskTolerance, setRiskTolerance] = useState<
    "conservative" | "moderate" | "aggressive" | ""
  >(profile?.risk_tolerance || "")

  // Saved values for revert on error
  const savedValues = useRef({
    fullName: profile?.full_name || "",
    avatarUrl: profile?.avatar_url || "",
    jobTitle: profile?.current_job_title || "",
    whyQuit: profile?.why_quit || "",
    riskTolerance: profile?.risk_tolerance || "",
    targetQuitDate: goal?.target_quit_date || "",
    targetRunway: goal?.target_runway_months || 12,
    postQuitIncome: Number(goal?.desired_post_quit_income) || 0,
    emergencyFundMonths: goal?.emergency_fund_months || 6,
    emailReminders: profile?.email_reminders ?? true,
    compactMode: profile?.compact_mode ?? false,
    currency: profile?.currency ?? "USD",
  })

  // Quit plan fields
  const [targetQuitDate, setTargetQuitDate] = useState(goal?.target_quit_date || "")
  const [targetRunway, setTargetRunway] = useState(goal?.target_runway_months || 12)
  const [postQuitIncome, setPostQuitIncome] = useState(
    Number(goal?.desired_post_quit_income) || 0
  )
  const [emergencyFundMonths, setEmergencyFundMonths] = useState(
    goal?.emergency_fund_months || 6
  )

  // Preferences
  const [emailReminders, setEmailReminders] = useState(profile?.email_reminders ?? true)
  const [compactMode, setCompactMode] = useState(profile?.compact_mode ?? false)
  const [currency, setCurrency] = useState(profile?.currency ?? "USD")

  // Section statuses
  const [statuses, setStatuses] = useState<Record<SectionName, SectionStatus>>({
    identity: "saved",
    escape: "saved",
    motivation: "saved",
    preferences: "saved",
  })

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({
    targetRunway: null,
    emergencyFundMonths: null,
    postQuitIncome: null,
  })

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success("Back online — changes synced")
      offlineQueue.forEach((fn) => fn())
      setOfflineQueue([])
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [offlineQueue])

  useEffect(() => {
    const lastSection = sessionStorage.getItem("settings_last_section") as SectionName | null
    if (lastSection && SECTIONS.includes(lastSection)) {
      setTimeout(() => {
        const element = document.getElementById(`section-${lastSection}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
          element.classList.add("animate-highlight")
          setTimeout(() => element.classList.remove("animate-highlight"), 600)
        }
      }, 300)
    }
  }, [])

  function setSectionStatus(section: SectionName, status: SectionStatus) {
    setStatuses((prev) => ({ ...prev, [section]: status }))
  }

  function showToast(section: SectionName) {
    const messages: Record<SectionName, string> = {
      identity: "Identity saved",
      escape: "Quit plan saved",
      motivation: "Motivation saved",
      preferences: "Preferences saved",
    }
    toast.success(messages[section], { id: "settings-save-toast" })
  }

  function queueOrRun(section: SectionName, fn: () => Promise<void>) {
    if (!isOnline) {
      setSectionStatus(section, "unsaved")
      setOfflineQueue((prev) => [...prev, () => { fn().catch(() => {}) }])
      return
    }
    fn().catch(() => {})
  }

  async function saveIdentity() {
    setSectionStatus("identity", "saving")
    const result = await updateProfile({
      full_name: fullName,
      avatar_url: avatarUrl,
      current_job_title: jobTitle,
    })
    if (result.error) {
      setSectionStatus("identity", "error")
      throw new Error(result.error)
    }
    savedValues.current = {
      ...savedValues.current,
      fullName,
      avatarUrl,
      jobTitle,
    }
    setSectionStatus("identity", "saved")
    showToast("identity")
  }

  async function saveMotivation() {
    setSectionStatus("motivation", "saving")
    const result = await updateProfile({
      why_quit: whyQuit,
      risk_tolerance: riskTolerance || null,
    })
    if (result.error) {
      setSectionStatus("motivation", "error")
      throw new Error(result.error)
    }
    savedValues.current = {
      ...savedValues.current,
      whyQuit,
      riskTolerance,
    }
    setSectionStatus("motivation", "saved")
    showToast("motivation")
  }

  async function saveEscapePlan() {
    setSectionStatus("escape", "saving")
    const result = await updateEscapePlan({
      target_quit_date: targetQuitDate || null,
      target_runway_months: targetRunway,
      desired_post_quit_income: postQuitIncome,
      emergency_fund_months: emergencyFundMonths,
    })
    if (result.error) {
      setSectionStatus("escape", "error")
      throw new Error(result.error)
    }
    savedValues.current = {
      ...savedValues.current,
      targetQuitDate,
      targetRunway,
      postQuitIncome,
      emergencyFundMonths,
    }
    setSectionStatus("escape", "saved")
    showToast("escape")
  }

  async function savePreferences() {
    setSectionStatus("preferences", "saving")
    const result = await updateProfile({
      compact_mode: compactMode,
      email_reminders: emailReminders,
      currency,
    })
    setGlobalCurrency(currency)
    if (result.error) {
      setSectionStatus("preferences", "error")
      throw new Error(result.error)
    }
    savedValues.current = {
      ...savedValues.current,
      compactMode,
      emailReminders,
      currency,
    }
    setSectionStatus("preferences", "saved")
    showToast("preferences")
  }

  function handleIdentityBlur() {
    if (
      fullName !== savedValues.current.fullName ||
      jobTitle !== savedValues.current.jobTitle ||
      avatarUrl !== savedValues.current.avatarUrl
    ) {
      queueOrRun("identity", saveIdentity)
    }
  }

  function handleAvatarChange(url: string) {
    setAvatarUrl(url)
    setSectionStatus("identity", "unsaved")
    queueOrRun("identity", async () => {
      setSectionStatus("identity", "saving")
      const result = await updateProfile({ avatar_url: url })
      if (result.error) {
        setAvatarUrl(savedValues.current.avatarUrl)
        setSectionStatus("identity", "error")
        throw new Error(result.error)
      }
      savedValues.current.avatarUrl = url
      setSectionStatus("identity", "saved")
      showToast("identity")
    })
  }

  const debouncedSaveMotivation = useDebouncedCallback(() => {
    if (whyQuit !== savedValues.current.whyQuit) {
      queueOrRun("motivation", saveMotivation)
    }
  }, 2000)

  function handleWhyQuitChange(value: string) {
    setWhyQuit(value)
    setSectionStatus("motivation", "unsaved")
    debouncedSaveMotivation()
  }

  function handleRiskToleranceChange(value: "conservative" | "moderate" | "aggressive") {
    const previous = riskTolerance
    setRiskTolerance(value)
    setSectionStatus("motivation", "saving")
    queueOrRun("motivation", async () => {
      const result = await updateProfile({ risk_tolerance: value || null })
      if (result.error) {
        setRiskTolerance(previous)
        setSectionStatus("motivation", "error")
        throw new Error(result.error)
      }
      savedValues.current.riskTolerance = value
      setSectionStatus("motivation", "saved")
      showToast("motivation")
    })
  }

  function handleEscapeBlur(field: "targetRunway" | "emergencyFundMonths" | "postQuitIncome") {
    if (errors[field]) return
    const valueMap = {
      targetRunway,
      emergencyFundMonths,
      postQuitIncome,
    }
    const savedMap = {
      targetRunway: savedValues.current.targetRunway,
      emergencyFundMonths: savedValues.current.emergencyFundMonths,
      postQuitIncome: savedValues.current.postQuitIncome,
    }
    if (valueMap[field] !== savedMap[field]) {
      queueOrRun("escape", saveEscapePlan)
    }
  }

  function validateNumber(value: number, field: string): boolean {
    if (Number.isNaN(value)) {
      setErrors((prev) => ({ ...prev, [field]: "Please enter a number." }))
      return false
    }
    setErrors((prev) => ({ ...prev, [field]: null }))
    return true
  }

  function handleTargetQuitDateChange(value: string) {
    setTargetQuitDate(value)
    queueOrRun("escape", async () => {
      setSectionStatus("escape", "saving")
      const result = await updateEscapePlan({ target_quit_date: value || null })
      if (result.error) {
        setTargetQuitDate(savedValues.current.targetQuitDate)
        setSectionStatus("escape", "error")
        throw new Error(result.error)
      }
      savedValues.current.targetQuitDate = value
      setSectionStatus("escape", "saved")
      showToast("escape")
    })
  }

  function handleToggle(
    setter: (value: boolean) => void,
    value: boolean,
    field: "emailReminders" | "compactMode"
  ) {
    const previous = field === "emailReminders" ? emailReminders : compactMode
    setter(value)
    setSectionStatus("preferences", "saving")
    queueOrRun("preferences", async () => {
      const update =
        field === "emailReminders"
          ? { email_reminders: value }
          : { compact_mode: value }
      const result = await updateProfile(update)
      if (result.error) {
        setter(previous)
        setSectionStatus("preferences", "error")
        throw new Error(result.error)
      }
      savedValues.current[field] = value
      setSectionStatus("preferences", "saved")
      showToast("preferences")
    })
  }

  function handleCurrencyChange(value: string) {
    const previous = currency
    setCurrency(value)
    setGlobalCurrency(value)
    setSectionStatus("preferences", "saving")
    queueOrRun("preferences", async () => {
      const result = await updateProfile({ currency: value })
      if (result.error) {
        setCurrency(previous)
        setGlobalCurrency(previous)
        setSectionStatus("preferences", "error")
        throw new Error(result.error)
      }
      savedValues.current.currency = value
      setSectionStatus("preferences", "saved")
      showToast("preferences")
    })
  }

  function handleSectionFocus(section: SectionName) {
    sessionStorage.setItem("settings_last_section", section)
  }

  const displayName = fullName || email.split("@")[0] || "Dreamer"

  return (
    <div className="space-y-8">
      {!isOnline && (
        <div className="bg-[#f5c542]/10 border border-[#f5c542]/30 text-[#1d1d1f] rounded-xl px-4 py-3 text-sm">
          Offline — changes will sync when you reconnect
        </div>
      )}

      {/* Hero preview card */}
      <Card className="bg-white rounded-3xl border border-[#e8e0cc] shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar
                key={avatarUrl}
                className="w-24 h-24 border-4 border-white shadow-lg ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-white"
              >
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                <AvatarFallback className="bg-white text-[#1d1d1f] text-4xl font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <AvatarUpload
                  currentAvatar={avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  userId={userId}
                  compact
                />
              </div>
            </div>
          </div>

          <div className="text-center md:text-left md:pt-2">
            <h2 className="text-2xl font-semibold text-[#1d1d1f]">{displayName}</h2>
            <p className="text-sm font-normal text-[#86868b] mt-1">
              {jobTitle || "Future free agent"} • Target: {targetQuitDate || "TBD"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile */}
        <motion.div
          id="section-identity"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onFocusCapture={() => handleSectionFocus("identity")}
        >
          <Card
            className={`bg-white rounded-3xl shadow-sm h-full transition-all duration-200 ${
              statuses.identity === "error"
                ? "border-l-[3px] border-l-[#ff3b30] border-solid"
                : "border-none"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <User size={20} strokeWidth={1.75} />
                Identity
              </CardTitle>
              <SectionStatusIndicator
                status={statuses.identity}
                onRetry={() => queueOrRun("identity", saveIdentity)}
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[#1d1d1f]">Full name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    setSectionStatus("identity", "unsaved")
                  }}
                  onBlur={handleIdentityBlur}
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
                  onChange={(e) => {
                    setJobTitle(e.target.value)
                    setSectionStatus("identity", "unsaved")
                  }}
                  onBlur={handleIdentityBlur}
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Your quit plan */}
        <motion.div
          id="section-escape"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onFocusCapture={() => handleSectionFocus("escape")}
        >
          <Card
            className={`bg-white rounded-3xl shadow-sm h-full transition-all duration-200 ${
              statuses.escape === "error"
                ? "border-l-[3px] border-l-[#ff3b30] border-solid"
                : "border-none"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <Flag size={20} strokeWidth={1.75} />
                Your quit plan
              </CardTitle>
              <SectionStatusIndicator
                status={statuses.escape}
                onRetry={() => queueOrRun("escape", saveEscapePlan)}
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[#1d1d1f] flex items-center gap-2">
                  <Calendar size={14} strokeWidth={1.75} />
                  Target quit date
                </Label>
                <Input
                  type="date"
                  value={targetQuitDate}
                  onChange={(e) => handleTargetQuitDateChange(e.target.value)}
                  className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1d1d1f] flex items-center gap-2">
                    <Target size={14} strokeWidth={1.75} />
                    Months of safety
                  </Label>
                  <Input
                    type="number"
                    value={targetRunway}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setTargetRunway(value)
                      validateNumber(value, "targetRunway")
                      setSectionStatus("escape", "unsaved")
                    }}
                    onBlur={() => handleEscapeBlur("targetRunway")}
                    min={1}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                  {errors.targetRunway && (
                    <p className="text-xs text-[#ff3b30]">{errors.targetRunway}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1d1d1f] flex items-center gap-2">
                    <Shield size={14} strokeWidth={1.75} />
                    Emergency fund
                  </Label>
                  <Input
                    type="number"
                    value={emergencyFundMonths}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setEmergencyFundMonths(value)
                      validateNumber(value, "emergencyFundMonths")
                      setSectionStatus("escape", "unsaved")
                    }}
                    onBlur={() => handleEscapeBlur("emergencyFundMonths")}
                    min={1}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                  {errors.emergencyFundMonths && (
                    <p className="text-xs text-[#ff3b30]">{errors.emergencyFundMonths}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1d1d1f] flex items-center gap-2">
                  <TrendingUp size={14} strokeWidth={1.75} />
                  Income after quitting
                </Label>
                <Input
                  type="number"
                  value={postQuitIncome}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setPostQuitIncome(value)
                    validateNumber(value, "postQuitIncome")
                    setSectionStatus("escape", "unsaved")
                  }}
                  onBlur={() => handleEscapeBlur("postQuitIncome")}
                  placeholder="3000"
                  className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                />
                {errors.postQuitIncome && (
                  <p className="text-xs text-[#ff3b30]">{errors.postQuitIncome}</p>
                )}
                <p className="text-xs text-[#8a8a8a]">
                  How much you expect to earn monthly after quitting
                  (freelancing, side income, etc.)
                </p>
              </div>

              <div className="bg-[#f8f1de] rounded-2xl p-4 space-y-2">
                <Label className="text-[#1d1d1f] flex items-center gap-2">
                  <PiggyBank size={14} strokeWidth={1.75} />
                  What you need saved before you quit
                </Label>
                <p
                  className={`${
                    postQuitIncome === 0 && (goal?.monthly_expenses_after_quit || 0) === 0
                      ? "text-sm text-[#8a8a8a]"
                      : "text-2xl font-semibold text-[#1d1d1f]"
                  }`}
                >
                  {postQuitIncome === 0 && (goal?.monthly_expenses_after_quit || 0) === 0
                    ? "Enter your income after quitting above to calculate your target"
                    : formatCurrency(
                        Math.max(0, (goal?.monthly_expenses_after_quit || 0) - postQuitIncome) *
                          targetRunway,
                        currency
                      )}
                </p>
                <p className="text-xs text-[#8a8a8a]">
                  What you need saved before you can quit
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Motivation */}
        <motion.div
          id="section-motivation"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2"
          onFocusCapture={() => handleSectionFocus("motivation")}
        >
          <Card
            className={`bg-white rounded-3xl shadow-sm transition-all duration-200 ${
              statuses.motivation === "error"
                ? "border-l-[3px] border-l-[#ff3b30] border-solid"
                : "border-l-4 border-l-[var(--accent-color)]"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <Heart size={20} strokeWidth={1.75} />
                Why I want to quit
              </CardTitle>
              <SectionStatusIndicator
                status={statuses.motivation}
                onRetry={() => queueOrRun("motivation", saveMotivation)}
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                value={whyQuit}
                onChange={(e) => handleWhyQuitChange(e.target.value)}
                placeholder="Write your personal manifesto. What will freedom let you do? Travel? Build your own thing? Spend more time with family?"
                className="min-h-30 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50 text-[#1d1d1f] placeholder:text-[#8a8a8a] resize-none"
              />

              <div className="space-y-3">
                <Label className="text-[#1d1d1f]">How brave are you?</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {riskOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRiskToleranceChange(option.value)}
                      className={`p-6 rounded-2xl text-left transition-all ${
                        riskTolerance === option.value
                          ? "bg-white border-2 border-[var(--accent-color)] text-[#1d1d1f]"
                          : "bg-white border border-[#e8e0cc] text-[#1d1d1f] hover:border-[#d4d0c5]"
                      }`}
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p
                        className={`text-xs mt-1 ${
                          riskTolerance === option.value
                            ? "text-[#1d1d1f]/70"
                            : "text-[#8a8a8a]"
                        }`}
                      >
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          id="section-preferences"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2"
          onFocusCapture={() => handleSectionFocus("preferences")}
        >
          <Card
            className={`bg-white rounded-3xl shadow-sm transition-all duration-200 ${
              statuses.preferences === "error"
                ? "border-l-[3px] border-l-[#ff3b30] border-solid"
                : "border-none"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <Bell size={20} strokeWidth={1.75} />
                Preferences
              </CardTitle>
              <SectionStatusIndicator
                status={statuses.preferences}
                onRetry={() => queueOrRun("preferences", savePreferences)}
              />
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <AccentColorPicker />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f1de]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e8e0cc] flex items-center justify-center">
                      <Bell size={18} strokeWidth={1.75} className="text-[#1d1d1f]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1d1d1f]">Email reminders</p>
                      <p className="text-xs text-[#8a8a8a]">
                        Monthly check-ins on your quit progress
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(setEmailReminders, !emailReminders, "emailReminders")}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      emailReminders ? "bg-[#1d1d1f]" : "bg-[#e8e0cc]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                        emailReminders ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f1de]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e8e0cc] flex items-center justify-center">
                      <Moon size={18} strokeWidth={1.75} className="text-[#1d1d1f]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1d1d1f]">Compact view</p>
                      <p className="text-xs text-[#8a8a8a]">
                        Show more info on each screen
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(setCompactMode, !compactMode, "compactMode")}
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

                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f1de]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e8e0cc] flex items-center justify-center">
                      <Coins size={18} strokeWidth={1.75} className="text-[#1d1d1f]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1d1d1f]">Currency</p>
                      <p className="text-xs text-[#8a8a8a]">
                        Display amounts in this currency
                      </p>
                    </div>
                  </div>
                  <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger className="w-28 bg-white border-[#e8e0cc] rounded-xl h-10">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="CHF">CHF (Fr)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="SEK">SEK (kr)</SelectItem>
                      <SelectItem value="NOK">NOK (kr)</SelectItem>
                      <SelectItem value="DKK">DKK (kr)</SelectItem>
                      <SelectItem value="PLN">PLN (zł)</SelectItem>
                    </SelectContent>
                  </Select>
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
