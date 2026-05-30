"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"

interface Props {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline()
        .fromTo(
          markRef.current,
          { scale: 0.85, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.55, ease: "power3.out" }
        )
        .to(markRef.current, { duration: 0.5 })
        .to(containerRef.current, {
          autoAlpha: 0,
          duration: 0.25,
          ease: "power2.out",
          onComplete,
        })
    })

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const t = setTimeout(onComplete, 400)
      return () => clearTimeout(t)
    })

    return () => mm.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "var(--midnight)" }}
    >
      <div
        ref={markRef}
        className="flex flex-col items-center"
        style={{ gap: "10px" }}
      >
        <div
          style={{
            fontSize: "88px",
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            fontFamily: "var(--font-geist)",
          }}
        >
          <span style={{ color: "var(--bone)" }}>R</span>
          <span style={{ color: "var(--ember)" }}>P</span>
        </div>
        <p
          style={{
            color: "var(--bone)",
            opacity: 0.35,
            fontSize: "10px",
            letterSpacing: "0.22em",
            fontFamily: "var(--font-mono)",
          }}
        >
          RIDEPERKS
        </p>
      </div>
    </div>
  )
}
