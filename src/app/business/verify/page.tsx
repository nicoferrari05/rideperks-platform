"use client"

import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Logo from "@/components/shared/Logo"

gsap.registerPlugin(useGSAP)

type VerifyResult = {
  valid: boolean
  type?: "membership" | "benefit"
  error?: string
  driver_name?: string
  platform?: string
  expires_at?: string
  benefit_title?: string
  discount_value?: string
  discount_type?: string
  business_name?: string
}

type Step = "code" | "scan" | "result"

const AUTO_RESET_SECONDS = 5

function withVT(fn: () => void) {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.startViewTransition(fn)
  } else {
    fn()
  }
}

// ── RESULT SCREEN ────────────────────────────────────────────
function ResultScreen({
  result,
  countdown,
  resetToScan,
  progress,
}: {
  result: VerifyResult
  countdown: number
  resetToScan: () => void
  progress: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isValid = result.valid
  const bg = isValid ? "var(--verde)" : "oklch(0.45 0.2 27)"

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-result='icon']", {
          scale: 0.4, autoAlpha: 0, duration: 0.55, ease: "back.out(1.7)",
        })
        gsap.from("[data-result='title']", {
          autoAlpha: 0, y: 24, duration: 0.45, delay: 0.18, ease: "power3.out",
        })
        gsap.from("[data-result='details']", {
          autoAlpha: 0, y: 18, duration: 0.4, delay: 0.32, ease: "power2.out",
        })
        gsap.from("[data-result='countdown']", {
          autoAlpha: 0, duration: 0.3, delay: 0.5,
        })
      })
      return () => mm.revert()
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: bg, transition: "background-color 0.3s ease" }}
    >
      <div className="h-1 w-full" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            backgroundColor: "rgba(255,255,255,0.6)",
            transition: "width 1s linear",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          data-result="icon"
          className="rounded-full flex items-center justify-center mb-8"
          style={{ width: "120px", height: "120px", backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <span style={{ fontSize: "64px", lineHeight: 1 }}>
            {isValid ? "✓" : "✗"}
          </span>
        </div>

        <p
          data-result="title"
          className="font-bold font-mono-brand"
          style={{
            fontSize: "56px",
            letterSpacing: "0.1em",
            color: "#fff",
            lineHeight: 1,
            marginBottom: "16px",
          }}
        >
          {isValid ? "VÁLIDO" : "INVÁLIDO"}
        </p>

        <div data-result="details">
          {isValid ? (
            <div className="space-y-3">
              <p className="font-bold" style={{ fontSize: "28px", color: "#fff", letterSpacing: "-0.02em" }}>
                {result.driver_name}
              </p>
              {result.discount_value && (
                <div
                  className="inline-block rounded-2xl px-6 py-3"
                  style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                >
                  <p className="font-bold font-mono-brand" style={{ fontSize: "32px", color: "#fff", letterSpacing: "-0.01em" }}>
                    {result.discount_value}
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em" }}>
                    DE DESCUENTO
                  </p>
                </div>
              )}
              {result.type === "membership" && result.expires_at && (
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                  Membresía activa hasta{" "}
                  {new Date(result.expires_at).toLocaleDateString("es-PA", { day: "2-digit", month: "long" })}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
                {result.error}
              </p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginTop: "12px" }}>
                No apliques el descuento.
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        data-result="countdown"
        className="px-8 text-center"
        style={{ paddingBottom: "max(3rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))" }}
      >
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
          Vuelve a escanear en {countdown}s
        </p>
        <button
          onClick={resetToScan}
          className="pressable mt-3 rounded-full px-6 py-2.5 font-semibold text-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.2)", color: "#fff" }}
        >
          Escanear ahora
        </button>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT (needs Suspense for useSearchParams) ───────
function BusinessVerifyContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>("code")
  const [businessCode, setBusinessCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS)
  const [manualToken, setManualToken] = useState("")
  const scannerRef = useRef<unknown>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      const s = scannerRef.current as { stop: () => Promise<void>; clear: () => void }
      try { await s.stop(); s.clear() } catch {}
      scannerRef.current = null
    }
  }, [])

  const resetToScan = useCallback(() => {
    withVT(() => {
      setResult(null)
      setStep("scan")
      setCountdown(AUTO_RESET_SECONDS)
      setManualToken("")
    })
  }, [])

  // Auto-reset countdown after result
  useEffect(() => {
    if (!result) return
    setCountdown(AUTO_RESET_SECONDS)
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!)
          resetToScan()
          return AUTO_RESET_SECONDS
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current!)
  }, [result, resetToScan])

  // If arriving from login with ?code=, skip code entry and go straight to scanner
  useEffect(() => {
    const codeParam = searchParams.get("code")
    if (!codeParam) return
    setBusinessCode(codeParam)
    withVT(() => setStep("scan"))
    // Scanner will be started by the step useEffect below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Start scanner once the "scan" step is active and #qr-viewport is in the DOM.
  // Using an effect (not inline in the handler) avoids the race condition where
  // startScanner() runs before React has rendered the #qr-viewport div.
  // The explicit getUserMedia call forces the iOS PWA camera permission prompt —
  // standalone apps have a separate permission context from Safari.
  useEffect(() => {
    if (step !== "scan" || !businessCode) return

    let cancelled = false

    async function init() {
      // Explicit permission request — required for iOS home screen apps
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
          stream.getTracks().forEach(t => t.stop()) // release immediately; Html5Qrcode opens its own
        } catch {
          if (!cancelled) {
            toast.error("Permite el acceso a la cámara en Ajustes del teléfono para escanear QRs.")
          }
          return
        }
      }

      if (cancelled) return
      await startScannerWithCode(businessCode)
    }

    init()

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, businessCode])

  async function startScannerWithCode(code: string) {
    const { Html5Qrcode } = await import("html5-qrcode")
    const scanner = new Html5Qrcode("qr-viewport")
    scannerRef.current = scanner
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 260, height: 260 } },
        async (decoded) => {
          await stopScanner()
          await verifyTokenWithCode(decoded, code)
        },
        () => {}
      )
    } catch {
      toast.error("No se pudo acceder a la cámara. Usa el ingreso manual.")
    }
  }

  async function verifyTokenWithCode(token: string, code: string) {
    if (!token.trim()) return
    setVerifying(true)
    try {
      const res = await fetch("/api/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), business_code: code }),
      })
      const data = await res.json()
      withVT(() => { setResult(data); setStep("result") })
    } catch {
      withVT(() => {
        setResult({ valid: false, error: "Error de conexión. Intenta de nuevo." })
        setStep("result")
      })
    }
    setVerifying(false)
  }

  async function verifyToken(token: string) {
    await verifyTokenWithCode(token, businessCode)
  }

  function handleCodeSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (businessCode.trim().length < 3) {
      toast.error("Ingresa el código de tu comercio")
      return
    }
    withVT(() => setStep("scan"))
    // Scanner starts via the step useEffect — not here
  }

  // ── CODE ENTRY STEP ─────────────────────────────────────────
  if (step === "code") {
    return (
      <div className="min-h-dvh flex flex-col" style={{ backgroundColor: "var(--midnight)" }}>
        <header
          className="px-6 pb-4"
          style={{ paddingTop: "max(2rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))" }}
        >
          <Logo size="sm" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
          <div className="w-full max-w-xs">
            <p
              className="font-mono-brand mb-3 text-center"
              style={{ fontSize: "11px", letterSpacing: "0.18em", color: "rgba(245,241,234,0.4)" }}
            >
              PORTAL COMERCIOS
            </p>
            <h1
              className="font-bold text-center mb-10"
              style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--bone)", lineHeight: 1.1 }}
            >
              Ingresa tu<br />código de acceso
            </h1>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <input
                type="text"
                value={businessCode}
                onChange={(e) => setBusinessCode(e.target.value.toUpperCase())}
                placeholder="TIENDA01"
                autoFocus
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                className="input-brand w-full rounded-2xl text-center font-mono-brand font-semibold"
                style={{
                  fontSize: "28px",
                  letterSpacing: "0.18em",
                  padding: "20px 16px",
                  backgroundColor: "rgba(245,241,234,0.07)",
                  border: "1px solid rgba(245,241,234,0.15)",
                  color: "var(--bone)",
                }}
              />
              <p
                className="text-center font-mono-brand"
                style={{ fontSize: "11px", color: "rgba(245,241,234,0.3)", letterSpacing: "0.06em" }}
              >
                RidePerks te asignó este código al unirte al programa
              </p>
              <button
                type="submit"
                className="pressable w-full rounded-2xl font-bold text-lg py-4"
                style={{ backgroundColor: "var(--ember)", color: "#fff" }}
              >
                Continuar
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── SCAN STEP ───────────────────────────────────────────────
  if (step === "scan") {
    return (
      <div className="min-h-dvh flex flex-col" style={{ backgroundColor: "var(--midnight)" }}>
        <header
          className="px-6 pb-4 flex items-center justify-between"
          style={{ paddingTop: "max(2rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))" }}
        >
          <Logo size="sm" />
          <span
            className="font-mono-brand px-3 py-1.5 rounded-full"
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              backgroundColor: "rgba(47,143,110,0.2)",
              color: "var(--verde)",
            }}
          >
            LISTO
          </span>
        </header>

        <div className="px-6 pb-3">
          <p className="font-semibold" style={{ fontSize: "20px", color: "var(--bone)", letterSpacing: "-0.02em" }}>
            Apunta al QR del conductor
          </p>
          <p
            className="font-mono-brand mt-1"
            style={{ fontSize: "11px", color: "rgba(245,241,234,0.35)", letterSpacing: "0.08em" }}
          >
            {businessCode}
          </p>
        </div>

        <div className="flex-1 mx-4 rounded-3xl overflow-hidden relative" style={{ minHeight: "360px", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div id="qr-viewport" className="w-full h-full" />
          {verifying && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(15,27,61,0.8)" }}>
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: "var(--ember)" }} />
                <p className="font-mono-brand" style={{ fontSize: "11px", color: "var(--bone)", letterSpacing: "0.12em" }}>
                  VERIFICANDO...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-6 space-y-3">
          <p className="text-center font-mono-brand" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(245,241,234,0.25)" }}>
            O INGRESA EL CÓDIGO MANUALMENTE
          </p>
          <div className="flex gap-2">
            <input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Pega el código del QR..."
              className="flex-1 rounded-xl px-4 py-3 text-base md:text-sm font-mono-brand outline-none"
              style={{
                backgroundColor: "rgba(245,241,234,0.07)",
                border: "1px solid rgba(245,241,234,0.12)",
                color: "var(--bone)",
              }}
            />
            <button
              onClick={() => verifyToken(manualToken)}
              disabled={verifying || !manualToken.trim()}
              className="pressable rounded-xl px-5 py-3 font-semibold text-sm flex-shrink-0"
              style={{ backgroundColor: "var(--ember)", color: "#fff", opacity: manualToken.trim() ? 1 : 0.4 }}
            >
              OK
            </button>
          </div>
          <button
            onClick={() => { stopScanner(); setStep("code") }}
            className="pressable w-full text-center py-2"
            style={{ fontSize: "13px", color: "rgba(245,241,234,0.3)" }}
          >
            Cambiar código de comercio
          </button>
        </div>
      </div>
    )
  }

  // ── RESULT STEP ─────────────────────────────────────────────
  if (step === "result" && result) {
    const progress = (countdown / AUTO_RESET_SECONDS) * 100
    return (
      <ResultScreen
        result={result}
        countdown={countdown}
        resetToScan={resetToScan}
        progress={progress}
      />
    )
  }

  return null
}

// Suspense wrapper required by Next.js for useSearchParams
export default function BusinessVerifyPage() {
  return (
    <Suspense>
      <BusinessVerifyContent />
    </Suspense>
  )
}
