"use client"

import { usePathname } from "next/navigation"

// Only the splash/auth screens need this — /driver and /admin have their
// own nav bars that already handle the safe-area top themselves.
const EXCLUDED_PREFIXES = ["/driver", "/admin"]

export default function StatusBarStrip() {
  const pathname = usePathname()
  if (EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p))) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "env(safe-area-inset-top, 0px)",
        backgroundColor: "var(--midnight)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  )
}
