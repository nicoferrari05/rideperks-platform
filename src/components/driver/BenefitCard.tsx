"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Clock, QrCode, Loader2, XCircle } from "lucide-react"


import QRCode from "react-qr-code"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Benefit } from "@/types/database"

interface Props {
  benefit: Benefit & {
    partner_businesses?: {
      id: string; name: string; logo_url: string | null
      category: string | null; address: string | null
    } | null
  }
  driverId: string
  canUse: boolean
}

const discountTypeLabel: Record<string, string> = {
  percentage: "% de descuento",
  fixed: "de descuento",
  free_item: "",
  other: "",
}

export default function BenefitCard({ benefit, driverId, canUse }: Props) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  async function generateQR() {
    setGenerating(true)
    const supabase = createClient()
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000)

    const { data, error } = await supabase
      .from("qr_tokens")
      .insert({ driver_id: driverId, benefit_id: benefit.id, expires_at: expiresAt.toISOString() })
      .select().single()

    if (error || !data) {
      toast.error("No se pudo generar el QR. Intenta de nuevo.")
      setGenerating(false)
      return
    }

    setToken(data.token)
    setTimeLeft(2 * 60)
    setGenerating(false)
    setOpen(true)

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); setToken(null); return 0 }
        return t - 1
      })
    }, 1000)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    return `${m}:${(s % 60).toString().padStart(2, "0")}`
  }

  const discountLabel = benefit.discount_value
    ? `${benefit.discount_value} ${discountTypeLabel[benefit.discount_type] ?? ""}`.trim()
    : null

  return (
    <>
      <div
        className="card-interactive rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <div className="p-5">
          <div className="flex gap-4">
            <div
              className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-base"
              style={{ backgroundColor: "var(--ember-soft)", color: "var(--ember)" }}
            >
              {benefit.partner_businesses?.name?.[0]?.toUpperCase() ?? "?"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--midnight)" }}>
                  {benefit.title}
                </h3>
                {discountLabel && (
                  <span
                    className="font-mono-brand font-semibold flex-shrink-0 text-xs px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--ember-soft)", color: "var(--ember)" }}
                  >
                    {discountLabel}
                  </span>
                )}
              </div>

              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--mute)" }}>
                {benefit.description}
              </p>

              <div className="flex items-center gap-3 flex-wrap" style={{ fontSize: "11px", color: "var(--mute)" }}>
                {benefit.partner_businesses?.name && (
                  <span className="font-medium" style={{ color: "var(--midnight)" }}>
                    {benefit.partner_businesses.name}
                  </span>
                )}
                {benefit.partner_businesses?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {benefit.partner_businesses.address}
                  </span>
                )}
                {benefit.valid_until && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Hasta {new Date(benefit.valid_until).toLocaleDateString("es-PA", { day: "2-digit", month: "short" })}
                  </span>
                )}
              </div>

              {benefit.terms && (
                <p className="text-xs mt-2 italic" style={{ color: "var(--mute)" }}>{benefit.terms}</p>
              )}
            </div>
          </div>

          {(canUse || benefit.partner_businesses?.address) && (
            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: "1px solid var(--line)" }}>
              {canUse && (
                <button
                  onClick={generateQR}
                  disabled={generating}
                  className="pressable w-full rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
                  style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
                >
                  {generating
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generando QR...</>
                    : <><QrCode className="w-3.5 h-3.5" />Usar este beneficio</>
                  }
                </button>
              )}
              {benefit.partner_businesses?.address && (
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(benefit.partner_businesses.address)}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable block w-full"
                  style={{ textDecoration: "none" }}
                >
                  <img
                    src="/waze-btn.png"
                    alt="Ir con Waze"
                    className="w-full"
                    style={{ borderRadius: "16px", display: "block" }}
                  />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center font-semibold" style={{ color: "var(--midnight)", letterSpacing: "-0.02em" }}>
              {benefit.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-5 py-2">
            {token && timeLeft > 0 ? (
              <>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: "#fff", border: "1px solid var(--line)" }}>
                  <QRCode value={token} size={190} />
                </div>

                <div
                  className="flex items-center gap-2 text-sm font-mono-brand font-medium"
                  style={{ color: timeLeft < 60 ? "var(--ember)" : "var(--mute)" }}
                >
                  <Clock className="w-4 h-4" />
                  Expira en {formatTime(timeLeft)}
                </div>

                {benefit.discount_value && (
                  <div className="w-full rounded-2xl py-4 text-center" style={{ backgroundColor: "var(--ember-soft)" }}>
                    <p className="font-bold font-mono-brand" style={{ fontSize: "36px", color: "var(--ember)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                      {benefit.discount_value}
                    </p>
                    {discountTypeLabel[benefit.discount_type] && (
                      <p className="font-mono-brand mt-1" style={{ fontSize: "11px", color: "var(--ember)", opacity: 0.7, letterSpacing: "0.1em" }}>
                        {discountTypeLabel[benefit.discount_type].toUpperCase()}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-center text-sm" style={{ color: "var(--mute)" }}>
                  Muestra este QR al empleado del local para que lo escaneen.
                </p>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <XCircle className="w-12 h-12 mx-auto" style={{ color: "var(--ember)" }} />
                <p className="font-semibold" style={{ color: "var(--midnight)" }}>QR expirado</p>
                <p className="text-sm" style={{ color: "var(--mute)" }}>Genera uno nuevo para usar el beneficio.</p>
                <button
                  onClick={() => { setOpen(false); generateQR() }}
                  className="pressable px-6 py-2.5 rounded-full font-semibold text-sm"
                  style={{ backgroundColor: "var(--ember)", color: "#fff" }}
                >
                  Generar nuevo QR
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
