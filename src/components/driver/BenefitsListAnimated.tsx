"use client"

import { useRef, useState, useMemo } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Wrench, Zap, Utensils, Heart, Store, LayoutGrid, Fuel, Settings2, type LucideIcon } from "lucide-react"
import BenefitCard from "./BenefitCard"
import ReferralCard from "./ReferralCard"
import type { Benefit } from "@/types/database"

gsap.registerPlugin(useGSAP)

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
  referralCode: string | null
  referralCount: number
}

const COMBUSTIBLE = "__combustible__"

function isGasCategory(cat: string) {
  const c = cat.toLowerCase()
  return c.includes("combustible") || c.includes("gas") || c.includes("gasolina")
}

type ChipStyle = { bg: string; fg: string; activeBg: string; activeFg: string; Icon: LucideIcon }

function getCategoryChipStyle(category: string | null | undefined): ChipStyle {
  const c = (category ?? "").toLowerCase()
  if (c.includes("taller") || c.includes("mecanica") || c.includes("auto") || c.includes("chapisteri") || c.includes("mantenimiento") || c.includes("servicio") || c.includes("automotriz") || c.includes("vehiculo"))
    return { bg: "var(--ember-soft)", fg: "var(--ember)", activeBg: "var(--ember)", activeFg: "var(--bone)", Icon: Settings2 }
  if (c.includes("combustible") || c.includes("gas") || c.includes("gasolina"))
    return { bg: "rgba(242,183,59,0.18)", fg: "oklch(0.48 0.1 82)", activeBg: "oklch(0.48 0.1 82)", activeFg: "var(--bone)", Icon: Zap }
  if (c.includes("comida") || c.includes("restaurante") || c.includes("food") || c.includes("aliment"))
    return { bg: "rgba(47,143,110,0.14)", fg: "var(--verde)", activeBg: "var(--verde)", activeFg: "var(--bone)", Icon: Utensils }
  if (c.includes("salud") || c.includes("health") || c.includes("medic"))
    return { bg: "rgba(99,102,241,0.12)", fg: "oklch(0.48 0.18 270)", activeBg: "oklch(0.48 0.18 270)", activeFg: "var(--bone)", Icon: Heart }
  return { bg: "var(--ember-soft)", fg: "var(--ember)", activeBg: "var(--ember)", activeFg: "var(--bone)", Icon: Store }
}

const CATEGORY_ORDER = ["taller", "mecanica", "auto", "chapisteri", "combustible", "gas", "gasolina", "comida", "restaurante", "food", "aliment", "salud", "health", "medic"]
function categoryRank(cat: string) {
  const c = cat.toLowerCase()
  const i = CATEGORY_ORDER.findIndex((k) => c.includes(k))
  return i === -1 ? 999 : i
}

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)"

export default function BenefitsListAnimated({ benefits, driverId, canUse, referralCode, referralCount }: Props) {
  const [activeCategory, setActiveCategory] = useState("todos")
  const containerRef = useRef<HTMLDivElement>(null)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    const cats: string[] = []
    for (const b of benefits) {
      const c = b.partner_businesses?.category
      // Gas/combustible is handled by the hardcoded Combustible tab
      if (c && !seen.has(c) && !isGasCategory(c)) { seen.add(c); cats.push(c) }
    }
    return cats.sort((a, b) => categoryRank(a) - categoryRank(b))
  }, [benefits])

  const filtered = useMemo(
    () =>
      activeCategory === "todos"
        ? benefits
        : benefits.filter((b) => b.partner_businesses?.category === activeCategory),
    [benefits, activeCategory]
  )

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".benefit-card", {
          autoAlpha: 0, y: 16, duration: 0.26, stagger: 0.05, ease: "power2.out",
        })
      })
      return () => mm.revert()
    },
    { scope: containerRef, dependencies: [activeCategory] }
  )

  return (
    <div className="space-y-4">

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none", paddingBottom: "2px" }}>

          {/* "Todos" — neutral, no category color */}
          <button
            onClick={() => setActiveCategory("todos")}
            className="pressable flex items-center gap-1.5 rounded-full px-3.5 flex-shrink-0 font-semibold"
            style={{
              fontSize: "12px",
              height: "36px",
              backgroundColor: activeCategory === "todos" ? "var(--midnight)" : "transparent",
              color: activeCategory === "todos" ? "var(--bone)" : "var(--midnight)",
              border: "1px solid",
              borderColor: activeCategory === "todos" ? "transparent" : "var(--line)",
              transition: `background-color 200ms ${EASE}, color 200ms ${EASE}, border-color 200ms ${EASE}`,
            }}
          >
            <LayoutGrid className="w-3 h-3" />
            Todos
            <span style={{ opacity: 0.55, fontWeight: 500 }}>({benefits.length})</span>
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat
            const { bg, fg, activeBg, activeFg, Icon } = getCategoryChipStyle(cat)
            const count = benefits.filter((b) => b.partner_businesses?.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="pressable flex items-center gap-1.5 rounded-full px-3.5 flex-shrink-0 font-semibold"
                style={{
                  fontSize: "12px",
                  height: "36px",
                  textTransform: "capitalize",
                  backgroundColor: isActive ? activeBg : bg,
                  color: isActive ? activeFg : fg,
                  border: "none",
                  transition: `background-color 200ms ${EASE}, color 200ms ${EASE}`,
                }}
              >
                <Icon className="w-3 h-3" />
                {cat}
                <span style={{ opacity: isActive ? 0.7 : 0.55, fontWeight: 500 }}>({count})</span>
              </button>
            )
          })}

          {/* Combustible — always shown, powered by referral program */}
          <button
            onClick={() => setActiveCategory(COMBUSTIBLE)}
            className="pressable flex items-center gap-1.5 rounded-full px-3.5 flex-shrink-0 font-semibold"
            style={{
              fontSize: "12px",
              height: "36px",
              backgroundColor: activeCategory === COMBUSTIBLE ? "oklch(0.48 0.1 82)" : "rgba(242,183,59,0.18)",
              color: activeCategory === COMBUSTIBLE ? "var(--bone)" : "oklch(0.48 0.1 82)",
              border: "none",
              transition: `background-color 200ms ${EASE}, color 200ms ${EASE}`,
            }}
          >
            <Fuel className="w-3 h-3" />
            Combustible
          </button>
        </div>
      )}

      {activeCategory === COMBUSTIBLE ? (
        <div className="space-y-4">
          <div>
            <h2 className="font-bold" style={{ fontSize: "22px", letterSpacing: "-0.02em", color: "var(--midnight)" }}>
              Llévate un tanque lleno
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--mute)", lineHeight: 1.6 }}>
              Invita 3 conductores a RidePerks y gana tu próximo tanque gratis.
            </p>
          </div>
          <ReferralCard code={referralCode ?? ""} referralCount={referralCount} />
        </div>
      ) : (
        <div key={activeCategory} ref={containerRef} className="grid grid-cols-1 gap-4">
          {filtered.length === 0 ? (
            <p className="text-sm py-10 text-center" style={{ color: "var(--mute)" }}>
              No hay beneficios en esta categoría aún.
            </p>
          ) : (
            filtered.map((benefit) => (
              <div key={benefit.id} className="benefit-card">
                <BenefitCard benefit={benefit} driverId={driverId} canUse={canUse} />
              </div>
            ))
          )}
        </div>
      )}

    </div>
  )
}
