"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import SplashScreen from "@/components/shared/SplashScreen"
import OnboardingSlides from "@/components/shared/OnboardingSlides"
import { createClient } from "@/lib/supabase/client"

type Phase = "splash" | "onboarding" | "done"

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("splash")
  const router = useRouter()

  const handleSplashComplete = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      router.replace("/driver/dashboard")
      return
    }

    const seen = localStorage.getItem("rp_onboarded")
    if (seen) {
      router.replace("/login")
    } else {
      setPhase("onboarding")
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

  if (phase === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (phase === "onboarding") {
    return <OnboardingSlides onRegister={handleRegister} onLogin={handleLogin} />
  }

  return null
}
