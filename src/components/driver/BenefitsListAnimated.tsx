"use client"

import { useRef, useState, useMemo } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Wrench, Zap, Utensils, Heart, Store, Fuel, type LucideIcon } from "lucide-react"
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
const COMIDA = "__comida__"

function isGasCategory(cat: string) {
  const c = cat.toLowerCase()
  return c.includes("combustible") || c.includes("gas") || c.includes("gasolina")
}

type ChipStyle = { bg: string; fg: string; activeBg: string; activeFg: string; Icon: LucideIcon }

function getCategoryChipStyle(category: string | null | undefined): ChipStyle {
  const c = (category ?? "").toLowerCase()
  if (c.includes("taller") || c.includes("mecanica") || c.includes("auto") || c.includes("chapisteri") || c.includes("mantenimiento") || c.includes("servicio") || c.includes("automotriz") || c.includes("vehiculo"))
    return { bg: "var(--ember-soft)", fg: "var(--ember)", activeBg: "var(--ember)", activeFg: "var(--bone)", Icon: Wrench }
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

type Slide = {
  id: string
  label: string
  Icon: LucideIcon
  bg: string
  fg: string
  activeBg: string
  activeFg: string
}

export default function BenefitsListAnimated({ benefits, driverId, canUse, referralCode, referralCount }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    const cats: string[] = []
    for (const b of benefits) {
      const c = b.partner_businesses?.category
      if (c && !seen.has(c) && !isGasCategory(c)) { seen.add(c); cats.push(c) }
    }
    return cats.sort((a, b) => categoryRank(a) - categoryRank(b))
  }, [benefits])

  const slides: Slide[] = useMemo(() => [
    {
      id: COMIDA,
      label: "Comida",
      Icon: Utensils,
      bg: "rgba(47,143,110,0.14)",
      fg: "var(--verde)",
      activeBg: "var(--verde)",
      activeFg: "var(--bone)",
    },
    ...categories.map((cat) => {
      const { bg, fg, activeBg, activeFg, Icon } = getCategoryChipStyle(cat)
      return { id: cat, label: cat, Icon, bg, fg, activeBg, activeFg }
    }),
    {
      id: COMBUSTIBLE,
      label: "Combustible",
      Icon: Fuel,
      bg: "rgba(242,183,59,0.18)",
      fg: "oklch(0.48 0.1 82)",
      activeBg: "oklch(0.48 0.1 82)",
      activeFg: "var(--bone)",
    },
  ], [categories])

  // Default to first real category (index 1), or Comida if none
  const [activeIndex, setActiveIndex] = useState(() =>
    benefits.some(b => b.partner_businesses?.category && !isGasCategory(b.partner_businesses.category))
      ? 1
      : 0
  )

  useGSAP(() => {
    if (!trackRef.current) return
    if (isFirstRender.current) {
      // Snap to initial position without animation
      gsap.set(trackRef.current, { x: `-${activeIndex * 100}%` })
      isFirstRender.current = false
    } else {
      gsap.to(trackRef.current, {
        x: `-${activeIndex * 100}%`,
        duration: 0.45,
        ease: "power3.out",
      })
    }
  }, { dependencies: [activeIndex] })

  function goTo(index: number) {
    setActiveIndex(Math.max(0, Math.min(slides.length - 1, index)))
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY)
    // Only trigger on clear horizontal swipes
    if (Math.abs(dx) > 50 && Math.abs(dx) > dy * 1.5) {
      if (dx > 0) goTo(activeIndex + 1)
      else goTo(activeIndex - 1)
    }
  }

  return (
    <div className="space-y-4">

      {/* Navigation chips */}
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none", paddingBottom: "2px" }}>
        {slides.map((slide, i) => {
          const isActive = i === activeIndex
          return (
            <button
              key={slide.id}
              onClick={() => goTo(i)}
              className="pressable flex items-center gap-1.5 rounded-full px-3.5 flex-shrink-0 font-semibold"
              style={{
                fontSize: "12px",
                height: "36px",
                textTransform: "capitalize",
                backgroundColor: isActive ? slide.activeBg : slide.bg,
                color: isActive ? slide.activeFg : slide.fg,
                border: "none",
                transition: `background-color 200ms ${EASE}, color 200ms ${EASE}`,
              }}
            >
              <slide.Icon className="w-3 h-3" />
              {slide.label}
            </button>
          )
        })}
      </div>

      {/* Slides track */}
      <div
        className="overflow-hidden"
        style={{ touchAction: "pan-y" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{ willChange: "transform" }}
        >
          {slides.map((slide) => {
            const slideBenefits = benefits.filter(
              (b) => b.partner_businesses?.category === slide.id
            )
            return (
              <div key={slide.id} className="min-w-full space-y-4">
                {/* Slide header */}
                <div className="flex items-center gap-2">
                  <slide.Icon className="w-5 h-5" style={{ color: slide.fg }} />
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: "var(--midnight)",
                      textTransform: "capitalize",
                    }}
                  >
                    {slide.label}
                  </h2>
                  {slide.id !== COMIDA && slide.id !== COMBUSTIBLE && slideBenefits.length > 0 && (
                    <span style={{ fontSize: "13px", color: "var(--mute)", fontWeight: 500 }}>
                      · {slideBenefits.length}
                    </span>
                  )}
                </div>

                {/* Slide content */}
                {slide.id === COMIDA ? (
                  <div
                    className="rounded-2xl p-8 text-center"
                    style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
                  >
                    <p className="font-bold mb-1" style={{ fontSize: "22px", letterSpacing: "-0.02em", color: "var(--midnight)" }}>
                      Próximamente
                    </p>
                    <p className="text-sm" style={{ color: "var(--mute)" }}>
                      Estamos sumando restaurantes y opciones de comida para conductores.
                    </p>
                  </div>
                ) : slide.id === COMBUSTIBLE ? (
                  <div className="space-y-2">
                    <p className="text-sm" style={{ color: "var(--mute)", lineHeight: 1.6 }}>
                      Invita 3 conductores a RidePerks y gana tu próximo tanque gratis.
                    </p>
                    <ReferralCard code={referralCode ?? ""} referralCount={referralCount} />
                  </div>
                ) : slideBenefits.length === 0 ? (
                  <p className="text-sm py-10 text-center" style={{ color: "var(--mute)" }}>
                    No hay beneficios en esta categoría aún.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {slideBenefits.map((benefit) => (
                      <BenefitCard key={benefit.id} benefit={benefit} driverId={driverId} canUse={canUse} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
