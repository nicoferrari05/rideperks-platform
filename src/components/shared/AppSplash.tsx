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
        // Explicit height (not just inset:0) — iOS Safari's fixed-position
        // containing block can come up short of the true bottom edge under
        // viewport-fit:cover; height:100dvh forces full coverage regardless.
        style={{ backgroundColor: "#0F1B3D", height: "100dvh", width: "100vw" }}
      />
    )
  }

  if (phase === "done") return null

  return <SplashScreen onComplete={handleComplete} />
}
