"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP)

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizes = {
  sm: "px-3 py-1.5 text-base",
  md: "px-4 py-2 text-xl",
  lg: "px-6 py-3 text-2xl",
  xl: "px-8 py-4 text-4xl",
}

const LETTERS = "RIDEPERKS".split("")

export default function Logo({ size = "md", className }: LogoProps) {
  const pillRef = useRef<HTMLDivElement>(null)
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([])

  useGSAP(() => {
    const letters = lettersRef.current.filter(Boolean)

    gsap.set(pillRef.current, { autoAlpha: 0, scale: 0.86 })
    gsap.set(letters, { autoAlpha: 0, y: 6 })

    gsap.timeline()
      // B — pill blooms in
      .to(pillRef.current, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: "expo.out",
      })
      // C — letters stagger up, overlapping with tail of bloom
      .to(letters, {
        autoAlpha: 1,
        y: 0,
        duration: 0.38,
        ease: "expo.out",
        stagger: 0.04,
      }, 0.12)
  }, { scope: pillRef })

  return (
    <div
      ref={pillRef}
      className={cn(
        "inline-flex items-center rounded-full font-extrabold tracking-tight select-none",
        sizes[size],
        className
      )}
      style={{
        background: "linear-gradient(135deg, rgba(245,241,234,0.11) 0%, rgba(245,241,234,0.05) 100%)",
        backdropFilter: "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: "blur(16px) saturate(1.6)",
        border: "1px solid rgba(245,241,234,0.14)",
        boxShadow: "inset 0 1.5px 0 rgba(245,241,234,0.13), inset 0 -1px 0 rgba(245,241,234,0.04), 0 4px 20px rgba(0,0,0,0.28)",
        color: "var(--bone)",
      }}
    >
      {LETTERS.map((char, i) => (
        <span
          key={i}
          ref={el => { lettersRef.current[i] = el }}
          style={{ display: "inline-block" }}
        >
          {char}
        </span>
      ))}
    </div>
  )
}
