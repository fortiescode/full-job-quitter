"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Loader2, Mail, Lock, User } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signUp, signIn, signInWithMagicLink } from "@/lib/auth/actions"
import { authSchema, type AuthInput } from "@/lib/auth/schema"

type AuthMode = "sign-in" | "sign-up" | "magic-link"

interface AuthFormProps {
  defaultMode?: AuthMode
}

export function AuthForm({ defaultMode = "sign-in" }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const [serverError, setServerError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const isSignUp = mode === "sign-up"
  const isMagicLink = mode === "magic-link"

  const schema = useMemo(
    () =>
      authSchema.superRefine((data, ctx) => {
        if (mode === "sign-up") {
          if (!data.fullName || data.fullName.length < 2) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Name must be at least 2 characters",
              path: ["fullName"],
            })
          }
          if (!data.password || data.password.length < 8) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Password must be at least 8 characters",
              path: ["password"],
            })
          }
        } else if (mode === "sign-in") {
          if (!data.password || data.password.length < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Password is required",
              path: ["password"],
            })
          }
        }
      }),
    [mode]
  )

  const form = useForm<AuthInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  async function onSubmit(values: AuthInput) {
    setServerError(null)
    setIsPending(true)

    let result
    if (isSignUp) {
      result = await signUp({
        email: values.email,
        password: values.password ?? "",
        fullName: values.fullName ?? "",
      })
    } else if (isMagicLink) {
      result = await signInWithMagicLink({ email: values.email })
      if (result?.success) {
        setMagicLinkSent(true)
      }
    } else {
      result = await signIn({
        email: values.email,
        password: values.password ?? "",
      })
    }

    if (result?.error) {
      setServerError(result.error)
    }

    setIsPending(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-md"
    >
      <Card className="bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1 text-center p-8">
          <div className="flex justify-center mb-2">
            <Image
              src="/fjq-logo.png"
              alt="full-jog-quitter logo"
              width={94}
              height={94}
              className="h-23.5 w-auto"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-[#1d1d1f] ">
            {isSignUp
              ? "Create your account"
              : isMagicLink
              ? "Magic link sign in"
              : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-[#8a8a8a]">
            {isSignUp
              ? "Start planning your exit today."
              : isMagicLink
              ? "We'll send a sign-in link to your email."
              : "Sign in to continue your journey."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="fullName"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="fullName" className="text-[#1d1d1f] ">
                    Full name
                  </Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]"
                      size={18}
                      strokeWidth={1.75}
                    />
                    <Controller
                      name="fullName"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Jane Doe"
                          disabled={isPending}
                          {...field}
                          className="pl-10 h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5"
                        />
                      )}
                    />
                  </div>
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-[#ff3b30]">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1d1d1f] ">
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]"
                  size={18}
                  strokeWidth={1.75}
                />
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      disabled={isPending}
                      {...field}
                      className="pl-10 h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5"
                    />
                  )}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-[#ff3b30]">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {!isMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#1d1d1f] ">
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]"
                    size={18}
                    strokeWidth={1.75}
                  />
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        disabled={isPending}
                        {...field}
                        className="pl-10 h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-white/60 dark:bg-white/5"
                      />
                    )}
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-[#ff3b30]">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            )}

            {serverError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#ff3b30]"
              >
                {serverError}
              </motion.p>
            )}

            {magicLinkSent && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#34c759]"
              >
                Check your inbox for the magic link.
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white font-medium"
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={20} strokeWidth={1.75} />
              ) : isSignUp ? (
                "Create account"
              ) : isMagicLink ? (
                "Send magic link"
              ) : (
                "Sign in"
              )}
              {!isPending && <ArrowRight size={18} strokeWidth={1.75} className="ml-2" />}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-8 pt-0">
          <div className="text-sm text-[#8a8a8a]">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("sign-in")}
                  className="text-[#f5c542] hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            ) : isMagicLink ? (
              <>
                Prefer a password?{" "}
                <button
                  type="button"
                  onClick={() => setMode("sign-in")}
                  className="text-[#f5c542] hover:underline font-medium"
                >
                  Sign in with password
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("sign-up")}
                  className="text-[#f5c542] hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {!isMagicLink && (
            <button
              type="button"
              onClick={() => setMode("magic-link")}
              className="text-sm text-[#8a8a8a] hover:text-[#f5c542] transition-colors"
            >
              Sign in with magic link
            </button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
