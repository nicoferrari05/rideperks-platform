"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"

interface Props { onComplete: () => void }

type Particle = {
  x: number      // current x offset from center (GSAP animates this)
  y: number      // current y offset from center (GSAP animates this)
  destX: number  // target x — text pixel position
  destY: number  // target y — text pixel position
  size: number
  color: string
  alpha: number
}

// Brand palette for canvas (oklch values — supported in all modern mobile browsers)
const EMBER = "oklch(0.57 0.19 34)"   // --ember
const BONE  = "oklch(0.96 0.01 80)"   // --bone
const SOL   = "oklch(0.79 0.14 82)"   // --sol

// Bone-heavy so the letterforms read clearly; ember/sol add warmth
const PALETTE = [BONE, BONE, BONE, BONE, EMBER, EMBER, SOL]

// ── Sample target positions by rendering "RP" to an offscreen canvas ──────────
function sampleTargets(
  text: string,
  fontSize: number,
  step: number,
  fontFamily: string,
): Array<{ x: number; y: number }> {
  const cw = Math.round(fontSize * text.length + fontSize)
  const ch = Math.round(fontSize * 1.4)

  const off = document.createElement("canvas")
  off.width  = cw
  off.height = ch

  const c = off.getContext("2d")!
  c.clearRect(0, 0, cw, ch)
  c.fillStyle    = "white"
  c.font         = `800 ${fontSize}px ${fontFamily}`
  c.textAlign    = "center"
  c.textBaseline = "middle"

  // letterSpacing supported in Chrome 99+, Safari 17+, Firefox 113+
  if ("letterSpacing" in c) {
    ;(c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${Math.round(-0.05 * fontSize)}px`
  }

  c.fillText(text, cw / 2, ch / 2)

  const { data } = c.getImageData(0, 0, cw, ch)
  const out: Array<{ x: number; y: number }> = []

  for (let y = 0; y < ch; y += step) {
    for (let x = 0; x < cw; x += step) {
      if (data[(y * cw + x) * 4 + 3] > 100) {
        out.push({ x: x - cw / 2, y: y - ch / 2 })
      }
    }
  }

  return out
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SplashScreen({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const t = setTimeout(onComplete, 400)
      return () => clearTimeout(t)
    })

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let drawFn:   (() => void) | null        = null
      let masterTl: gsap.core.Timeline | null  = null
      const tweens: gsap.core.Tween[]          = []
      let cancelled = false

      ;(async () => {
        const W = window.innerWidth
        const H = window.innerHeight
        canvas.width  = W
        canvas.height = H
        const ctx = canvas.getContext("2d")!
        const cx  = W / 2
        const cy  = H / 2

        // Resolve the Geist font family from the CSS variable on <html>
        const fontVar    = getComputedStyle(document.documentElement)
          .getPropertyValue("--font-geist").trim()
        const fontFamily = fontVar || "system-ui, sans-serif"

        // Wait for all fonts (Geist) to be available before sampling
        await document.fonts.ready
        if (cancelled) return

        // Responsive font size — large enough to fill ~30% of screen width
        const fontSize = Math.min(Math.round(W * 0.30), 140)
        const targets  = sampleTargets("RP", fontSize, 4, fontFamily)
        if (!targets.length) { onComplete(); return }

        // Build particles — each starts at a random off-screen radial position
        const maxR = Math.max(W, H)
        const particles: Particle[] = targets.map((t) => {
          const angle  = Math.random() * Math.PI * 2
          const radius = maxR * (1.1 + Math.random() * 0.85)
          const accent = Math.random() > 0.68   // ~32% slightly larger accent dots

          return {
            x:     Math.cos(angle) * radius,
            y:     Math.sin(angle) * radius,
            destX: t.x,
            destY: t.y,
            size:  accent ? 1.8 + Math.random() * 1.0 : 0.9 + Math.random() * 1.1,
            color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
            alpha: 0.65 + Math.random() * 0.35,
          }
        })

        const state = { masterAlpha: 0 }

        // Draw all particles each GSAP tick
        drawFn = () => {
          ctx.clearRect(0, 0, W, H)
          for (const p of particles) {
            const ea = p.alpha * state.masterAlpha
            const px = cx + p.x
            const py = cy + p.y

            // Soft glow halo — drawn first, behind the core
            ctx.globalAlpha = ea * 0.20
            ctx.fillStyle   = p.color
            ctx.beginPath()
            ctx.arc(px, py, p.size * 3.2, 0, Math.PI * 2)
            ctx.fill()

            // Solid core dot
            ctx.globalAlpha = ea
            ctx.beginPath()
            ctx.arc(px, py, p.size, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
        }

        gsap.ticker.add(drawFn)

        // Stagger particles toward their destinations
        particles.forEach((p) => {
          tweens.push(gsap.to(p, {
            x:        p.destX,
            y:        p.destY,
            duration: 0.90 + Math.random() * 0.55,  // 0.90 – 1.45 s
            delay:    Math.random() * 0.22,           // 0 – 220 ms stagger
            ease:     "expo.out",
          }))
        })

        // Master timeline: fade in → hold assembled RP → fade out
        masterTl = gsap.timeline({
          onComplete: () => {
            if (drawFn) { gsap.ticker.remove(drawFn); drawFn = null }
            onComplete()
          },
        })

        masterTl
          .to(state, { masterAlpha: 1, duration: 0.28, ease: "power2.out" }, 0)
          .to(state, { masterAlpha: 0, duration: 0.42, ease: "power2.in"  }, 2.25)
      })()

      return () => {
        cancelled = true
        if (drawFn) { gsap.ticker.remove(drawFn); drawFn = null }
        tweens.forEach((t) => t.kill())
        masterTl?.kill()
      }
    })

    return () => mm.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{ backgroundColor: "var(--midnight)" }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />
    </div>
  )
}
