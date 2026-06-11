"use client"

import { useEffect, useState } from "react"
import { Car } from "lucide-react"

interface Props {
  current: number
  max: number
  variant?: "full" | "mini"
  monthLabel?: string
}

export default function SavingsProgressBar({ current, max, variant = "full", monthLabel }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  const pct   = max > 0 ? Math.min((current / max) * 100, 100) : 0
  const live  = ready ? pct : 0
  const done  = pct >= 100
  const color = done ? "var(--verde)" : "var(--ember)"
  const shadowColor = done ? "rgba(47,143,110,0.65)" : "rgba(232,80,42,0.65)"

  if (variant === "mini") {
    return (
      <div className="flex items-center gap-3">
        {/* Bar + car */}
        <div style={{ flex: 1, position: "relative", height: "20px" }}>
          {/* Track — vertically centered */}
          <div style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: "var(--bone-2)",
            borderRadius: "999px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${live}%`,
              backgroundColor: color,
              borderRadius: "999px",
              transition: "width 900ms cubic-bezier(0.23, 1, 0.32, 1)",
            }} />
          </div>
          {/* Car at the tip of the fill, ON the bar */}
          <Car
            style={{
              position: "absolute",
              top: "50%",
              left: `${live}%`,
              transform: "translateX(-50%) translateY(-50%) perspective(80px) rotateY(-20deg)",
              transition: "left 900ms cubic-bezier(0.23, 1, 0.32, 1)",
              color,
              width: "16px",
              height: "16px",
              filter: `drop-shadow(0px 1px 3px ${shadowColor})`,
            }}
          />
        </div>
        {/* Label */}
        <p className="font-mono-brand" style={{
          fontSize: "11px",
          color: "var(--mute)",
          flexShrink: 0,
          letterSpacing: "0.02em",
        }}>
          ${current.toFixed(0)} / ${max.toFixed(0)}
        </p>
      </div>
    )
  }

  // Full variant — dark background (DashboardHero)
  return (
    <div>
      <div style={{ position: "relative", height: "26px" }}>
        {/* Track — vertically centered */}
        <div style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: 0,
          right: 0,
          height: "6px",
          backgroundColor: "rgba(245,241,234,0.1)",
          borderRadius: "999px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${live}%`,
            backgroundColor: color,
            borderRadius: "999px",
            transition: "width 1000ms cubic-bezier(0.23, 1, 0.32, 1)",
          }} />
        </div>
        {/* Car at the tip of the fill, ON the bar */}
        <Car
          style={{
            position: "absolute",
            top: "50%",
            left: `${live}%`,
            transform: "translateX(-50%) translateY(-50%) perspective(80px) rotateY(-20deg)",
            transition: "left 1000ms cubic-bezier(0.23, 1, 0.32, 1)",
            color,
            width: "22px",
            height: "22px",
            filter: `drop-shadow(0px 2px 4px ${shadowColor})`,
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p style={{ fontSize: "11px", color: "rgba(245,241,234,0.5)" }}>
          {current > 0
            ? `$${current.toFixed(2)} ahorrado${monthLabel ? ` en ${monthLabel.toLowerCase()}` : ""}`
            : `Potencial: $${max.toFixed(2)} este mes`}
        </p>
        <p style={{ fontSize: "11px", color: "rgba(245,241,234,0.35)" }}>
          {done ? "¡Meta completada! 🎉" : `$${(max - current).toFixed(2)} disponibles`}
        </p>
      </div>
    </div>
  )
}
