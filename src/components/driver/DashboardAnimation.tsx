"use client"

import { useRef } from "react"
import type { ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

gsap.registerPlugin(useGSAP)

export default function DashboardAnimation({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-animate='greeting']", {
          autoAlpha: 0, y: 14, duration: 0.28, ease: "power3.out",
        })
        gsap.from("[data-animate='hero']", {
          autoAlpha: 0, y: 20, scale: 0.97, duration: 0.32, delay: 0.06, ease: "power3.out",
        })
        gsap.from("[data-animate='row']", {
          autoAlpha: 0, y: 10, duration: 0.22, stagger: 0.05, delay: 0.14, ease: "power2.out",
        })
      })
      return () => mm.revert()
    },
    { scope: containerRef }
  )

  return <div ref={containerRef}>{children}</div>
}
