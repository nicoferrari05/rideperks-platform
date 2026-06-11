"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"

interface Props {
  onComplete: () => void
}

const CARDS = [
  { label: "COMBUSTIBLE", figure: "20%",  bg: "var(--sol)",        color: "var(--midnight)" },
  { label: "COMIDA",       figure: "$5",   bg: "var(--verde)",      color: "#fff" },
  { label: "TALLER",       figure: "15%",  bg: "var(--ember)",      color: "#fff" },
  { label: "SALUD",        figure: "10%",  bg: "var(--midnight-2)", color: "var(--bone)" },
]

const FROM = [
  { x: -420, y: -460, rotation: -42, scale: 0.75, autoAlpha: 0 },
  { x:  420, y: -420, rotation:  38, scale: 0.75, autoAlpha: 0 },
  { x: -400, y:  460, rotation:  22, scale: 0.75, autoAlpha: 0 },
  { x:  400, y:  440, rotation: -28, scale: 0.75, autoAlpha: 0 },
]

const REST = [
  { x: -14, y:  8, rotation: -10 },
  { x:  10, y: -5, rotation:   7 },
  { x:  -6, y: 10, rotation:  -4 },
  { x:   8, y: -4, rotation:   5 },
]

export default function SplashScreen({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const markRef      = useRef<HTMLDivElement>(null)
  const orbRef       = useRef<HTMLDivElement>(null)
  const innerRef     = useRef<HTMLDivElement>(null)
  const card0Ref     = useRef<HTMLDivElement>(null)
  const card1Ref     = useRef<HTMLDivElement>(null)
  const card2Ref     = useRef<HTMLDivElement>(null)
  const card3Ref     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cardEls = [card0Ref.current, card1Ref.current, card2Ref.current, card3Ref.current]
    const allEls  = [...cardEls, markRef.current, orbRef.current, innerRef.current]
    const mm      = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Center every element on the origin point via percentage offset
      gsap.set(allEls, { xPercent: -50, yPercent: -50 })

      // Initial hidden states
      gsap.set([orbRef.current, innerRef.current], { scale: 0, autoAlpha: 0 })

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
            duration: 0.72,
            ease: "expo.out",
          },
          i * 0.22
        )
      })

      // ── Cards recede ──
      tl.to(cardEls, {
        scale: 0.5,
        autoAlpha: 0,
        duration: 0.32,
        stagger: 0.05,
        ease: "power2.in",
      }, 1.7)

      // ── Glow orb erupts just before the mark appears ──
      tl.to(orbRef.current, {
        autoAlpha: 1, scale: 1,
        duration: 0.7, ease: "expo.out",
      }, 1.72)

      // ── Inner bright core blooms a beat later ──
      tl.to(innerRef.current, {
        autoAlpha: 1, scale: 1,
        duration: 0.45, ease: "expo.out",
      }, 1.77)

      // ── RP mark emerges through the light ──
      tl.fromTo(
        markRef.current,
        { scale: 0.78, autoAlpha: 0, y: 20 },
        { scale: 1,    autoAlpha: 1, y: 0,  duration: 0.55, ease: "expo.out" },
        1.8
      )

      // ── Orb settles to a calm ambient glow ──
      tl.to([orbRef.current, innerRef.current], {
        scale: 1.18, autoAlpha: 0.38,
        duration: 0.9, ease: "sine.out",
      }, 2.52)

      // ── Fade entire screen ──
      tl.to(containerRef.current, {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete,
      }, 3.1)
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
            <p style={{
              fontSize: "8px",
              letterSpacing: "0.15em",
              fontFamily: "var(--font-mono)",
              color: card.color,
              opacity: 0.65,
            }}>
              {card.label}
            </p>
            <p style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              fontFamily: "var(--font-geist)",
              color: card.color,
            }}>
              {card.figure}
            </p>
          </div>
        ))}

        {/* Main glow orb — large soft burst, ember-toned */}
        <div
          ref={orbRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,80,42,0.52) 0%, rgba(232,80,42,0.18) 42%, rgba(201,167,53,0.07) 62%, transparent 80%)",
            filter: "blur(24px)",
            zIndex: 9,
            pointerEvents: "none",
          }}
        />

        {/* Inner bright core — tighter white bloom over the mark center */}
        <div
          ref={innerRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.62) 0%, rgba(245,241,234,0.28) 38%, rgba(232,80,42,0.14) 62%, transparent 80%)",
            filter: "blur(10px)",
            zIndex: 9,
            pointerEvents: "none",
          }}
        />

        {/* RP mark — app icon style, sits above the light */}
        <div
          ref={markRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 10,
            opacity: 0,
            width: "120px",
            height: "120px",
            backgroundColor: "var(--midnight-2)",
            borderRadius: "26px",
            border: "1px solid rgba(245,241,234,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 24px 56px rgba(0,0,0,0.5)",
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              fontFamily: "var(--font-geist)",
              color: "var(--bone)",
              userSelect: "none",
            }}
          >
            RP
          </span>
        </div>
      </div>
    </div>
  )
}
