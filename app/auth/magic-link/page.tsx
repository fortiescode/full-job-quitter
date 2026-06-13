import { AuthForm } from "@/components/auth/auth-form"

export default function MagicLinkPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#f5f5f7] dark:bg-black">
      <AuthForm defaultMode="magic-link" />
    </main>
  )
}
