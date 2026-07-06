"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react"

// TypeScript declaration for the Yappy web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "yappy-btn": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { theme?: string; rounded?: string }
    }
  }
}

interface YappyBtnElement extends HTMLElement {
  eventPayment: (data: { transactionId: string; token: string; documentName: string }) => void
  isButtonLoading: boolean
}

interface OrderData {
  transactionId: string
  token: string
  documentName: string
}

type Step = "form" | "payment" | "success"
type Platform = "uber" | "indrive" | "pedidosya" | "multiple"

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "uber", label: "Uber" },
  { value: "indrive", label: "InDrive" },
  { value: "pedidosya", label: "PedidosYa" },
  { value: "multiple", label: "Varias plataformas" },
]

interface Props {
  referralCode?: string | null
}

export default function JoinForm({ referralCode }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [scriptReady, setScriptReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const btnRef = useRef<YappyBtnElement | null>(null)
  const orderDataRef = useRef<OrderData | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [platform, setPlatform] = useState<Platform>("uber")

  // ── Yappy button event wiring ────────────────────────────────────────────
  const handleYappyClick = useCallback(async () => {
    const btn = btnRef.current
    if (!btn) return

    btn.isButtonLoading = true

    try {
      const res = await fetch("/api/yappy/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, platform, referralCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Error al procesar el pago")
        btn.isButtonLoading = false
        return
      }

      orderDataRef.current = data
      btn.isButtonLoading = false
      btn.eventPayment(data)
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
      btn.isButtonLoading = false
    }
  }, [name, email, password, phone, platform, referralCode])

  const handleYappySuccess = useCallback(() => {
    setStep("success")
  }, [])

  const handleYappyError = useCallback((e: Event) => {
    const code = (e as CustomEvent).detail?.code
    const messages: Record<string, string> = {
      E005: "Este número no está registrado en Yappy.",
      E007: "Esta orden ya fue procesada.",
      E009: "Error en los datos del pedido.",
      E010: "El monto ingresado no es correcto.",
    }
    toast.error(messages[code] ?? "El pago no se completó. Intenta de nuevo.")
  }, [])

  useEffect(() => {
    if (step !== "payment" || !scriptReady) return
    const btn = btnRef.current
    if (!btn) return

    btn.addEventListener("eventClick", handleYappyClick)
    btn.addEventListener("eventSuccess", handleYappySuccess)
    btn.addEventListener("eventError", handleYappyError)

    return () => {
      btn.removeEventListener("eventClick", handleYappyClick)
      btn.removeEventListener("eventSuccess", handleYappySuccess)
      btn.removeEventListener("eventError", handleYappyError)
    }
  }, [step, scriptReady, handleYappyClick, handleYappySuccess, handleYappyError])

  // ── Form submission ──────────────────────────────────────────────────────
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      toast.error("Completa todos los campos")
      return
    }
    if (phone.replace(/\D/g, "").length < 7) {
      toast.error("Ingresa un número de teléfono válido")
      return
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener mínimo 6 caracteres")
      return
    }
    setStep("payment")
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="flex flex-col items-center text-center px-6 pt-12 pb-8 gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(34,197,94,0.12)" }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: "var(--verde)" }} />
        </div>

        <div>
          <h2
            className="font-bold"
            style={{ fontSize: "26px", letterSpacing: "-0.02em", color: "var(--bone)" }}
          >
            ¡Bienvenido a RidePerks!
          </h2>
          <p className="mt-2 text-sm" style={{ color: "rgba(245,241,234,0.55)", lineHeight: 1.6 }}>
            Tu pago fue recibido. Tu cuenta estará activa en unos segundos.
          </p>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="pressable w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--ember)", color: "#fff" }}
        >
          Iniciar sesión
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  if (step === "payment") {
    return (
      <>
        <Script
          src="https://bt-cdn.yappy.cloud/v1/cdn/web-component-btn-yappy.js"
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
        />

        <div className="px-6 pt-8 pb-8 flex flex-col gap-6">
          <button
            onClick={() => setStep("form")}
            className="pressable flex items-center gap-2 text-sm self-start"
            style={{ color: "rgba(245,241,234,0.45)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div>
            <h2
              className="font-bold"
              style={{ fontSize: "24px", letterSpacing: "-0.02em", color: "var(--bone)" }}
            >
              Paga con Yappy
            </h2>
            <p className="mt-1 text-sm" style={{ color: "rgba(245,241,234,0.50)", lineHeight: 1.6 }}>
              Membresía mensual · <span style={{ color: "var(--bone)" }}>B/. 15.00</span>
            </p>
          </div>

          {/* Summary card */}
          <div
            className="rounded-2xl p-4 flex flex-col gap-2"
            style={{
              backgroundColor: "oklch(0.24 0.06 255)",
              border: "1px solid rgba(245,241,234,0.08)",
            }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: "rgba(245,241,234,0.5)" }}>Conductor</span>
              <span style={{ color: "var(--bone)", fontWeight: 600 }}>{name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "rgba(245,241,234,0.5)" }}>Plan</span>
              <span style={{ color: "var(--bone)", fontWeight: 600 }}>Mensual</span>
            </div>
            <div
              className="flex justify-between text-sm pt-2 mt-1"
              style={{ borderTop: "1px solid rgba(245,241,234,0.08)" }}
            >
              <span style={{ color: "rgba(245,241,234,0.5)" }}>Total</span>
              <span className="font-bold" style={{ color: "var(--ember)", fontSize: "16px" }}>
                B/. 15.00
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            {scriptReady ? (
              // @ts-expect-error — yappy-btn is a custom web component
              <yappy-btn ref={btnRef} theme="dark" rounded="true" />
            ) : (
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: "rgba(245,241,234,0.45)" }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando botón de pago...
              </div>
            )}
          </div>

          <p className="text-center text-xs" style={{ color: "rgba(245,241,234,0.25)" }}>
            Al pagar aceptas los términos y condiciones de RidePerks.
            <br />
            Tu suscripción se activa inmediatamente.
          </p>
        </div>
      </>
    )
  }

  // step === "form"
  return (
    <form onSubmit={handleFormSubmit} className="px-6 pt-4 pb-8 flex flex-col gap-4">
      {referralCode && (
        <div
          className="px-4 py-2 rounded-full self-start font-mono text-xs font-bold"
          style={{
            backgroundColor: "rgba(232,80,42,0.12)",
            color: "var(--ember)",
            border: "1px solid rgba(232,80,42,0.25)",
            letterSpacing: "0.06em",
          }}
        >
          Código referido: {referralCode}
        </div>
      )}

      <Field label="Nombre completo">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre completo"
          autoComplete="name"
          required
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          required
        />
      </Field>

      <Field label="Contraseña">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
            style={{ paddingRight: "2.5rem" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(245,241,234,0.4)" }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <Field label="Número de teléfono (Yappy)">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="6XXX-XXXX"
          autoComplete="tel"
          required
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: "rgba(245,241,234,0.5)", letterSpacing: "0.04em" }}>
          PLATAFORMA
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPlatform(value)}
              className="pressable py-2.5 px-3 rounded-xl text-sm font-medium text-left"
              style={{
                backgroundColor:
                  platform === value ? "rgba(232,80,42,0.15)" : "oklch(0.24 0.06 255)",
                border: `1px solid ${platform === value ? "rgba(232,80,42,0.4)" : "rgba(245,241,234,0.08)"}`,
                color: platform === value ? "var(--ember)" : "rgba(245,241,234,0.6)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="pressable w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 mt-2"
        style={{
          backgroundColor: "var(--ember)",
          color: "#fff",
          opacity: submitting ? 0.7 : 1,
          boxShadow: "0 8px 24px rgba(232,80,42,0.35)",
        }}
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Continuar al pago
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-center text-xs" style={{ color: "rgba(245,241,234,0.30)" }}>
        Membresía mensual · B/. 15.00 · Cancela cuando quieras
      </p>
    </form>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold"
        style={{ color: "rgba(245,241,234,0.5)", letterSpacing: "0.04em" }}
      >
        {label.toUpperCase()}
      </label>
      <div
        style={{
          backgroundColor: "oklch(0.24 0.06 255)",
          border: "1px solid rgba(245,241,234,0.1)",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <style>{`
          .join-input input, .join-input input::placeholder {
            background: transparent;
            border: none;
            outline: none;
            width: 100%;
            padding: 0.75rem 1rem;
            color: var(--bone);
            font-size: 15px;
          }
          .join-input input::placeholder {
            color: rgba(245,241,234,0.3);
          }
        `}</style>
        <div className="join-input">{children}</div>
      </div>
    </div>
  )
}
