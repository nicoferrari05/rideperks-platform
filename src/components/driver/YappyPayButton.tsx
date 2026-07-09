"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "btn-yappy": React.DetailedHTMLProps<
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

interface YappyPayButtonProps {
  defaultPhone?: string
}

export default function YappyPayButton({ defaultPhone = "" }: YappyPayButtonProps) {
  const router = useRouter()
  const btnRef = useRef<YappyBtnElement | null>(null)
  const [ready, setReady] = useState(() =>
    typeof window !== "undefined" && !!customElements.get("btn-yappy")
  )
  const [yappyVisible, setYappyVisible] = useState(false)
  const [failed, setFailed] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmPhone, setConfirmPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Listen for subscription activation in real-time so UI updates without manual refresh
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      channel = supabase
        .channel("subscription-activation")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "subscriptions", filter: `driver_id=eq.${user.id}` },
          (payload: { new: { status?: string } }) => {
            if (payload.new.status === "active") router.refresh()
          }
        )
        .subscribe()
    })()

    return () => { if (channel) supabase.removeChannel(channel) }
  }, [router])

  // Once ready, delay showing btn-yappy for 400ms so its internal
  // "no disponible" flash resolves before the element becomes visible
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setYappyVisible(true), 400)
    return () => clearTimeout(t)
  }, [ready])

  useEffect(() => {
    if (customElements.get("btn-yappy")) {
      setReady(true)
      return
    }

    const interval = setInterval(() => {
      if (customElements.get("btn-yappy")) {
        clearInterval(interval)
        clearTimeout(timeout)
        setReady(true)
      }
    }, 200)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      setFailed(true)
    }, 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  const closeBackdrop = useCallback(() => setPaymentOpen(false), [])

  const handleClick = useCallback(() => {
    const btn = btnRef.current
    if (!btn) return
    btn.isButtonLoading = true
    setConfirmPhone(defaultPhone)
    setConfirming(true)
  }, [defaultPhone])

  const handleCancelConfirm = useCallback(() => {
    const btn = btnRef.current
    if (btn) btn.isButtonLoading = false
    setConfirming(false)
  }, [])

  const handleConfirmPay = useCallback(async () => {
    const btn = btnRef.current
    if (!btn) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/yappy/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: confirmPhone }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Error al procesar el pago")
        btn.isButtonLoading = false
        setConfirming(false)
        setSubmitting(false)
        return
      }
      setConfirming(false)
      setSubmitting(false)
      btn.isButtonLoading = false
      setPaymentOpen(true)
      btn.eventPayment(data)
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
      btn.isButtonLoading = false
      setConfirming(false)
      setSubmitting(false)
    }
  }, [confirmPhone])

  const handleSuccess = useCallback(() => {
    setPaymentOpen(false)
    toast.success("¡Pago recibido! Tu membresía estará activa en unos segundos.")
    setTimeout(() => router.refresh(), 3000)
  }, [router])

  const handleError = useCallback((e: Event) => {
    setPaymentOpen(false)
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
    if (!ready) return
    const btn = btnRef.current
    if (!btn) return
    btn.addEventListener("eventClick", handleClick)
    btn.addEventListener("eventSuccess", handleSuccess)
    btn.addEventListener("eventError", handleError)
    return () => {
      btn.removeEventListener("eventClick", handleClick)
      btn.removeEventListener("eventSuccess", handleSuccess)
      btn.removeEventListener("eventError", handleError)
    }
  }, [ready, handleClick, handleSuccess, handleError])

  if (failed) {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(245,241,234,0.45)" }}>
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        No se pudo cargar el botón de Yappy. Recarga la página.
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(245,241,234,0.45)" }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Cargando Yappy...
      </div>
    )
  }

  const overlays = (
    <>
      {/* Phone confirmation sheet */}
      {confirming && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--midnight)",
              borderRadius: "20px 20px 0 0",
              padding: "24px 20px",
              paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow */}
            <div
              className="rounded-full"
              style={{
                position: "absolute",
                right: "-15%", top: "-25%", width: "48%", height: "48%",
                backgroundColor: "rgba(232,80,42,0.55)",
                filter: "blur(50px)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <p
                className="font-semibold mb-1"
                style={{ fontSize: "17px", color: "var(--bone)", letterSpacing: "-0.01em" }}
              >
                Confirma tu número de Yappy
              </p>
              <p className="text-sm mb-5" style={{ color: "rgba(245,241,234,0.45)" }}>
                Este es el número al que se enviará el cobro de $15.00. Cámbialo si usas otro número en Yappy.
              </p>

              <label
                className="font-mono-brand"
                style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(245,241,234,0.4)", display: "block", marginBottom: "6px" }}
              >
                NÚMERO DE YAPPY
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={confirmPhone}
                onChange={(e) => setConfirmPhone(e.target.value)}
                placeholder="Ej: 6000-0000"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(245,241,234,0.12)",
                  fontSize: "16px",
                  color: "var(--bone)",
                  backgroundColor: "rgba(245,241,234,0.07)",
                  outline: "none",
                  marginBottom: "16px",
                  fontFamily: "inherit",
                }}
              />

              <button
                onClick={handleConfirmPay}
                disabled={submitting || !confirmPhone.trim()}
                className="pressable w-full rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2 mb-3"
                style={{
                  backgroundColor: submitting || !confirmPhone.trim() ? "rgba(232,80,42,0.35)" : "var(--ember)",
                  color: "#fff",
                  minHeight: "52px",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Confirmar y pagar $15.00"
                )}
              </button>

              <button
                onClick={handleCancelConfirm}
                disabled={submitting}
                className="pressable w-full py-3 font-semibold text-sm"
                style={{ color: "rgba(245,241,234,0.45)" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment open backdrop */}
      {paymentOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <button
            onClick={closeBackdrop}
            className="pressable mb-6 px-6 py-3 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </>
  )

  return (
    <>
      {typeof document !== "undefined" && createPortal(overlays, document.body)}
      {/* Spinner shown while btn-yappy is initializing internally (prevents "no disponible" flash) */}
      {!yappyVisible && (
        <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(245,241,234,0.45)" }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Cargando Yappy...
        </div>
      )}
      {/* Always in DOM once ready so web component can connect and resolve its internal state */}
      <div style={yappyVisible ? undefined : { visibility: "hidden", height: 0, overflow: "hidden" }}>
        {/* @ts-expect-error — btn-yappy is a custom web component */}
        <btn-yappy ref={btnRef} theme="dark" rounded="true" />
      </div>
    </>
  )
}
