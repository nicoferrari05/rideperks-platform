"use client"

import { useState, useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Copy, Check, Share2 } from "lucide-react"

gsap.registerPlugin(useGSAP)

interface Props {
  code: string
  referralCount: number
}

const GOAL = 3
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)"

export default function ReferralCard({ code, referralCount }: Props) {
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([])
  const shimmerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // A: filled segments sweep in from left
    const filled = segmentRefs.current.slice(0, referralCount).filter(Boolean)
    const empty  = segmentRefs.current.slice(referralCount).filter(Boolean)

    if (filled.length > 0) {
      gsap.fromTo(filled,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.45, stagger: 0.1, ease: "expo.out", delay: 0.25 }
      )
    }

    // A: empty segments breathe in a loop
    if (empty.length > 0) {
      gsap.to(empty, {
        opacity: 0.3,
        duration: 1.1,
        stagger: 0.18,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 0.9,
      })
    }

    // C: CTA shimmer sweeps every ~5 s
    if (shimmerRef.current) {
      gsap.timeline({ repeat: -1, repeatDelay: 4.5 })
        .fromTo(shimmerRef.current,
          { xPercent: -130 },
          { xPercent: 310, duration: 0.75, ease: "power2.inOut" }
        )
    }
  }, { scope: containerRef })

  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const text = encodeURIComponent(
      `¡Oye! Únete a RidePerks y ahorra en combustible, taller, comida y más. Usa mi código *${code}* al registrarte 👇\n${baseUrl}/join?ref=${code}`
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const done      = referralCount >= GOAL
  const remaining = Math.max(GOAL - referralCount, 0)

  return (
    <div
      ref={containerRef}
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
    >
      <div className="px-5 pt-4 pb-2">
        <p className="eyebrow-muted">REFERIDOS</p>
      </div>

      {/* Code row */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <div>
          <p
            className="font-mono-brand"
            style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--mute)" }}
          >
            TU CÓDIGO
          </p>
          <p
            className="font-bold mt-0.5"
            style={{
              fontSize: "22px",
              letterSpacing: "0.06em",
              color: "var(--midnight)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {code}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="pressable flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{
            backgroundColor: copied ? "rgba(47,143,110,0.10)" : "var(--bone-2)",
            color: copied ? "var(--verde)" : "var(--midnight)",
            transition: `background-color 200ms ${EASE}, color 200ms ${EASE}`,
          }}
        >
          {copied
            ? <Check className="w-3.5 h-3.5" />
            : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      {/* Progress */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: "var(--midnight)" }}>
            {done ? "¡Meta alcanzada!" : `${referralCount} de ${GOAL} conductores referidos`}
          </p>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: done ? "rgba(47,143,110,0.10)" : "var(--ember-soft)",
              color: done ? "var(--verde)" : "var(--ember)",
            }}
          >
            {done ? "Listo" : `Faltan ${remaining}`}
          </span>
        </div>

        {/* Progress segments */}
        <div className="flex gap-1.5">
          {Array.from({ length: GOAL }).map((_, i) => (
            <div
              key={i}
              ref={el => { segmentRefs.current[i] = el }}
              style={{
                flex: 1,
                height: "5px",
                borderRadius: "999px",
                backgroundColor: i < referralCount ? "var(--ember)" : "var(--bone-2)",
              }}
            />
          ))}
        </div>

        <p className="text-xs mt-3" style={{ color: "var(--mute)", lineHeight: 1.5 }}>
          Invita a {GOAL} conductores que se unan y paguen su membresía — te ganas un tanque lleno.
        </p>
      </div>

      {/* Share CTA */}
      <div
        className="px-5 pb-5"
        style={{ borderTop: "1px solid var(--line)", paddingTop: "14px" }}
      >
        <button
          onClick={handleShare}
          className="pressable w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: "var(--midnight)",
            color: "var(--bone)",
          }}
        >
          <Share2 className="w-4 h-4" />
          Invitar por WhatsApp
          {/* C: shimmer overlay */}
          <div
            ref={shimmerRef}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "45%",
              background: "linear-gradient(90deg, transparent, rgba(245,241,234,0.13), transparent)",
              pointerEvents: "none",
            }}
          />
        </button>
      </div>
    </div>
  )
}
