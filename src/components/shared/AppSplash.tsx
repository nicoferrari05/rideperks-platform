"use client"

import { useState, useEffect } from "react"
import SplashScreen from "./SplashScreen"

type Phase = "pending" | "animating" | "done"

export default function AppSplash() {
  const [phase, setPhase] = useState<Phase>("pending")

  useEffect(() => {
    const shown = sessionStorage.getItem("rp_splashed")
    setPhase(shown ? "done" : "animating")
  }, [])

  function handleComplete() {
    sessionStorage.setItem("rp_splashed", "1")
    setPhase("done")
    window.dispatchEvent(new CustomEvent("rp:splash-complete"))
  }

  // "pending" = SSR / first paint — midnight overlay prevents any flash of content
  if (phase === "pending") {
    return (
      <div
        className="fixed inset-0 z-[9999]"
        style={{ backgroundColor: "var(--midnight)" }}
      />
    )
  }

  if (phase === "done") return null

  return <SplashScreen onComplete={handleComplete} />
}
