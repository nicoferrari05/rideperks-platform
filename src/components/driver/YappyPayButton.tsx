"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"

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

export default function YappyPayButton() {
  const router = useRouter()
  const btnRef = useRef<YappyBtnElement | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

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

  const handleClick = useCallback(async () => {
    const btn = btnRef.current
    if (!btn) return
    btn.isButtonLoading = true
    try {
      const res = await fetch("/api/yappy/renew", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Error al procesar el pago")
        btn.isButtonLoading = false
        return
      }
      btn.isButtonLoading = false
      setPaymentOpen(true)
      btn.eventPayment(data)
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
      btn.isButtonLoading = false
    }
  }, [])

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

  return (
    <>
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
      {/* @ts-expect-error — btn-yappy is a custom web component */}
      <btn-yappy ref={btnRef} theme="dark" rounded="true" />
    </>
  )
}
