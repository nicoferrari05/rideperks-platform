"use client"

import { useEffect } from "react"

// Production-only registration of the conservative service worker
// (public/sw.js). See MOBILE_GUIDELINES.md §7 for the caching policy.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failing must never affect the app.
    })
  }, [])

  return null
}
