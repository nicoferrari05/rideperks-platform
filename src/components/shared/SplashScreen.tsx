"use client"

import { useRef, useEffect, useState } from "react"
import gsap from "gsap"
import Logo from "./Logo"

interface Props { onComplete: () => void }

// ── Sphere config (Living Sphere by AI Canvas, adapted for splash) ────────────
const N_LATS      = 38
const N_STEPS     = 200
const WAVE_PHI    = 0.28
const WAVE_FREQ_T = 2.0
const WAVE_FREQ_P = 1.8
const WAVE_SPEED  = 0.003
const ROT_SPEED   = 0.003
const BACK_A      = 0.04
const ALPHA_MIN   = 0.10
const ALPHA_MAX   = 0.30
const LW_MIN      = 0.30
const LW_MAX      = 0.75
const BAND_SIGMA  = 0.35
const BAND_FREQ   = 2.5
const TWO_PI      = Math.PI * 2
// Bone-colored lines (warm off-white) on midnight background
const LINE_RGB    = "245,241,234"

export default function SplashScreen({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const orbRef       = useRef<HTMLDivElement>(null)
  const [showMark, setShowMark] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    const orb       = orbRef.current
    if (!container || !canvas || !orb) return

    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const t = setTimeout(onComplete, 400)
      return () => clearTimeout(t)
    })

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // ── Sphere canvas ──────────────────────────────────────────────────────
      // Re-capture as non-null (null already guarded above)
      const cv  = canvas as HTMLCanvasElement
      const ctx = cv.getContext("2d")!
      let cw = 0, ch = 0
      let animId = 0
      let alive  = true
      let t      = 0
      let rot    = 0

      const xs = new Float32Array(N_STEPS + 1)
      const ys = new Float32Array(N_STEPS + 1)

      function build() {
        const dpr  = window.devicePixelRatio || 1
        const rect = cv.getBoundingClientRect()
        cw = rect.width
        ch = rect.height
        if (!cw || !ch) return
        cv.width  = Math.round(cw * dpr)
        cv.height = Math.round(ch * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }

      function frame() {
        if (!alive) return
        t   += WAVE_SPEED
        rot += ROT_SPEED

        ctx.clearRect(0, 0, cw, ch)

        const R          = Math.min(cw, ch) * 0.44
        const cx         = cw / 2
        const cy         = ch / 2
        const bandCenter = Math.sin(t * BAND_FREQ) * (Math.PI * 0.4)

        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, R, 0, Math.PI * 2)
        ctx.clip()

        for (let i = 0; i < N_LATS; i++) {
          const phi   = -Math.PI / 2 + (i + 1) * Math.PI / (N_LATS + 1)
          const depth = Math.cos(phi)
          const lineA = ALPHA_MIN + depth * (ALPHA_MAX - ALPHA_MIN)
          const lw    = LW_MIN    + depth * (LW_MAX    - LW_MIN)

          const dist    = phi - bandCenter
          const autoEnv = Math.exp(-(dist * dist) / (2 * BAND_SIGMA * BAND_SIGMA))
          const autoAmp = WAVE_PHI * autoEnv

          // Precompute displaced 3D → 2D positions
          for (let j = 0; j <= N_STEPS; j++) {
            const tR      = (j * TWO_PI / N_STEPS) + rot
            const autoDPhi = autoAmp * (
              Math.sin(tR * WAVE_FREQ_T + phi * WAVE_FREQ_P + t) +
              0.45 * Math.sin(tR * WAVE_FREQ_T * 1.7 + phi * WAVE_FREQ_P * 1.3 + t * 1.4)
            )
            const phiD = phi + autoDPhi
            xs[j] = cx + R * Math.cos(phiD) * Math.cos(tR)
            ys[j] = cy - R * Math.sin(phiD)
          }

          // Back arc — dim ghost layer
          ctx.strokeStyle = `rgba(${LINE_RGB},${BACK_A})`
          ctx.lineWidth   = 0.4
          ctx.beginPath()
          {
            const mx0 = (xs[N_STEPS - 1] + xs[0]) / 2
            const my0 = (ys[N_STEPS - 1] + ys[0]) / 2
            ctx.moveTo(mx0, my0)
            for (let j = 0; j < N_STEPS; j++) {
              const nx  = j + 1 < N_STEPS ? xs[j + 1] : xs[0]
              const ny  = j + 1 < N_STEPS ? ys[j + 1] : ys[0]
              ctx.quadraticCurveTo(xs[j], ys[j], (xs[j] + nx) / 2, (ys[j] + ny) / 2)
            }
            ctx.closePath()
            ctx.stroke()
          }

          // Front arc — bright hemisphere only
          let startJ = 0
          for (let j = 0; j < N_STEPS; j++) {
            if (Math.sin(j * TWO_PI / N_STEPS + rot) < 0) { startJ = j; break }
          }

          ctx.strokeStyle = `rgba(${LINE_RGB},${lineA.toFixed(3)})`
          ctx.lineWidth   = lw
          ctx.beginPath()
          let inFront = false
          let prevX   = 0
          let prevY   = 0
          for (let jj = 0; jj <= N_STEPS; jj++) {
            const j       = (startJ + jj) % N_STEPS
            const isFront = Math.sin(j * TWO_PI / N_STEPS + rot) >= 0
            const x = xs[j], y = ys[j]
            if (isFront) {
              if (!inFront) { ctx.moveTo(x, y); inFront = true }
              else { ctx.quadraticCurveTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2) }
              prevX = x; prevY = y
            } else if (inFront) {
              ctx.lineTo(prevX, prevY)
              inFront = false
            }
          }
          if (inFront) ctx.lineTo(prevX, prevY)
          ctx.stroke()
        }

        ctx.restore()
        animId = requestAnimationFrame(frame)
      }

      build()
      frame()

      const ro = new ResizeObserver(build)
      ro.observe(canvas.parentElement!)

      // ── GSAP entrance / exit ───────────────────────────────────────────────
      // container starts at opacity:0 via inline style — no gsap.set needed
      gsap.set(orb, { autoAlpha: 0, scale: 0.55 })

      const tl = gsap.timeline({ onComplete })

      // Sphere fades in
      tl.to(container, { autoAlpha: 1, duration: 0.55, ease: "power2.out" }, 0)

      // Glow orb blooms from center
      tl.to(orb, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "expo.out" }, 0.85)

      // Pill mark mounts here — Logo runs its own bloom + letter-stagger animation
      tl.call(() => setShowMark(true), [], 0.92)

      // Orb settles to ambient glow
      tl.to(orb, { scale: 1.15, autoAlpha: 0.40, duration: 0.8, ease: "sine.out" }, 1.60)

      // Fade everything out
      tl.to(container, { autoAlpha: 0, duration: 0.38, ease: "power2.in" }, 3.15)

      return () => {
        alive = false
        cancelAnimationFrame(animId)
        ro.disconnect()
        tl.kill()
      }
    })

    return () => mm.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999]"
      style={{ backgroundColor: "#0F1B3D", opacity: 0 }}
    >
      {/* Living Sphere canvas — masked so lines fade out near the center,
          leaving clean space for the pill mark to sit in */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          width: "100%",
          height: "100%",
          maskImage: "radial-gradient(circle at center, transparent 0px, transparent 150px, black 300px)",
          WebkitMaskImage: "radial-gradient(circle at center, transparent 0px, transparent 150px, black 300px)",
        }}
      />

      {/* Centered pill mark with glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {/* Ember glow orb */}
        <div
          ref={orbRef}
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,80,42,0.48) 0%, rgba(232,80,42,0.16) 42%, rgba(201,167,53,0.07) 62%, transparent 80%)",
            filter: "blur(28px)",
          }}
        />

        {/* RIDEPERKS pill — same mark used on login/register, so the brand
            treatment carries through the transition instead of switching */}
        {showMark && (
          <div style={{ position: "relative", zIndex: 1 }}>
            <Logo size="xl" />
          </div>
        )}
      </div>
    </div>
  )
}
