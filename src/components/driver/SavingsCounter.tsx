"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

gsap.registerPlugin(useGSAP)

interface Props {
  value: number
  color: string
}

export default function SavingsCounter({ value, color }: Props) {
  const numRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (value <= 0) return
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { val: 0 }
        gsap.to(counter, {
          val: value,
          duration: 1.4,
          delay: 0.4,
          ease: "power2.out",
          onUpdate() {
            if (numRef.current) {
              numRef.current.textContent = counter.val.toFixed(2)
            }
          },
        })
      })
      return () => mm.revert()
    },
    { scope: numRef }
  )

  return (
    <p
      className="font-bold font-mono-brand leading-none mb-1"
      style={{ fontSize: "52px", letterSpacing: "-0.03em", color, fontVariantNumeric: "tabular-nums" }}
    >
      {/* Currency symbol set smaller and lighter than the figure — the number is the news */}
      <span style={{ fontSize: "0.55em", fontWeight: 600, opacity: 0.55, marginRight: "2px", verticalAlign: "0.32em" }}>
        $
      </span>
      <span ref={numRef}>{value.toFixed(2)}</span>
    </p>
  )
}
