/*
 * RidePerks service worker — deliberately conservative.
 *
 * Policy (see MOBILE_GUIDELINES.md §7):
 *  - Navigations are ALWAYS network-first; the only fallback is /offline.
 *    No HTML is ever served stale.
 *  - Cache-first only for immutable build assets (/_next/static/).
 *  - Never touches: cross-origin requests (Supabase, Yappy CDN, map tiles),
 *    /api/*, or any non-GET request.
 *  - To invalidate everything, bump CACHE_VERSION and deploy.
 */
const CACHE_VERSION = "rideperks-v1"
const OFFLINE_URL = "/offline"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/")) return

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)))
    return
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
  }
  // Anything else: let the network handle it untouched.
})
