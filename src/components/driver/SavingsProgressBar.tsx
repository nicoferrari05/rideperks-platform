"use client"

import { useState, useEffect } from "react"
import { motion, useSpring, useMotionValueEvent, useReducedMotion } from "framer-motion"

interface Props {
  current: number
  max: number
  variant?: "full" | "mini"
  monthLabel?: string
}

function GlassBar({
  value,
  color,
  gradient,
  animated,
  trackBg,
  height,
}: {
  value: number
  color: string
  gradient: string
  animated: boolean
  trackBg: string
  height: string
}) {
  const prefersReduced = useReducedMotion()
  const glowAlpha = Math.round(40 + value * 0.4).toString(16).padStart(2, "0")
  const glowSize = 4 + value * 0.08

  const fillTransition = prefersReduced
    ? { duration: 0.3 }
    : { type: "spring" as const, stiffness: 200, damping: 24 }

  const pulseAnimate =
    animated && !prefersReduced
      ? { width: `${value}%`, opacity: [0.85, 1, 0.85] as number[] }
      : { width: `${value}%` }

  const pulseTransition =
    animated && !prefersReduced
      ? {
          width: fillTransition,
          opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
        }
      : fillTransition

  return (
    <div
      className="relative overflow-hidden rounded-full"
      style={{ height, backgroundColor: trackBg }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${gradient})`,
          filter: `drop-shadow(0 0 ${glowSize}px ${color}${glowAlpha})`,
        }}
        initial={{ width: "0%" }}
        animate={pulseAnimate}
        transition={pulseTransition}
      />
    </div>
  )
}

export default function SavingsProgressBar({ current, max, variant = "full", monthLabel }: Props) {
  const pct      = max > 0 ? Math.min((current / max) * 100, 100) : 0
  const done     = pct >= 100
  const color    = done ? "#2F8F6E" : "#E8502A"
  const gradient = done ? "#2F8F6E, #06D6A0" : "#E8502A, #FF7043"

  const springValue = useSpring(0, { stiffness: 80, damping: 20 })
  const [displayPercent, setDisplayPercent] = useState(0)

  useEffect(() => { springValue.set(pct) }, [pct, springValue])
  useMotionValueEvent(springValue, "change", (latest) => {
    setDisplayPercent(Math.round(latest))
  })

  if (variant === "mini") {
    return (
      <div className="flex items-center gap-3">
        <div style={{ flex: 1 }}>
          <GlassBar
            value={pct} color={color} gradient={gradient}
            animated={false} trackBg="var(--bone-2)" height="4px"
          />
        </div>
        <p className="font-mono-brand flex-shrink-0" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.02em" }}>
          ${current.toFixed(0)} / ${max.toFixed(0)}
        </p>
      </div>
    )
  }

  return (
    <div>
      <GlassBar
        value={pct} color={color} gradient={gradient}
        animated trackBg="rgba(245,241,234,0.1)" height="8px"
      />
      <div className="flex items-center justify-between mt-2">
        <p style={{ fontSize: "11px", color: "rgba(245,241,234,0.5)" }}>
          {current > 0
            ? `$${current.toFixed(2)} ahorrado${monthLabel ? ` en ${monthLabel.toLowerCase()}` : ""}`
            : `Potencial: $${max.toFixed(2)} este mes`}
        </p>
        <p style={{ fontSize: "11px", color: done ? "rgba(47,143,110,0.8)" : "rgba(245,241,234,0.35)" }}>
          {done ? "¡Meta completada! 🎉" : `${displayPercent}%`}
        </p>
      </div>
    </div>
  )
}
