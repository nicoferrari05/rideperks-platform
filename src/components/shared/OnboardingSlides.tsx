"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import gsap from "gsap"
import { ChevronRight, ChevronLeft } from "lucide-react"

interface Props {
  onRegister: () => void
  onLogin: () => void
}

const benefits = [
  { label: "COMBUSTIBLE", figure: "20%", bg: "var(--sol)", color: "var(--midnight)" },
  { label: "COMIDA", figure: "$5", bg: "var(--verde)", color: "#fff" },
  { label: "TALLER", figure: "15%", bg: "var(--ember)", color: "#fff" },
  { label: "SALUD", figure: "10%", bg: "var(--midnight)", color: "var(--bone)" },
]

const steps = [
  { n: "01", title: "Regístrate", desc: "Crea tu cuenta con tu foto de perfil de conductor." },
  { n: "02", title: "Activa tu membresía", desc: "Activamos tu cuenta de inmediato." },
  { n: "03", title: "Muestra tu QR", desc: "El empleado lo escanea. Descuento aplicado al instante." },
]

const SPRING = { type: "spring", stiffness: 280, damping: 28 } as const

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
  }),
}

export default function OnboardingSlides({ onRegister, onLogin }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [hasPointer, setHasPointer] = useState(false)
  const slideRef = useRef<HTMLDivElement>(null)

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false

  useEffect(() => {
    setHasPointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goTo(Math.min(current + 1, 2))
      if (e.key === "ArrowLeft") goTo(Math.max(current - 1, 0))
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  function goTo(index: number) {
    if (index < 0 || index > 2 || index === current) return
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x < -60 || info.velocity.x < -300) goTo(current + 1)
    else if (info.offset.x > 60 || info.velocity.x > 300) goTo(current - 1)
  }

  function handleSlideEntered() {
    if (!slideRef.current || prefersReducedMotion) return
    const elements = slideRef.current.querySelectorAll<HTMLElement>("[data-enter]")
    if (!elements.length) return
    gsap.set(elements, { autoAlpha: 0, y: 10 })
    setTimeout(() => {
      gsap.to(elements, {
        autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.055, ease: "power2.out",
      })
    }, current === 0 ? 50 : 80)
  }

  const isLightSlide = current === 1

  const contentStyle: React.CSSProperties = {
    maxWidth: "480px",
    width: "100%",
    margin: "0 auto",
    paddingLeft: "clamp(24px, 6.5vw, 48px)",
    paddingRight: "clamp(24px, 6.5vw, 48px)",
  }

  // ── Slide 0: Welcome ──
  const slide0 = (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "var(--midnight)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 0 120px",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: "-8%", right: "-8%",
          width: "52%", height: "28%",
          backgroundColor: "var(--ember)", borderRadius: "50%",
          filter: "blur(72px)", opacity: 0.28, pointerEvents: "none",
        }}
      />
      <div style={{ ...contentStyle, position: "relative" }}>
        <p data-enter style={{ color: "var(--ember)", fontSize: "clamp(10px, 1.1vw, 13px)", letterSpacing: "0.18em", fontFamily: "var(--font-mono)", marginBottom: "28px", opacity: 0 }}>
          CLUB DE CONDUCTORES · PANAMÁ
        </p>
        <h1 data-enter style={{ fontWeight: 800, fontSize: "clamp(48px, 7vw, 80px)", letterSpacing: "-0.04em", lineHeight: 0.95, color: "var(--bone)", marginBottom: "24px", fontFamily: "var(--font-geist)", opacity: 0 }}>
          Tu trabajo<br />
          rinde{" "}
          <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--ember)", fontFamily: "var(--font-fraunces)" }}>
            más.
          </em>
        </h1>
        <p data-enter style={{ color: "rgba(245,241,234,0.5)", fontSize: "clamp(16px, 1.4vw, 20px)", lineHeight: 1.55, opacity: 0 }}>
          Beneficios en combustible, comida y talleres — negociados para conductores activos en Panamá.
        </p>
      </div>
    </div>
  )

  // ── Slide 1: Benefits ──
  const slide1 = (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "var(--bone)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 0 120px",
      }}
    >
      <div style={contentStyle}>
        <p data-enter style={{ color: "var(--ember)", fontSize: "clamp(10px, 1.1vw, 13px)", letterSpacing: "0.18em", fontFamily: "var(--font-mono)", marginBottom: "16px", opacity: 0 }}>
          BENEFICIOS
        </p>
        <h2 data-enter style={{ fontWeight: 800, fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.0, color: "var(--midnight)", marginBottom: "28px", fontFamily: "var(--font-geist)", opacity: 0 }}>
          Una membresía.<br />Todo incluido.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {benefits.map((b, i) => (
            <div key={i} data-enter style={{ backgroundColor: b.bg, color: b.color, borderRadius: "16px", padding: "clamp(16px, 2vw, 24px)", opacity: 0 }}>
              <p style={{ fontSize: "clamp(9px, 0.9vw, 11px)", letterSpacing: "0.12em", opacity: 0.65, marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
                {b.label}
              </p>
              <p style={{ fontSize: "clamp(32px, 3.5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "var(--font-geist)" }}>
                {b.figure}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Slide 2: How it works + CTA ──
  const slide2 = (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "var(--midnight)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ ...contentStyle, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "80px", paddingBottom: "24px" }}>
        <p data-enter style={{ color: "var(--ember)", fontSize: "clamp(10px, 1.1vw, 13px)", letterSpacing: "0.18em", fontFamily: "var(--font-mono)", marginBottom: "28px", opacity: 0 }}>
          TRES PASOS
        </p>
        {steps.map((s) => (
          <div key={s.n} data-enter style={{ display: "flex", gap: "20px", marginBottom: "28px", alignItems: "flex-start", opacity: 0 }}>
            <span style={{ color: "var(--ember)", fontFamily: "var(--font-mono)", fontSize: "clamp(11px, 1vw, 13px)", letterSpacing: "0.06em", fontWeight: 600, paddingTop: "2px", flexShrink: 0 }}>
              {s.n}
            </span>
            <div>
              <p style={{ color: "var(--bone)", fontWeight: 600, fontSize: "clamp(15px, 1.4vw, 19px)", marginBottom: "4px" }}>
                {s.title}
              </p>
              <p style={{ color: "rgba(245,241,234,0.45)", fontSize: "clamp(13px, 1.2vw, 16px)", lineHeight: 1.55 }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div data-enter style={{ ...contentStyle, paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 40px), 56px)", display: "flex", flexDirection: "column", gap: "12px", opacity: 0 }}>
        <button
          onClick={onRegister}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "var(--ember)", color: "#fff", borderRadius: "9999px", padding: "clamp(14px, 1.4vw, 18px) 24px", fontWeight: 600, fontSize: "clamp(16px, 1.3vw, 18px)", border: "none", cursor: "pointer", fontFamily: "var(--font-geist)", width: "100%" }}
        >
          Quiero mis beneficios
          <ChevronRight style={{ width: "18px", height: "18px", flexShrink: 0 }} />
        </button>
        <button
          onClick={onLogin}
          style={{ color: "rgba(245,241,234,0.45)", fontSize: "clamp(14px, 1.2vw, 16px)", textAlign: "center", border: "none", background: "none", cursor: "pointer", padding: "10px", fontFamily: "var(--font-geist)" }}
        >
          Ya tengo cuenta, ingresar
        </button>
      </div>
    </div>
  )

  const slides = [slide0, slide1, slide2]

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 100 }}>
      {/* Skip — only on slides 0 and 1 */}
      {current < 2 && (
        <button
          onClick={onLogin}
          className="absolute z-20"
          style={{
            top: "max(env(safe-area-inset-top, 0px), 20px)", right: "20px",
            color: isLightSlide ? "var(--mute)" : "rgba(245,241,234,0.4)",
            fontSize: "14px", padding: "10px", background: "none", border: "none",
            cursor: "pointer", fontFamily: "var(--font-geist)",
          }}
        >
          Saltar
        </button>
      )}

      {/* Arrow navigation — desktop only */}
      {hasPointer && current > 0 && (
        <button
          onClick={() => goTo(current - 1)}
          aria-label="Slide anterior"
          style={{
            position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)",
            zIndex: 20, width: "44px", height: "44px", borderRadius: "50%",
            backgroundColor: isLightSlide ? "rgba(15,27,61,0.08)" : "rgba(245,241,234,0.1)",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: isLightSlide ? "var(--midnight)" : "var(--bone)",
            transition: "background-color 200ms ease",
          }}
        >
          <ChevronLeft style={{ width: "20px", height: "20px" }} />
        </button>
      )}
      {hasPointer && current < 2 && (
        <button
          onClick={() => goTo(current + 1)}
          aria-label="Slide siguiente"
          style={{
            position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)",
            zIndex: 20, width: "44px", height: "44px", borderRadius: "50%",
            backgroundColor: isLightSlide ? "rgba(15,27,61,0.08)" : "rgba(245,241,234,0.1)",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: isLightSlide ? "var(--midnight)" : "var(--bone)",
            transition: "background-color 200ms ease",
          }}
        >
          <ChevronRight style={{ width: "20px", height: "20px" }} />
        </button>
      )}

      {/* Drag wrapper — touch devices only */}
      <motion.div
        drag={!hasPointer ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={handleDragEnd}
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            ref={slideRef}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ ...SPRING, opacity: { duration: 0.18 } }}
            onAnimationComplete={(def) => {
              if (def === "center") handleSlideEntered()
            }}
            style={{ position: "absolute", inset: 0 }}
          >
            {slides[current]}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Dot indicator */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: current === 2 ? undefined : "max(env(safe-area-inset-bottom, 0px), 24px)",
          display: current === 2 ? "none" : "flex",
          left: 0, right: 0,
          justifyContent: "center",
          gap: "6px",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ width: i === current ? 22 : 5 }}
            transition={SPRING}
            style={{
              height: "5px",
              borderRadius: "3px",
              backgroundColor: i === current
                ? "#E8502A"
                : isLightSlide ? "rgba(15,27,61,0.18)" : "rgba(245,241,234,0.28)",
              transition: "background-color 250ms ease",
            }}
          />
        ))}
      </div>
    </div>
  )
}
