"use client"

import { useState, useRef, useEffect } from "react"
import gsap from "gsap"
import { ChevronRight, ChevronLeft } from "lucide-react"

interface Props {
  onRegister: () => void
  onLogin: () => void
}

const SLIDE_MS = 380
const STAGGER_DELAY_MS = 160

const benefits = [
  { label: "COMBUSTIBLE", figure: "20%", bg: "var(--sol)", color: "var(--midnight)" },
  { label: "COMIDA", figure: "$5", bg: "var(--verde)", color: "#fff" },
  { label: "TALLER", figure: "15%", bg: "var(--ember)", color: "#fff" },
  { label: "SALUD", figure: "10%", bg: "var(--midnight)", color: "var(--bone)" },
]

const steps = [
  { n: "01", title: "Regístrate", desc: "Crea tu cuenta con tu foto de perfil de conductor." },
  { n: "02", title: "Activa tu membresía", desc: "Lo coordinamos por WhatsApp. Yappy o efectivo." },
  { n: "03", title: "Muestra tu QR", desc: "El empleado lo escanea. Descuento aplicado al instante." },
]

export default function OnboardingSlides({ onRegister, onLogin }: Props) {
  const [current, setCurrent] = useState(0)
  const [hasPointer, setHasPointer] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const slide0Ref = useRef<HTMLDivElement>(null)
  const slide1Ref = useRef<HTMLDivElement>(null)
  const slide2Ref = useRef<HTMLDivElement>(null)
  const slideRefs = [slide0Ref, slide1Ref, slide2Ref]
  const swipeHintRef = useRef<HTMLDivElement>(null)

  const touchStartX = useRef(0)
  const touchStartTime = useRef(0)
  const isDragging = useRef(false)

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false

  // Detect mouse vs touch device
  useEffect(() => {
    setHasPointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goTo(Math.min(current + 1, 2))
      if (e.key === "ArrowLeft") goTo(Math.max(current - 1, 0))
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  // Swipe hint nudge — runs once on first slide on touch devices
  useEffect(() => {
    if (hasPointer || current !== 0 || !swipeHintRef.current || prefersReducedMotion) return
    const t = setTimeout(() => {
      gsap.fromTo(
        swipeHintRef.current,
        { x: 0 },
        { x: 10, duration: 0.45, ease: "power1.inOut", repeat: 3, yoyo: true }
      )
    }, 1800)
    return () => clearTimeout(t)
  }, [hasPointer, current, prefersReducedMotion])

  // Animate content in when a slide becomes active
  useEffect(() => {
    const el = slideRefs[current].current
    if (!el) return

    const elements = el.querySelectorAll<HTMLElement>("[data-enter]")
    if (!elements.length) return

    if (prefersReducedMotion) {
      gsap.set(elements, { autoAlpha: 1, y: 0 })
      return
    }

    const delay = current === 0 ? 50 : STAGGER_DELAY_MS
    const timer = setTimeout(() => {
      gsap.fromTo(
        elements,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.055, ease: "power2.out" }
      )
    }, delay)

    return () => clearTimeout(timer)
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  function goTo(index: number) {
    if (index < 0 || index > 2) return
    setCurrent(index)
    if (trackRef.current) {
      trackRef.current.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`
      trackRef.current.style.transform = `translateX(${-(index / 3) * 100}%)`
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartTime.current = Date.now()
    isDragging.current = true
    if (trackRef.current) {
      trackRef.current.style.transition = "none"
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging.current || !trackRef.current) return
    const deltaX = e.touches[0].clientX - touchStartX.current
    const basePercent = -(current / 3) * 100
    const dragPercent = (deltaX / window.innerWidth) * (100 / 3)
    trackRef.current.style.transform = `translateX(${basePercent + dragPercent}%)`
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!isDragging.current) return
    isDragging.current = false

    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const elapsed = Date.now() - touchStartTime.current
    const velocity = Math.abs(deltaX) / elapsed

    if (deltaX < -50 || (velocity > 0.3 && deltaX < 0)) {
      goTo(Math.min(current + 1, 2))
    } else if (deltaX > 50 || (velocity > 0.3 && deltaX > 0)) {
      goTo(Math.max(current - 1, 0))
    } else {
      // Snap back
      if (trackRef.current) {
        trackRef.current.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`
        trackRef.current.style.transform = `translateX(${-(current / 3) * 100}%)`
      }
    }
  }

  const isLightSlide = current === 1
  const dotActive = "var(--ember)"
  const dotInactive = isLightSlide ? "rgba(15,27,61,0.18)" : "rgba(245,241,234,0.28)"

  // Shared content width — centered on desktop, full-width on mobile
  // Side padding uses clamp: ~24px on mobile, ~48px on desktop
  const contentStyle: React.CSSProperties = {
    maxWidth: "480px",
    width: "100%",
    margin: "0 auto",
    paddingLeft: "clamp(24px, 6.5vw, 48px)",
    paddingRight: "clamp(24px, 6.5vw, 48px)",
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 100 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip — only on slides 0 and 1 */}
      {current < 2 && (
        <button
          onClick={onLogin}
          className="absolute z-10"
          style={{
            top: "max(env(safe-area-inset-top, 0px), 20px)",
            right: "20px",
            color: isLightSlide ? "var(--mute)" : "rgba(245,241,234,0.4)",
            fontSize: "14px",
            padding: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-geist)",
          }}
        >
          Saltar
        </button>
      )}

      {/* ── Arrow navigation — desktop (pointer device) only ── */}
      {hasPointer && current > 0 && (
        <button
          onClick={() => goTo(current - 1)}
          aria-label="Slide anterior"
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: isLightSlide ? "rgba(15,27,61,0.08)" : "rgba(245,241,234,0.1)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isLightSlide ? "var(--midnight)" : "var(--bone)",
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
            position: "absolute",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: isLightSlide ? "rgba(15,27,61,0.08)" : "rgba(245,241,234,0.1)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isLightSlide ? "var(--midnight)" : "var(--bone)",
            transition: "background-color 200ms ease",
          }}
        >
          <ChevronRight style={{ width: "20px", height: "20px" }} />
        </button>
      )}

      {/* Slide track */}
      <div
        ref={trackRef}
        style={{
          display: "flex",
          width: "300%",
          height: "100%",
          transform: "translateX(0%)",
          transition: `transform ${SLIDE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
          willChange: "transform",
        }}
      >
        {/* ── Slide 0: Welcome ── */}
        <div
          ref={slide0Ref}
          style={{
            width: "33.333%",
            flexShrink: 0,
            backgroundColor: "var(--midnight)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "80px 0 120px",
            position: "relative",
          }}
        >
          {/* Ambient ember glow — blurred circle, no hard edges */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-8%",
              right: "-8%",
              width: "52%",
              height: "28%",
              backgroundColor: "var(--ember)",
              borderRadius: "50%",
              filter: "blur(72px)",
              opacity: 0.28,
              pointerEvents: "none",
            }}
          />
          <div style={{ ...contentStyle, position: "relative" }}>
            <p
              data-enter
              style={{
                color: "var(--ember)",
                fontSize: "clamp(10px, 1.1vw, 13px)",
                letterSpacing: "0.18em",
                fontFamily: "var(--font-mono)",
                marginBottom: "28px",
                opacity: 0,
              }}
            >
              CLUB DE CONDUCTORES · PANAMÁ
            </p>
            <h1
              data-enter
              style={{
                fontWeight: 800,
                fontSize: "clamp(48px, 7vw, 80px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                color: "var(--bone)",
                marginBottom: "24px",
                fontFamily: "var(--font-geist)",
                opacity: 0,
              }}
            >
              Tu trabajo<br />
              rinde{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--ember)",
                  fontFamily: "var(--font-fraunces)",
                }}
              >
                más.
              </em>
            </h1>
            <p
              data-enter
              style={{
                color: "rgba(245,241,234,0.5)",
                fontSize: "clamp(16px, 1.4vw, 20px)",
                lineHeight: 1.55,
                opacity: 0,
              }}
            >
              Beneficios en combustible, comida y talleres — negociados para conductores activos en Panamá.
            </p>
          </div>
        </div>

        {/* ── Slide 1: Benefits ── */}
        <div
          ref={slide1Ref}
          style={{
            width: "33.333%",
            flexShrink: 0,
            backgroundColor: "var(--bone)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "80px 0 120px",
          }}
        >
          <div style={contentStyle}>
            <p
              data-enter
              style={{
                color: "var(--ember)",
                fontSize: "clamp(10px, 1.1vw, 13px)",
                letterSpacing: "0.18em",
                fontFamily: "var(--font-mono)",
                marginBottom: "16px",
                opacity: 0,
              }}
            >
              BENEFICIOS
            </p>
            <h2
              data-enter
              style={{
                fontWeight: 800,
                fontSize: "clamp(32px, 5vw, 56px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                color: "var(--midnight)",
                marginBottom: "28px",
                fontFamily: "var(--font-geist)",
                opacity: 0,
              }}
            >
              Una membresía.<br />Todo incluido.
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {benefits.map((b, i) => (
                <div
                  key={i}
                  data-enter
                  style={{
                    backgroundColor: b.bg,
                    color: b.color,
                    borderRadius: "16px",
                    padding: "clamp(16px, 2vw, 24px)",
                    opacity: 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: "clamp(9px, 0.9vw, 11px)",
                      letterSpacing: "0.12em",
                      opacity: 0.65,
                      marginBottom: "8px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {b.label}
                  </p>
                  <p
                    style={{
                      fontSize: "clamp(32px, 3.5vw, 44px)",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      fontFamily: "var(--font-geist)",
                    }}
                  >
                    {b.figure}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Slide 2: How it works + CTA ── */}
        <div
          ref={slide2Ref}
          style={{
            width: "33.333%",
            flexShrink: 0,
            backgroundColor: "var(--midnight)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
          }}
        >
          {/* Steps */}
          <div
            style={{
              ...contentStyle,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingTop: "80px",
              paddingBottom: "24px",
            }}
          >
            <p
              data-enter
              style={{
                color: "var(--ember)",
                fontSize: "clamp(10px, 1.1vw, 13px)",
                letterSpacing: "0.18em",
                fontFamily: "var(--font-mono)",
                marginBottom: "28px",
                opacity: 0,
              }}
            >
              TRES PASOS
            </p>
            {steps.map((s) => (
              <div
                key={s.n}
                data-enter
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "28px",
                  alignItems: "flex-start",
                  opacity: 0,
                }}
              >
                <span
                  style={{
                    color: "var(--ember)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(11px, 1vw, 13px)",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    paddingTop: "2px",
                    flexShrink: 0,
                  }}
                >
                  {s.n}
                </span>
                <div>
                  <p
                    style={{
                      color: "var(--bone)",
                      fontWeight: 600,
                      fontSize: "clamp(15px, 1.4vw, 19px)",
                      marginBottom: "4px",
                    }}
                  >
                    {s.title}
                  </p>
                  <p
                    style={{
                      color: "rgba(245,241,234,0.45)",
                      fontSize: "clamp(13px, 1.2vw, 16px)",
                      lineHeight: 1.55,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            data-enter
            style={{
              ...contentStyle,
              paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 40px), 56px)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              opacity: 0,
            }}
          >
            <button
              onClick={onRegister}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backgroundColor: "var(--ember)",
                color: "#fff",
                borderRadius: "9999px",
                padding: "clamp(14px, 1.4vw, 18px) 24px",
                fontWeight: 600,
                fontSize: "clamp(16px, 1.3vw, 18px)",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-geist)",
                width: "100%",
              }}
            >
              Quiero mis beneficios
              <ChevronRight style={{ width: "18px", height: "18px", flexShrink: 0 }} />
            </button>
            <button
              onClick={onLogin}
              style={{
                color: "rgba(245,241,234,0.45)",
                fontSize: "clamp(14px, 1.2vw, 16px)",
                textAlign: "center",
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: "10px",
                fontFamily: "var(--font-geist)",
              }}
            >
              Ya tengo cuenta, ingresar
            </button>
          </div>
        </div>
      </div>

      {/* ── Dot indicator + swipe hint ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "max(env(safe-area-inset-bottom, 0px), 24px)",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          pointerEvents: "none",
        }}
      >
        {/* Swipe hint — touch devices, first slide only */}
        {!hasPointer && current === 0 && (
          <div
            ref={swipeHintRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "rgba(245,241,234,0.35)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              fontFamily: "var(--font-mono)",
            }}
          >
            desliza
            <ChevronRight style={{ width: "12px", height: "12px" }} />
          </div>
        )}

        {/* Dots */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: "5px",
                borderRadius: "3px",
                backgroundColor: i === current ? dotActive : dotInactive,
                width: i === current ? "22px" : "5px",
                transition: "width 300ms cubic-bezier(0.23, 1, 0.32, 1), background-color 250ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
