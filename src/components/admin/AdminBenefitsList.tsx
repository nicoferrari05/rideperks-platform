"use client"

import { useState, useMemo } from "react"
import { LayoutGrid, Wrench, Zap, Utensils, Heart, type LucideIcon } from "lucide-react"
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

type CategoryConfig = {
  key: string
  label: string
  Icon: LucideIcon
  activeBg: string
  activeFg: string
  match: (c: string) => boolean
}

// Ordered warm → cool to match brand system
const CATEGORIES: CategoryConfig[] = [
  {
    key: "taller",
    label: "Taller / Auto",
    Icon: Wrench,
    activeBg: "var(--ember-soft)",
    activeFg: "var(--ember)",
    match: (c) => c.includes("taller") || c.includes("mecanica") || c.includes("auto") || c.includes("chapisteri"),
  },
  {
    key: "combustible",
    label: "Combustible",
    Icon: Zap,
    activeBg: "rgba(242,183,59,0.18)",
    activeFg: "oklch(0.48 0.1 82)",
    match: (c) => c.includes("combustible") || c.includes("gas") || c.includes("gasolina"),
  },
  {
    key: "comida",
    label: "Comida",
    Icon: Utensils,
    activeBg: "rgba(47,143,110,0.14)",
    activeFg: "var(--verde)",
    match: (c) => c.includes("comida") || c.includes("restaurante") || c.includes("food") || c.includes("aliment"),
  },
  {
    key: "salud",
    label: "Salud",
    Icon: Heart,
    activeBg: "rgba(99,102,241,0.12)",
    activeFg: "oklch(0.48 0.18 270)",
    match: (c) => c.includes("salud") || c.includes("health") || c.includes("medic"),
  },
]

function getCategoryConfig(category: string | null | undefined): CategoryConfig | null {
  const c = (category ?? "").toLowerCase()
  return CATEGORIES.find((cat) => cat.match(c)) ?? null
}

export default function AdminBenefitsList({ benefits, businesses }: Props) {
  const [activeCategory, setActiveCategory] = useState("todos")

  const availableCategories = useMemo(
    () => CATEGORIES.filter((cat) =>
      benefits.some((b) => cat.match((b.partner_businesses?.category ?? "").toLowerCase()))
    ),
    [benefits]
  )

  const filtered = useMemo(() => {
    if (activeCategory === "todos") return benefits
    const cat = CATEGORIES.find((c) => c.key === activeCategory)
    if (!cat) return benefits
    return benefits.filter((b) => cat.match((b.partner_businesses?.category ?? "").toLowerCase()))
  }, [benefits, activeCategory])

  return (
    <div className="space-y-4">

      {/* ── Category chips (only when 2+ categories exist) ── */}
      {availableCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none", paddingBottom: "2px" }}>

          {/* Todos */}
          <button
            onClick={() => setActiveCategory("todos")}
            className="flex items-center gap-1.5 rounded-full px-3.5 flex-shrink-0 font-semibold"
            style={{
              fontSize: "12px",
              height: "32px",
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

          {/* One chip per available category, warm → cool order */}
          {availableCategories.map((cat) => {
            const isActive = activeCategory === cat.key
            const count = benefits.filter((b) =>
              cat.match((b.partner_businesses?.category ?? "").toLowerCase())
            ).length
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="flex items-center gap-1.5 rounded-full px-3.5 flex-shrink-0 font-semibold"
                style={{
                  fontSize: "12px",
                  height: "32px",
                  backgroundColor: isActive ? cat.activeBg : "transparent",
                  color: isActive ? cat.activeFg : "var(--midnight)",
                  border: "1px solid",
                  borderColor: isActive ? "transparent" : "var(--line)",
                  transition: "background-color 180ms ease, color 180ms ease, border-color 180ms ease",
                }}
              >
                <cat.Icon className="w-3 h-3" />
                {cat.label}
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
            const catConfig = getCategoryConfig(b.partner_businesses?.category)
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
                        className="font-mono-brand text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: catConfig?.activeBg ?? "var(--ember-soft)",
                          color: catConfig?.activeFg ?? "var(--ember)",
                        }}
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
