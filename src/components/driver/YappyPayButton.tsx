"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Script from "next/script"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

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

export default function YappyPayButton() {
  const router = useRouter()
  const [scriptReady, setScriptReady] = useState(false)
  const btnRef = useRef<YappyBtnElement | null>(null)

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
      btn.eventPayment(data)
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
      btn.isButtonLoading = false
    }
  }, [])

  const handleSuccess = useCallback(() => {
    toast.success("¡Pago recibido! Tu membresía estará activa en unos segundos.")
    setTimeout(() => router.refresh(), 3000)
  }, [router])

  const handleError = useCallback((e: Event) => {
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
    if (!scriptReady) return
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
  }, [scriptReady, handleClick, handleSuccess, handleError])

  return (
    <>
      <Script
        src="https://bt-cdn.yappy.cloud/v1/cdn/web-component-btn-yappy.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div className="flex justify-center py-1">
        {scriptReady ? (
          // @ts-expect-error — yappy-btn is a custom web component
          <yappy-btn ref={btnRef} theme="light" rounded="true" />
        ) : (
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--mute)" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando...
          </div>
        )}
      </div>
    </>
  )
}
