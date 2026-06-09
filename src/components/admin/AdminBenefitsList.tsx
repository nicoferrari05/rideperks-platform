"use client"

import { useState, useMemo } from "react"
import { Wrench, Zap, Utensils, Heart, Store, LayoutGrid, type LucideIcon } from "lucide-react"
import BenefitRowActions from "./BenefitRowActions"

type BenefitRow = {
  id: string
  title: string
  description: string
  discount_value: string | null
  discount_type: string
  is_active: boolean
  valid_until: string | null
  business_id: string | null
  terms: string | null
  usage_limit_per_driver: number | null
  savings_value?: number | null
  partner_businesses?: { id: string; name: string; category: string | null } | null
}

interface Props {
  benefits: BenefitRow[]
  businesses: { id: string; name: string }[]
}

const discountTypeLabel: Record<string, string> = {
  percentage: "Porcentaje", fixed: "Monto fijo", free_item: "Artículo gratis", other: "Otro",
}

// Mirrors getCategoryStyle() in BenefitCard — ember is the default/fallback
function getCategoryStyle(category: string | null | undefined) {
  const c = (category ?? "").toLowerCase()
  if (c.includes("taller") || c.includes("mecanica") || c.includes("auto") || c.includes("chapisteri"))
    return { bg: "var(--ember-soft)", fg: "var(--ember)", Icon: Wrench as LucideIcon }
  if (c.includes("combustible") || c.includes("gas") || c.includes("gasolina"))
    return { bg: "rgba(242,183,59,0.15)", fg: "oklch(0.5 0.1 82)", Icon: Zap as LucideIcon }
  if (c.includes("comida") || c.includes("restaurante") || c.includes("food") || c.includes("aliment"))
    return { bg: "rgba(47,143,110,0.12)", fg: "var(--verde)", Icon: Utensils as LucideIcon }
  if (c.includes("salud") || c.includes("health") || c.includes("medic"))
    return { bg: "rgba(99,102,241,0.1)", fg: "oklch(0.5 0.18 270)", Icon: Heart as LucideIcon }
  return { bg: "var(--ember-soft)", fg: "var(--ember)", Icon: Store as LucideIcon }
}

// Warm → cool sort order for chips
const CATEGORY_ORDER = ["taller", "mecanica", "auto", "chapisteri", "combustible", "gas", "gasolina", "comida", "restaurante", "food", "aliment", "salud", "health", "medic"]

function categoryRank(category: string): number {
  const c = category.toLowerCase()
  const idx = CATEGORY_ORDER.findIndex((k) => c.includes(k))
  return idx === -1 ? 999 : idx
}

export default function AdminBenefitsList({ benefits, businesses }: Props) {
  const [activeCategory, setActiveCategory] = useState("todos")

  const categories = useMemo(() => {
    const seen = new Set<string>()
    const cats: string[] = []
    for (const b of benefits) {
      const c = b.partner_businesses?.category
      if (c && !seen.has(c)) { seen.add(c); cats.push(c) }
    }
    return cats.sort((a, b) => categoryRank(a) - categoryRank(b))
  }, [benefits])

  const filtered = useMemo(() => {
    if (activeCategory === "todos") return benefits
    return benefits.filter((b) => b.partner_businesses?.category === activeCategory)
  }, [benefits, activeCategory])

  return (
    <div className="space-y-4">

      {/* ── Category chips — same styling as driver portal ── */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none", paddingBottom: "2px" }}>

          <button
            onClick={() => setActiveCategory("todos")}
            className="flex items-center gap-1.5 rounded-full px-3.5 flex-shrink-0 font-semibold"
            style={{
              fontSize: "12px",
              height: "36px",
              backgroundColor: activeCategory === "todos" ? "var(--midnight)" : "transparent",
              color: activeCategory === "todos" ? "var(--bone)" : "var(--midnight)",
              border: "1px solid",
              borderColor: activeCategory === "todos" ? "transparent" : "var(--line)",
              transition: "background-color 180ms ease, color 180ms ease, border-color 180ms ease",
            }}
          >
            <LayoutGrid className="w-3 h-3" />
            Todos
            <span style={{ opacity: 0.55, fontWeight: 500 }}>({benefits.length})</span>
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat
            const { Icon } = getCategoryStyle(cat)
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
                <Icon className="w-3 h-3" />
                {cat}
                <span style={{ opacity: 0.55, fontWeight: 500 }}>({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Benefits list ── */}
      <div>
        {filtered.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--mute)" }}>
            No hay beneficios en esta categoría.
          </p>
        ) : (
          filtered.map((b) => {
            const { bg, fg } = getCategoryStyle(b.partner_businesses?.category)
            return (
              <div
                key={b.id}
                className="flex items-start justify-between gap-3 py-4 border-b flex-wrap"
                style={{ borderColor: "var(--line)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-sm" style={{ color: "var(--midnight)" }}>{b.title}</p>
                    {b.discount_value && (
                      <span
                        className="font-bold rounded-full px-2.5 py-0.5"
                        style={{ fontSize: "11px", backgroundColor: bg, color: fg, letterSpacing: "-0.01em" }}
                      >
                        {b.discount_value}
                      </span>
                    )}
                    <span
                      className="font-mono-brand text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: b.is_active ? "rgba(47,143,110,0.12)" : "var(--bone-2)",
                        color: b.is_active ? "var(--verde)" : "var(--mute)",
                      }}
                    >
                      {b.is_active ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-1 mb-0.5" style={{ color: "var(--mute)" }}>
                    {b.description}
                  </p>
                  <p className="font-mono-brand" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.04em" }}>
                    {b.partner_businesses?.name ?? "Sin comercio"} · {discountTypeLabel[b.discount_type] ?? b.discount_type}
                    {b.valid_until ? ` · Hasta ${new Date(b.valid_until).toLocaleDateString("es-PA")}` : ""}
                  </p>
                </div>
                <BenefitRowActions
                  benefitId={b.id}
                  isActive={b.is_active}
                  title={b.title}
                  description={b.description}
                  businessId={b.business_id ?? null}
                  discountType={b.discount_type}
                  discountValue={b.discount_value ?? null}
                  savingsValue={b.savings_value ?? null}
                  terms={b.terms ?? null}
                  usageLimitPerDriver={b.usage_limit_per_driver ?? null}
                  validUntil={b.valid_until ?? null}
                  businesses={businesses}
                />
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
