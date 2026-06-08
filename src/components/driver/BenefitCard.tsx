"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Clock, QrCode, Loader2, XCircle, Navigation, Wrench, Zap, Utensils, Heart, Store } from "lucide-react"
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

const discountSuffix: Record<string, string> = {
  percentage: "de descuento",
  fixed: "de descuento",
  free_item: "",
  other: "",
}

function getCategoryStyle(category: string | null | undefined) {
  const c = (category ?? "").toLowerCase()
  if (c.includes("taller") || c.includes("mecanica") || c.includes("auto") || c.includes("chapisteri"))
    return { bg: "var(--ember-soft)", fg: "var(--ember)", Icon: Wrench }
  if (c.includes("combustible") || c.includes("gas") || c.includes("gasolina"))
    return { bg: "rgba(242,183,59,0.15)", fg: "oklch(0.5 0.1 82)", Icon: Zap }
  if (c.includes("comida") || c.includes("restaurante") || c.includes("food") || c.includes("aliment"))
    return { bg: "rgba(47,143,110,0.12)", fg: "var(--verde)", Icon: Utensils }
  if (c.includes("salud") || c.includes("health") || c.includes("medic"))
    return { bg: "rgba(99,102,241,0.1)", fg: "oklch(0.5 0.18 270)", Icon: Heart }
  return { bg: "var(--ember-soft)", fg: "var(--ember)", Icon: Store }
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

  const category = getCategoryStyle(benefit.partner_businesses?.category)
  const { Icon } = category
  const suffix = discountSuffix[benefit.discount_type] ?? ""

  return (
    <>
      {/* ─── PASS CARD ─── */}
      <div
        className="rounded-2xl relative"
        style={{
          backgroundColor: "var(--paper)",
          border: "1px solid var(--line)",
          boxShadow: "0 1px 3px rgba(15,27,61,0.04), 0 4px 16px rgba(15,27,61,0.05)",
        }}
      >
        {/* TOP — business + benefit info */}
        <div className="p-5 pb-4">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: category.bg }}
            >
              <Icon className="w-[18px] h-[18px]" style={{ color: category.fg }} />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="font-semibold uppercase"
                style={{ fontSize: "10px", color: "var(--mute)", letterSpacing: "0.12em" }}
              >
                {benefit.partner_businesses?.name ?? "Comercio aliado"}
              </p>
              <h3
                className="font-bold mt-0.5 leading-snug"
                style={{ fontSize: "16px", color: "var(--midnight)", letterSpacing: "-0.02em" }}
              >
                {benefit.title}
              </h3>

              {benefit.description && (
                <p className="text-xs leading-relaxed mt-1.5" style={{ color: "var(--mute)" }}>
                  {benefit.description}
                </p>
              )}

              <div className="mt-2 space-y-2">
                {benefit.valid_until && (
                  <p className="flex items-center gap-1" style={{ fontSize: "11px", color: "var(--mute)" }}>
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    Hasta {new Date(benefit.valid_until).toLocaleDateString("es-PA", { day: "2-digit", month: "short" })}
                  </p>
                )}
                {benefit.partner_businesses?.address && (
                  <div>
                    <p className="flex items-center gap-1 mb-2" style={{ fontSize: "11px", color: "var(--mute)" }}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {benefit.partner_businesses.address}
                    </p>
                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(benefit.partner_businesses.address)}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl font-semibold text-sm min-h-[44px]"
                      style={{
                        backgroundColor: "var(--bone-2)",
                        border: "1px solid var(--line)",
                        color: "var(--midnight)",
                        textDecoration: "none",
                        transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
                      }}
                      onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)" }}
                      onPointerUp={(e) => { e.currentTarget.style.transform = "" }}
                      onPointerLeave={(e) => { e.currentTarget.style.transform = "" }}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Ir con Waze
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE — discount hero block */}
        {benefit.discount_value && (
          <div
            className="mx-5 rounded-2xl py-6 text-center"
            style={{ backgroundColor: category.bg }}
          >
            <p
              className="font-black leading-none"
              style={{
                fontSize: "58px",
                color: category.fg,
                letterSpacing: "-0.035em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {benefit.discount_value}
            </p>
            {suffix && (
              <p
                className="mt-2 font-semibold uppercase"
                style={{ fontSize: "10px", color: category.fg, opacity: 0.6, letterSpacing: "0.14em" }}
              >
                {suffix}
              </p>
            )}
          </div>
        )}

        {benefit.terms && (
          <p className="px-5 pt-3 text-xs" style={{ color: "var(--mute)" }}>
            * {benefit.terms}
          </p>
        )}

        {/* TEAR LINE — separates pass info from activation zone */}
        {canUse && (
          <div className="relative mt-5" style={{ height: 0 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "1.5px",
                background:
                  "repeating-linear-gradient(to right, var(--line) 0, var(--line) 6px, transparent 6px, transparent 12px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -9,
                top: -8,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "var(--bone)",
                border: "1px solid var(--line)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -9,
                top: -8,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "var(--bone)",
                border: "1px solid var(--line)",
              }}
            />
          </div>
        )}

        {/* BOTTOM — activation CTA */}
        {canUse && (
          <div className="px-5 pt-5 pb-5">
            <button
              onClick={generateQR}
              disabled={generating}
              className="w-full rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[48px]"
              style={{
                backgroundColor: "var(--midnight)",
                color: "var(--bone)",
                transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)" }}
              onPointerUp={(e) => { e.currentTarget.style.transform = "" }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = "" }}
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando QR...</>
                : <><QrCode className="w-4 h-4" /> Usar este beneficio</>
              }
            </button>
          </div>
        )}
      </div>

      {/* ─── QR MODAL ─── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle
              className="text-center font-bold"
              style={{ color: "var(--midnight)", letterSpacing: "-0.02em" }}
            >
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
                  <div
                    className="w-full rounded-2xl py-5 text-center"
                    style={{ backgroundColor: category.bg }}
                  >
                    <p
                      className="font-black leading-none"
                      style={{ fontSize: "40px", color: category.fg, letterSpacing: "-0.03em" }}
                    >
                      {benefit.discount_value}
                    </p>
                    {suffix && (
                      <p
                        className="mt-1.5 font-semibold uppercase"
                        style={{ fontSize: "10px", color: category.fg, opacity: 0.65, letterSpacing: "0.14em" }}
                      >
                        {suffix}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-center text-sm" style={{ color: "var(--mute)" }}>
                  Muestra este QR al empleado del local para que lo escaneen.
                </p>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <XCircle className="w-10 h-10 mx-auto" style={{ color: "var(--ember)" }} />
                <p className="font-semibold" style={{ color: "var(--midnight)" }}>QR expirado</p>
                <p className="text-sm" style={{ color: "var(--mute)" }}>Genera uno nuevo para usar el beneficio.</p>
                <button
                  onClick={() => { setOpen(false); generateQR() }}
                  className="px-6 py-2.5 rounded-full font-semibold text-sm"
                  style={{
                    backgroundColor: "var(--ember)",
                    color: "#fff",
                    transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                  onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)" }}
                  onPointerUp={(e) => { e.currentTarget.style.transform = "" }}
                  onPointerLeave={(e) => { e.currentTarget.style.transform = "" }}
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
