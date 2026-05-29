"use client"

import { useRef } from "react"
import type { ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

gsap.registerPlugin(useGSAP)

interface Props {
  children: ReactNode
  selector?: string
  stagger?: number
  delay?: number
  y?: number
  duration?: number
}

export default function StaggerEntrance({
  children,
  selector = "[data-stagger]",
  stagger = 0.05,
  delay = 0,
  y = 12,
  duration = 0.26,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(selector, {
          autoAlpha: 0, y, duration, stagger, delay, ease: "power2.out",
        })
      })
      return () => mm.revert()
    },
    { scope: containerRef }
  )

  return <div ref={containerRef}>{children}</div>
}
