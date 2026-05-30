"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"

interface Props {
  onComplete: () => void
}

const CARDS = [
  { label: "COMBUSTIBLE", figure: "20%",  bg: "var(--sol)",       color: "var(--midnight)" },
  { label: "COMIDA",       figure: "B/.5", bg: "var(--verde)",     color: "#fff" },
  { label: "TALLER",       figure: "15%",  bg: "var(--ember)",     color: "#fff" },
  { label: "SALUD",        figure: "10%",  bg: "var(--midnight-2)", color: "var(--bone)" },
]

// Starting positions — each from a different corner, fully off-screen
const FROM = [
  { x: -420, y: -460, rotation: -42, scale: 0.75, autoAlpha: 0 },
  { x:  420, y: -420, rotation:  38, scale: 0.75, autoAlpha: 0 },
  { x: -400, y:  460, rotation:  22, scale: 0.75, autoAlpha: 0 },
  { x:  400, y:  440, rotation: -28, scale: 0.75, autoAlpha: 0 },
]

// Resting positions — stacked near center, slight rotation = physical deck
const REST = [
  { x: -14, y:  8, rotation: -10 },
  { x:  10, y: -5, rotation:   7 },
  { x:  -6, y: 10, rotation:  -4 },
  { x:   8, y: -4, rotation:   5 },
]

export default function SplashScreen({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const markRef      = useRef<HTMLDivElement>(null)
  const card0Ref     = useRef<HTMLDivElement>(null)
  const card1Ref     = useRef<HTMLDivElement>(null)
  const card2Ref     = useRef<HTMLDivElement>(null)
  const card3Ref     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cardEls = [card0Ref.current, card1Ref.current, card2Ref.current, card3Ref.current]
    const allEls  = [...cardEls, markRef.current]
    const mm      = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Center every element on the origin point via percentage offset
      gsap.set(allEls, { xPercent: -50, yPercent: -50 })

      const tl = gsap.timeline()

      // ── Cards converge from corners ──
      cardEls.forEach((el, i) => {
        tl.fromTo(
          el,
          FROM[i],
          {
            x: REST[i].x,
            y: REST[i].y,
            rotation: REST[i].rotation,
            scale: 1,
            autoAlpha: 1,
            duration: 0.55,
            ease: "expo.out",
          },
          i * 0.13   // absolute start time — each card 130ms after the previous
        )
      })

      // ── Cards recede — scale down + fade, bottom card first ──
      tl.to(cardEls, {
        scale: 0.5,
        autoAlpha: 0,
        duration: 0.26,
        stagger: 0.04,
        ease: "power2.in",
      }, 1.06)

      // ── RP mark emerges while last cards are still fading ──
      tl.fromTo(
        markRef.current,
        { scale: 0.78, autoAlpha: 0, y: 20 },
        { scale: 1,    autoAlpha: 1, y: 0,  duration: 0.52, ease: "expo.out" },
        1.14
      )

      // ── Fade entire screen ──
      tl.to(containerRef.current, {
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.out",
        onComplete,
      }, 2.24)
    })

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const t = setTimeout(onComplete, 500)
      return () => clearTimeout(t)
    })

    return () => mm.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cardRefs = [card0Ref, card1Ref, card2Ref, card3Ref]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ backgroundColor: "var(--midnight)" }}
    >
      {/* Ambient ember glow — top-right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-15%",
          right: "-20%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(circle, rgba(232,80,42,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Origin point — centered in viewport; all animated children live here */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0 }}
      >
        {/* Benefit cards */}
        {CARDS.map((card, i) => (
          <div
            key={i}
            ref={cardRefs[i]}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "148px",
              height: "100px",
              backgroundColor: card.bg,
              borderRadius: "16px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              zIndex: i + 1,
              boxShadow: "0 16px 40px rgba(0,0,0,0.45), 0 4px 10px rgba(0,0,0,0.25)",
              opacity: 0,
              willChange: "transform, opacity",
              border: i === 3 ? "1px solid rgba(245,241,234,0.12)" : "none",
            }}
          >
            <p
              style={{
                fontSize: "8px",
                letterSpacing: "0.15em",
                fontFamily: "var(--font-mono)",
                color: card.color,
                opacity: 0.65,
              }}
            >
              {card.label}
            </p>
            <p
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                fontFamily: "var(--font-geist)",
                color: card.color,
              }}
            >
              {card.figure}
            </p>
          </div>
        ))}

        {/* RP mark */}
        <div
          ref={markRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 10,
            opacity: 0,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              letterSpacing: "-0.06em",
              lineHeight: 1,
              fontFamily: "var(--font-geist)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--bone)" }}>R</span>
            <span style={{ color: "var(--ember)" }}>P</span>
          </div>
          <p
            style={{
              color: "var(--bone)",
              opacity: 0.3,
              fontSize: "10px",
              letterSpacing: "0.22em",
              fontFamily: "var(--font-mono)",
              marginTop: "10px",
            }}
          >
            RIDEPERKS
          </p>
        </div>
      </div>
    </div>
  )
}
