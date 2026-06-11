import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

type RedemptionRow = {
  id: string
  redeemed_at: string
  benefits: {
    title: string
    savings_value: number | null
    partner_businesses: { name: string } | null
  } | null
}

type MonthGroup = {
  key: string
  label: string
  total: number
  rows: RedemptionRow[]
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: raw } = await supabase
    .from("benefit_redemptions")
    .select("id, redeemed_at, benefits(title, savings_value, partner_businesses(name))")
    .eq("driver_id", user.id)
    .order("redeemed_at", { ascending: false })

  const redemptions = (raw ?? []) as unknown as RedemptionRow[]

  // Group by YYYY-MM
  const groupMap = new Map<string, MonthGroup>()
  const groups: MonthGroup[] = []

  for (const r of redemptions) {
    const d = new Date(r.redeemed_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("es-PA", { month: "long", year: "numeric" }).toUpperCase()
    if (!groupMap.has(key)) {
      const g: MonthGroup = { key, label, total: 0, rows: [] }
      groupMap.set(key, g)
      groups.push(g)
    }
    const g = groupMap.get(key)!
    g.rows.push(r)
    g.total += r.benefits?.savings_value ?? 0
  }

  const lifetimeTotal = redemptions.reduce((s, r) => s + (r.benefits?.savings_value ?? 0), 0)

  return (
    <StaggerEntrance>
      <div className="space-y-6 pt-2">

        {/* Header */}
        <div data-stagger>
          <Link
            href="/driver/dashboard"
            className="inline-flex items-center gap-1 mb-4 font-semibold"
            style={{ fontSize: "13px", color: "var(--ember)", textDecoration: "none" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Inicio
          </Link>
          <h1
            className="font-bold"
            style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
          >
            Historial
          </h1>
        </div>

        {/* Lifetime hero */}
        {lifetimeTotal > 0 && (
          <div
            data-stagger
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ backgroundColor: "var(--midnight)" }}
          >
            <div
              className="absolute pointer-events-none"
              style={{
                right: "-15%", top: "-40%", width: "60%", height: "60%",
                background: "radial-gradient(circle, rgba(232,80,42,0.3), transparent 65%)",
              }}
            />
            <div className="relative">
              <p
                className="eyebrow"
                style={{ fontSize: "10px", color: "rgba(245,241,234,0.5)" }}
              >
                AHORRO TOTAL ACUMULADO
              </p>
              <p
                className="font-bold font-mono-brand leading-none mt-2"
                style={{ fontSize: "48px", color: "var(--ember)", letterSpacing: "-0.03em" }}
              >
                ${lifetimeTotal.toFixed(2)}
              </p>
              <p className="text-sm mt-2" style={{ color: "rgba(245,241,234,0.5)" }}>
                {redemptions.length}{" "}
                {redemptions.length === 1 ? "beneficio usado" : "beneficios usados"} en total
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {redemptions.length === 0 && (
          <div
            data-stagger
            className="rounded-2xl p-8 text-center space-y-3"
            style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <p className="font-semibold" style={{ color: "var(--midnight)" }}>
              Aún no usaste ningún beneficio
            </p>
            <p className="text-sm" style={{ color: "var(--mute)" }}>
              Cada uso queda registrado aquí con el ahorro generado.
            </p>
            <Link href="/driver/benefits">
              <button
                className="pressable inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-semibold text-sm mt-1"
                style={{ backgroundColor: "var(--ember)", color: "#fff" }}
              >
                Ver beneficios disponibles
              </button>
            </Link>
          </div>
        )}

        {/* Month groups */}
        {groups.map((group) => (
          <div key={group.key} data-stagger>
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow-muted">{group.label}</p>
              {group.total > 0 && (
                <span
                  className="font-mono-brand font-semibold"
                  style={{ fontSize: "13px", color: "var(--verde)" }}
                >
                  +${group.total.toFixed(2)}
                </span>
              )}
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
            >
              {group.rows.map((r, i) => {
                const benefit = r.benefits
                const businessName = benefit?.partner_businesses?.name
                const savings = benefit?.savings_value
                const date = new Date(r.redeemed_at).toLocaleDateString("es-PA", {
                  day: "2-digit",
                  month: "short",
                })
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderTop: i > 0 ? "1px solid var(--line)" : "none" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--midnight)" }}
                      >
                        {benefit?.title ?? "Beneficio"}
                      </p>
                      <p
                        className="font-mono-brand mt-0.5 truncate"
                        style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}
                      >
                        {businessName ? `${businessName.toUpperCase()} · ` : ""}
                        {date}
                      </p>
                    </div>
                    {savings != null && savings > 0 && (
                      <span
                        className="font-mono-brand font-semibold flex-shrink-0"
                        style={{ fontSize: "13px", color: "var(--verde)" }}
                      >
                        +${savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

      </div>
    </StaggerEntrance>
  )
}
