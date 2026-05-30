"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import OnboardingSlides from "@/components/shared/OnboardingSlides"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    // Kick off auth check immediately so it resolves in parallel with the splash
    const supabase = createClient()
    const authPromise = supabase.auth.getSession()

    async function startFlow() {
      if (cancelled) return

      const { data: { session } } = await authPromise
      if (cancelled) return

      if (session) {
        router.replace("/driver/dashboard")
        return
      }

      const seen = localStorage.getItem("rp_onboarded")
      if (seen) {
        router.replace("/login")
        return
      }

      setShowOnboarding(true)
    }

    // If the splash already fired this session, proceed immediately.
    // Otherwise wait for the layout-level AppSplash to signal completion.
    if (sessionStorage.getItem("rp_splashed")) {
      startFlow()
    } else {
      window.addEventListener("rp:splash-complete", startFlow, { once: true })
    }

    return () => {
      cancelled = true
      window.removeEventListener("rp:splash-complete", startFlow)
    }
  }, [router])

  const handleRegister = useCallback(() => {
    localStorage.setItem("rp_onboarded", "1")
    router.push("/register")
  }, [router])

  const handleLogin = useCallback(() => {
    localStorage.setItem("rp_onboarded", "1")
    router.push("/login")
  }, [router])

  if (!showOnboarding) return null

  return <OnboardingSlides onRegister={handleRegister} onLogin={handleLogin} />
}
