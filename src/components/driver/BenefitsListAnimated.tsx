"use client"

import { useRef, useState, useMemo } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Wrench, Zap, Utensils, Heart, Store, LayoutGrid, type LucideIcon } from "lucide-react"
import BenefitCard from "./BenefitCard"
import type { Benefit } from "@/types/database"

gsap.registerPlugin(useGSAP)

type BenefitWithBusiness = Benefit & {
  partner_businesses?: {
    id: string
    name: string
    logo_url: string | null
    category: string | null
    address: string | null
  } | null
}

interface Props {
  benefits: BenefitWithBusiness[]
  driverId: string
  canUse: boolean
}

function getIconForCategory(category: string): LucideIcon {
  const c = category.toLowerCase()
  if (c.includes("taller") || c.includes("mecanica") || c.includes("auto") || c.includes("chapisteri")) return Wrench
  if (c.includes("combustible") || c.includes("gas") || c.includes("gasolina")) return Zap
  if (c.includes("comida") || c.includes("restaurante") || c.includes("food") || c.includes("aliment")) return Utensils
  if (c.includes("salud") || c.includes("health") || c.includes("medic")) return Heart
  return Store
}

export default function BenefitsListAnimated({ benefits, driverId, canUse }: Props) {
  const [activeCategory, setActiveCategory] = useState("todos")
  const containerRef = useRef<HTMLDivElement>(null)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    const cats: string[] = []
    for (const b of benefits) {
      const c = b.partner_businesses?.category
      if (c && !seen.has(c)) { seen.add(c); cats.push(c) }
    }
    return cats
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

      {/* ── Category filter chips (only if 2+ categories exist) ── */}
      {categories.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none", paddingBottom: "2px" }}
        >
          {/* "Todos" chip */}
          {(["todos"] as const).map(() => {
            const isActive = activeCategory === "todos"
            return (
              <button
                key="todos"
                onClick={() => setActiveCategory("todos")}
                className="flex items-center gap-1.5 rounded-full px-3.5 flex-shrink-0 font-semibold"
                style={{
                  fontSize: "12px",
                  height: "36px",
                  backgroundColor: isActive ? "var(--midnight)" : "transparent",
                  color: isActive ? "var(--bone)" : "var(--midnight)",
                  border: "1px solid",
                  borderColor: isActive ? "transparent" : "var(--line)",
                  transition: "background-color 180ms ease, color 180ms ease, border-color 180ms ease",
                }}
              >
                <LayoutGrid className="w-3 h-3" />
                Todos
                <span style={{ opacity: 0.55, fontWeight: 500 }}>({benefits.length})</span>
              </button>
            )
          })}

          {/* One chip per category */}
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            const CatIcon = getIconForCategory(cat)
            const count = benefits.filter((b) => b.partner_businesses?.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 rounded-full px-3.5 flex-shrink-0 font-semibold"
                style={{
                  fontSize: "12px",
                  height: "36px",
                  textTransform: "capitalize",
                  backgroundColor: isActive ? "var(--midnight)" : "transparent",
                  color: isActive ? "var(--bone)" : "var(--midnight)",
                  border: "1px solid",
                  borderColor: isActive ? "transparent" : "var(--line)",
                  transition: "background-color 180ms ease, color 180ms ease, border-color 180ms ease",
                }}
              >
                <CatIcon className="w-3 h-3" />
                {cat}
                <span style={{ opacity: 0.55, fontWeight: 500 }}>({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Benefit cards (key resets GSAP entrance on category switch) ── */}
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

    </div>
  )
}
