"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { Wrench, Zap, Utensils, Heart, Store, ChevronRight, Clock } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import BenefitCard from "./BenefitCard"
import type { Benefit } from "@/types/database"

type BenefitWithBusiness = Benefit & {
  partner_businesses?: {
    id: string
    name: string
    logo_url: string | null
    category: string | null
    address: string | null
    waze_url: string | null
  } | null
}

interface Props {
  benefits: BenefitWithBusiness[]
  driverId: string
  canUse: boolean
}

function getCategoryCardStyle(category: string | null | undefined) {
  const c = (category ?? "").toLowerCase()
  if (c.includes("taller") || c.includes("mecanica") || c.includes("auto") || c.includes("chapisteri"))
    return { gradient: "#E8502A, #FF7043", textColor: "#fff" as const, dim: "rgba(255,255,255,0.18)", Icon: Wrench }
  if (c.includes("combustible") || c.includes("gas") || c.includes("gasolina"))
    return { gradient: "#C08A1A, #F2B73B", textColor: "#0f1b3d" as const, dim: "rgba(15,27,61,0.25)", Icon: Zap }
  if (c.includes("comida") || c.includes("restaurante") || c.includes("food") || c.includes("aliment"))
    return { gradient: "#1E7A5C, #2F8F6E", textColor: "#fff" as const, dim: "rgba(255,255,255,0.18)", Icon: Utensils }
  if (c.includes("salud") || c.includes("health") || c.includes("medic"))
    return { gradient: "#3730A3, #6366F1", textColor: "#fff" as const, dim: "rgba(255,255,255,0.18)", Icon: Heart }
  return { gradient: "#E8502A, #FF7043", textColor: "#fff" as const, dim: "rgba(255,255,255,0.18)", Icon: Store }
}

function getBehindBg(category: string | null | undefined): string {
  const c = (category ?? "").toLowerCase()
  if (c.includes("taller") || c.includes("mecanica") || c.includes("auto") || c.includes("chapisteri"))
    return "#E8502A"
  if (c.includes("combustible") || c.includes("gas") || c.includes("gasolina"))
    return "#C08A1A"
  if (c.includes("comida") || c.includes("restaurante") || c.includes("food") || c.includes("aliment"))
    return "#1E7A5C"
  if (c.includes("salud") || c.includes("health") || c.includes("medic"))
    return "#3730A3"
  return "#E8502A"
}

const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const
const CARD_MIN_H = 220

const deckVariants = {
  enter: (d: number) => ({ x: d > 0 ? "80%" : "-80%", opacity: 0, scale: 0.94 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? "-80%" : "80%", opacity: 0, scale: 0.94 }),
}

export default function BenefitsDeck({ benefits, driverId, canUse }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitWithBusiness | null>(null)
  const wasDragged = useRef(false)

  const n = benefits.length

  if (n === 0) {
    return (
      <p className="text-sm py-10 text-center" style={{ color: "var(--mute)" }}>
        No hay beneficios en esta categoría aún.
      </p>
    )
  }

  const activeBenefit = benefits[current]
  const next1 = n > 1 ? benefits[(current + 1) % n] : null
  const next2 = n > 2 ? benefits[(current + 2) % n] : null
  const activeStyle = getCategoryCardStyle(activeBenefit.partner_businesses?.category)
  const { Icon } = activeStyle

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    wasDragged.current = Math.abs(info.offset.x) > 12
    if (n <= 1) return
    if (info.offset.x < -60 || info.velocity.x < -300) {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % n)
    } else if (info.offset.x > 60 || info.velocity.x > 300) {
      setDirection(-1)
      setCurrent((prev) => (prev - 1 + n) % n)
    }
  }

  function handleCardTap() {
    if (wasDragged.current) { wasDragged.current = false; return }
    setSelectedBenefit(activeBenefit)
  }

  const discountLabel =
    activeBenefit.discount_type === "percentage" ? "de descuento" :
    activeBenefit.discount_type === "fixed" ? "precio RidePerks" :
    activeBenefit.discount_type === "free_item" ? "gratis" : ""

  return (
    <div>
      {/* ── Deck stack ── */}
      <div style={{ position: "relative", minHeight: CARD_MIN_H + 36 }}>

        {/* Behind card 2 (deepest) */}
        {next2 && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: 24, left: "4%", right: "4%",
              height: CARD_MIN_H,
              borderRadius: "20px",
              background: `linear-gradient(135deg, ${getBehindBg(next2.partner_businesses?.category)}, ${getBehindBg(next2.partner_businesses?.category)}CC)`,
              opacity: 0.45,
              zIndex: 0,
            }}
          />
        )}

        {/* Behind card 1 */}
        {next1 && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: 12, left: "2%", right: "2%",
              height: CARD_MIN_H,
              borderRadius: "20px",
              background: `linear-gradient(135deg, ${getBehindBg(next1.partner_businesses?.category)}, ${getBehindBg(next1.partner_businesses?.category)}CC)`,
              opacity: 0.7,
              zIndex: 1,
            }}
          />
        )}

        {/* Front card — AnimatePresence */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${current}-${activeBenefit.id}`}
            custom={direction}
            variants={deckVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ ...SPRING, opacity: { duration: 0.15 } }}
            drag={n > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
            onClick={handleCardTap}
            style={{
              position: "relative", zIndex: 2,
              cursor: "pointer",
              borderRadius: "20px",
              background: `linear-gradient(135deg, ${activeStyle.gradient})`,
              minHeight: CARD_MIN_H,
              overflow: "hidden",
              userSelect: "none",
            }}
          >
            {/* Ambient glow overlay */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute", top: "-30%", right: "-20%",
                width: "60%", height: "60%",
                backgroundColor: "#fff",
                borderRadius: "50%",
                filter: "blur(48px)",
                opacity: 0.12,
                pointerEvents: "none",
              }}
            />

            <div style={{ padding: "28px 24px", position: "relative", display: "flex", flexDirection: "column", gap: "0", minHeight: CARD_MIN_H }}>

              {/* Eyebrow */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon style={{ width: "13px", height: "13px", color: activeStyle.dim, flexShrink: 0 }} />
                  <p style={{
                    fontSize: "10px", letterSpacing: "0.14em", fontFamily: "var(--font-mono)",
                    color: activeStyle.dim, textTransform: "uppercase", fontWeight: 600,
                  }}>
                    {activeBenefit.partner_businesses?.name ?? "Comercio aliado"}
                  </p>
                </div>
                {n > 1 && (
                  <p style={{ fontSize: "10px", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", color: activeStyle.dim }}>
                    {current + 1} / {n}
                  </p>
                )}
              </div>

              {/* Big discount value */}
              {activeBenefit.discount_value && (
                <div style={{ marginBottom: "6px" }}>
                  <p style={{
                    fontFamily: "var(--font-geist)",
                    fontSize: "clamp(52px, 9vw, 72px)",
                    fontWeight: 900,
                    letterSpacing: "-0.05em",
                    lineHeight: 0.9,
                    color: activeStyle.textColor,
                  }}>
                    {activeBenefit.discount_value}
                  </p>
                  {discountLabel && (
                    <p style={{
                      fontSize: "12px", letterSpacing: "0.1em", fontFamily: "var(--font-mono)",
                      color: activeStyle.dim, marginTop: "6px", textTransform: "uppercase",
                    }}>
                      {discountLabel}
                    </p>
                  )}
                </div>
              )}

              {/* Benefit title */}
              <p style={{
                fontSize: "clamp(15px, 2vw, 18px)", fontWeight: 700,
                color: activeStyle.textColor, marginTop: "10px",
                letterSpacing: "-0.01em", lineHeight: 1.3,
                opacity: 0.9,
              }}>
                {activeBenefit.title}
              </p>

              {/* Valid until */}
              {activeBenefit.valid_until && (
                <p style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  fontSize: "11px", color: activeStyle.dim,
                  marginTop: "8px",
                }}>
                  <Clock style={{ width: "10px", height: "10px", flexShrink: 0 }} />
                  Hasta {new Date(activeBenefit.valid_until).toLocaleDateString("es-PA", { day: "2-digit", month: "short" })}
                </p>
              )}

              {/* Bottom CTA hint */}
              <div style={{ flex: 1 }} />
              {canUse && (
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: `1px solid ${activeStyle.dim}`,
                  }}
                >
                  <p style={{
                    fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em",
                    color: activeStyle.textColor, textTransform: "uppercase",
                    fontFamily: "var(--font-geist)",
                  }}>
                    Toca para usar
                  </p>
                  <ChevronRight style={{ width: "16px", height: "16px", color: activeStyle.textColor, opacity: 0.8 }} />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe hint */}
      {n > 1 && (
        <p style={{
          textAlign: "center", marginTop: "12px",
          fontSize: "10px", letterSpacing: "0.1em",
          fontFamily: "var(--font-mono)", color: "var(--mute)",
          opacity: 0.6,
        }}>
          ← desliza para ver más
        </p>
      )}

      {/* BenefitCard Dialog */}
      <Dialog open={!!selectedBenefit} onOpenChange={(o) => { if (!o) setSelectedBenefit(null) }}>
        <DialogContent className="max-w-sm p-0 overflow-y-auto" style={{ maxHeight: "90dvh" }}>
          {selectedBenefit && (
            <BenefitCard
              benefit={selectedBenefit}
              driverId={driverId}
              canUse={canUse}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
