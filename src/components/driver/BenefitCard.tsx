"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, QrCode, Loader2, XCircle, Navigation, ArrowUpRight, Wrench, Zap, Utensils, Heart, Store, ChevronDown, Tag, Lock } from "lucide-react"
import QRCode from "react-qr-code"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Benefit } from "@/types/database"

interface Props {
  benefit: Benefit & {
    partner_businesses?: {
      id: string; name: string; logo_url: string | null
      category: string | null; address: string | null; waze_url: string | null
    } | null
  }
  driverId: string
  canUse: boolean
}

const discountLabel: Record<string, string> = {
  percentage: "de descuento",
  fixed: "precio RidePerks",
  free_item: "gratis",
  other: "",
}

function getCategoryStyle(category: string | null | undefined) {
  const c = (category ?? "").toLowerCase()
  if (c.includes("taller") || c.includes("mecanica") || c.includes("auto") || c.includes("chapisteri") || c.includes("mantenimiento") || c.includes("servicio") || c.includes("automotriz") || c.includes("vehiculo"))
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
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [termsOpen, setTermsOpen] = useState(false)
  const [pricesOpen, setPricesOpen] = useState(false)
  const [redeemed, setRedeemed] = useState(false)

  // Listen for the business scanning this QR in real-time
  useEffect(() => {
    if (!open || !token) return

    const supabase = createClient()
    const channel = supabase
      .channel(`redemption-${benefit.id}-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "benefit_redemptions",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload: { new: { benefit_id?: string } }) => {
          if (payload.new.benefit_id === benefit.id) {
            setRedeemed(true)
            router.refresh()
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [open, token, benefit.id, driverId, router])

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) setRedeemed(false)
  }

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
  const label = discountLabel[benefit.discount_type] ?? ""
  const address = benefit.partner_businesses?.address
  const wazeUrl = benefit.partner_businesses?.waze_url
  const hasAddress = !!(wazeUrl || address)

  return (
    <>
      {/* ─── CARD ─── */}
      <div
        className="rounded-2xl"
        style={{
          backgroundColor: "var(--paper)",
          border: "1px solid var(--line)",
          boxShadow: "0 1px 3px rgba(15,27,61,0.04), 0 4px 16px rgba(15,27,61,0.05)",
        }}
      >
        <div className="p-5 space-y-4">

          {/* EYEBROW: category icon + business · category + discount badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
              <Icon className="w-3 h-3 flex-shrink-0" style={{ color: category.fg }} />
              <p
                className="font-semibold uppercase truncate"
                style={{ fontSize: "10px", color: "var(--mute)", letterSpacing: "0.1em" }}
              >
                {benefit.partner_businesses?.name ?? "Comercio aliado"}
                {benefit.partner_businesses?.category && (
                  <> · {benefit.partner_businesses.category}</>
                )}
              </p>
            </div>

            {benefit.discount_value && (
              <span
                className="flex-shrink-0 font-bold rounded-full px-2.5 py-0.5"
                style={{
                  fontSize: "11px",
                  backgroundColor: category.bg,
                  color: category.fg,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {benefit.discount_value}
              </span>
            )}
          </div>

          {/* TITLE + DESCRIPTION */}
          <div className="space-y-1.5">
            <h3
              className="font-bold leading-snug"
              style={{ fontSize: "18px", color: "var(--midnight)", letterSpacing: "-0.02em" }}
            >
              {benefit.title}
            </h3>
            {benefit.description && (
              <p
                className="leading-relaxed"
                style={{ fontSize: "13px", color: "var(--mute)", lineHeight: "1.55" }}
              >
                {benefit.description}
              </p>
            )}
          </div>

          {/* SAVINGS MODULE */}
          {benefit.discount_value && benefit.discount_type !== "free_item" && (
            <div
              className="rounded-xl px-4 py-3.5"
              style={{ backgroundColor: category.bg }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="font-black font-mono-brand leading-none"
                    style={{
                      fontSize: "26px",
                      color: category.fg,
                      letterSpacing: "-0.03em",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {benefit.discount_value}
                  </p>
                  {label && (
                    <p
                      className="font-semibold uppercase mt-0.5"
                      style={{ fontSize: "10px", color: category.fg, opacity: 0.65, letterSpacing: "0.14em" }}
                    >
                      {label}
                    </p>
                  )}
                </div>

                {benefit.valid_until && (
                  <div
                    className="flex items-center gap-1"
                    style={{ fontSize: "11px", color: category.fg, opacity: 0.6 }}
                  >
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Hasta {new Date(benefit.valid_until).toLocaleDateString("es-PA", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VALID UNTIL — only when no savings module */}
          {(!benefit.discount_value || benefit.discount_type === "free_item") && benefit.valid_until && (
            <p className="flex items-center gap-1" style={{ fontSize: "11px", color: "var(--mute)" }}>
              <Clock className="w-3 h-3 flex-shrink-0" />
              Hasta {new Date(benefit.valid_until).toLocaleDateString("es-PA", { day: "2-digit", month: "short" })}
            </p>
          )}

          {/* ACTION BUTTONS */}
          {canUse ? (
            <div className="flex gap-2.5 pt-0.5">
              <button
                onClick={generateQR}
                disabled={generating}
                className="flex-1 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
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
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando...</>
                  : <><QrCode className="w-3.5 h-3.5" /> Ver QR</>
                }
              </button>

              {hasAddress && (
                <a
                  href={wazeUrl ?? `https://waze.com/ul?q=${encodeURIComponent(address!)}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl text-sm flex items-center justify-center gap-2 min-h-[44px]"
                  style={{
                    backgroundColor: "rgba(15,27,61,0.05)",
                    border: "1px solid rgba(15,27,61,0.14)",
                    color: "var(--midnight)",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                  onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)" }}
                  onPointerUp={(e) => { e.currentTarget.style.transform = "" }}
                  onPointerLeave={(e) => { e.currentTarget.style.transform = "" }}
                >
                  <Navigation className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                  <span>Ir con Waze</span>
                  <ArrowUpRight className="w-3 h-3" style={{ opacity: 0.4, flexShrink: 0 }} />
                </a>
              )}
            </div>
          ) : (
            <button
              disabled
              className="w-full rounded-xl font-semibold text-sm flex flex-col items-center justify-center gap-1.5 py-3.5 px-4 text-center"
              style={{
                backgroundColor: "var(--bone-2)",
                color: "var(--mute)",
                cursor: "default",
                minHeight: "52px",
                lineHeight: 1.4,
              }}
            >
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Activa tu membresía para canjear este beneficio</span>
            </button>
          )}

          {/* PRICE COMPARISON — collapsible, only when both prices set and membership active */}
          {canUse && benefit.regular_price != null && benefit.rideperks_price != null && (
            <div>
              <button
                onClick={() => setPricesOpen(!pricesOpen)}
                className="pressable flex items-center gap-1.5"
                style={{ fontSize: "12px", color: "var(--mute)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                <Tag className="w-3 h-3" />
                Ver precios
                <ChevronDown
                  className="w-3.5 h-3.5"
                  style={{
                    transition: "transform 220ms cubic-bezier(0.23, 1, 0.32, 1)",
                    transform: pricesOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: pricesOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 220ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div
                    className="mt-3 rounded-xl px-4 py-3 space-y-2"
                    style={{ backgroundColor: "var(--bone-2)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: "var(--mute)" }}>Precio regular</span>
                      <span
                        className="text-sm font-medium font-mono-brand"
                        style={{
                          color: "var(--mute)",
                          textDecoration: "line-through",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        ${benefit.regular_price.toFixed(2)}
                      </span>
                    </div>

                    <div style={{ height: "1px", backgroundColor: "var(--line)" }} />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: "var(--midnight)" }}>Precio RidePerks</span>
                      <span
                        className="font-bold font-mono-brand"
                        style={{
                          fontSize: "16px",
                          color: "var(--midnight)",
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        ${benefit.rideperks_price.toFixed(2)}
                      </span>
                    </div>

                    {benefit.regular_price > benefit.rideperks_price && (
                      <div
                        className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{ backgroundColor: "rgba(47,143,110,0.1)" }}
                      >
                        <span className="text-xs font-semibold" style={{ color: "var(--verde)" }}>Ahorras</span>
                        <span
                          className="text-sm font-bold font-mono-brand"
                          style={{
                            color: "var(--verde)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          ${(benefit.regular_price - benefit.rideperks_price).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TERMS: collapsible, always visible, below action buttons */}
          {benefit.terms && (
            <div>
              <button
                onClick={() => setTermsOpen(!termsOpen)}
                className="pressable flex items-center gap-1.5"
                style={{
                  fontSize: "12px",
                  color: "var(--mute)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                Ver condiciones
                <ChevronDown
                  className="w-3.5 h-3.5"
                  style={{
                    transition: "transform 220ms cubic-bezier(0.23, 1, 0.32, 1)",
                    transform: termsOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: termsOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 220ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <p
                    className="mt-2 leading-relaxed"
                    style={{ fontSize: "12px", color: "var(--mute)" }}
                  >
                    {benefit.terms}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── QR MODAL ─── */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
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
            {redeemed ? (
              <div className="flex flex-col items-center gap-5 py-4 w-full" style={{ animation: "validoIn 0.45s cubic-bezier(0.23, 1, 0.32, 1) forwards" }}>
                <style>{`
                  @keyframes validoIn {
                    from { opacity: 0; transform: scale(0.92) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                  }
                  @keyframes validoCheck {
                    from { opacity: 0; transform: scale(0.75); }
                    to   { opacity: 1; transform: scale(1); }
                  }
                `}</style>
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: "96px", height: "96px",
                    backgroundColor: "var(--verde)",
                    animation: "validoCheck 0.55s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                  }}
                >
                  <span style={{ fontSize: "48px", lineHeight: 1, color: "#fff" }}>✓</span>
                </div>
                <p
                  className="font-bold font-mono-brand"
                  style={{ fontSize: "40px", letterSpacing: "0.1em", color: "var(--verde)", lineHeight: 1 }}
                >
                  VÁLIDO
                </p>
                {benefit.discount_value && (
                  <div
                    className="w-full rounded-2xl py-5 text-center"
                    style={{ backgroundColor: "rgba(47,143,110,0.1)" }}
                  >
                    <p
                      className="font-black font-mono-brand leading-none"
                      style={{ fontSize: "36px", color: "var(--verde)", letterSpacing: "-0.03em" }}
                    >
                      {benefit.discount_value}
                    </p>
                    {label && (
                      <p
                        className="mt-1.5 font-semibold uppercase"
                        style={{ fontSize: "10px", color: "var(--verde)", opacity: 0.65, letterSpacing: "0.14em" }}
                      >
                        {label}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-center text-sm" style={{ color: "var(--mute)" }}>
                  Descuento validado. ¡Disfrútalo!
                </p>
              </div>
            ) : token && timeLeft > 0 ? (
              <>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: "#fff", border: "1px solid var(--line)" }}>
                  <QRCode value={token} size={190} />
                </div>

                <div
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{
                    color: timeLeft < 60 ? "var(--ember)" : "var(--mute)",
                    fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                  }}
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
                      className="font-black font-mono-brand leading-none"
                      style={{
                        fontSize: "40px",
                        color: category.fg,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {benefit.discount_value}
                    </p>
                    {label && (
                      <p
                        className="mt-1.5 font-semibold uppercase"
                        style={{ fontSize: "10px", color: category.fg, opacity: 0.65, letterSpacing: "0.14em" }}
                      >
                        {label}
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
