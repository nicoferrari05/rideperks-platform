import { createClient } from "@/lib/supabase/server"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

export default async function StatsPage() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    { data: allRedemptions },
    { data: monthlyRedemptions },
    { data: activeSubDriverIds },
    { data: topBenefitsRaw },
  ] = await Promise.all([
    // All-time redemptions with savings value
    supabase
      .from("benefit_redemptions")
      .select("driver_id, benefits(savings_value)"),
    // This month's redemptions
    supabase
      .from("benefit_redemptions")
      .select("driver_id, benefits(savings_value)")
      .gte("redeemed_at", startOfMonth.toISOString()),
    // Active subscription driver IDs
    supabase
      .from("subscriptions")
      .select("driver_id")
      .eq("status", "active")
      .gt("expires_at", now.toISOString()),
    // Top benefits by redemption count
    supabase
      .from("benefit_redemptions")
      .select("benefit_id, benefits(title, partner_businesses(name))"),
  ])

  // --- Calculations ---

  const activeDriverIds = new Set(activeSubDriverIds?.map((s) => s.driver_id) ?? [])
  const activeDriverCount = activeDriverIds.size

  // Total savings all time
  const lifetimeSaved = (allRedemptions ?? []).reduce((sum, r) => {
    return sum + ((r.benefits as { savings_value?: number } | null)?.savings_value ?? 0)
  }, 0)

  // Total savings this month
  const monthlySaved = (monthlyRedemptions ?? []).reduce((sum, r) => {
    return sum + ((r.benefits as { savings_value?: number } | null)?.savings_value ?? 0)
  }, 0)

  // Average monthly savings per active driver
  const avgPerDriver = activeDriverCount > 0 ? monthlySaved / activeDriverCount : 0

  // Drivers who redeemed at least once this month (engagement)
  const engagedDriverIds = new Set(monthlyRedemptions?.map((r) => r.driver_id) ?? [])
  const engagedCount = [...engagedDriverIds].filter((id) => activeDriverIds.has(id)).length
  const engagementRate = activeDriverCount > 0 ? Math.round((engagedCount / activeDriverCount) * 100) : 0

  // Top 5 benefits by redemption count
  const benefitCounts = new Map<string, { title: string; business: string; count: number }>()
  topBenefitsRaw?.forEach((r) => {
    if (!r.benefit_id) return
    const b = r.benefits as { title?: string; partner_businesses?: { name?: string } | null } | null
    if (!benefitCounts.has(r.benefit_id)) {
      benefitCounts.set(r.benefit_id, {
        title: b?.title ?? "—",
        business: b?.partner_businesses?.name ?? "—",
        count: 0,
      })
    }
    benefitCounts.get(r.benefit_id)!.count++
  })
  const topBenefits = [...benefitCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const monthLabel = now.toLocaleDateString("es-PA", { month: "long", year: "numeric" })

  const highlights = [
    {
      label: "Ahorro promedio / conductor activo",
      sublabel: `Este mes · ${monthLabel}`,
      value: `$${avgPerDriver.toFixed(2)}`,
      accent: true,
    },
    {
      label: "Ahorro total generado",
      sublabel: "Desde el inicio",
      value: `$${lifetimeSaved.toFixed(2)}`,
      accent: false,
    },
    {
      label: "Ahorro total este mes",
      sublabel: monthLabel,
      value: `$${monthlySaved.toFixed(2)}`,
      accent: false,
    },
    {
      label: "Conductores activos usando beneficios",
      sublabel: `${engagedCount} de ${activeDriverCount} este mes`,
      value: `${engagementRate}%`,
      accent: false,
    },
  ]

  return (
    <StaggerEntrance selector=".admin-section" stagger={0.1} y={20} duration={0.55}>
      <div className="space-y-8">

        {/* Header */}
        <div className="admin-section">
          <h1
            className="font-bold"
            style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
          >
            Estadísticas
          </h1>
          <p className="eyebrow-muted mt-1">
            {now.toLocaleDateString("es-PA", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
          </p>
        </div>

        {/* Highlight metrics */}
        <div className="admin-section">
          <p className="eyebrow-muted mb-4">MÉTRICAS CLAVE</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: h.accent ? "var(--midnight)" : "var(--paper)",
                  border: `1px solid ${h.accent ? "transparent" : "var(--line)"}`,
                }}
              >
                <p
                  className="text-xs mb-3"
                  style={{ color: h.accent ? "rgba(245,241,234,0.45)" : "var(--mute)" }}
                >
                  {h.sublabel}
                </p>
                <p
                  className="font-bold font-mono-brand"
                  style={{
                    fontSize: "36px",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    color: h.accent ? "var(--ember)" : "var(--midnight)",
                  }}
                >
                  {h.value}
                </p>
                <p
                  className="mt-2 text-sm font-medium"
                  style={{ color: h.accent ? "rgba(245,241,234,0.6)" : "var(--midnight)" }}
                >
                  {h.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top benefits */}
        <div className="admin-section">
          <p className="eyebrow-muted mb-4">BENEFICIOS MÁS USADOS</p>
          {topBenefits.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--mute)" }}>
              Aún no hay redenciones registradas.
            </p>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
            >
              {topBenefits.map((b, i) => (
                <div
                  key={b.title + i}
                  className="flex items-center gap-4 px-4 py-3.5"
                  style={{ borderTop: i > 0 ? "1px solid var(--line)" : "none" }}
                >
                  <span
                    className="font-mono-brand font-bold w-5 text-center flex-shrink-0"
                    style={{ fontSize: "13px", color: i === 0 ? "var(--ember)" : "var(--mute)" }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--midnight)" }}>
                      {b.title}
                    </p>
                    <p
                      className="font-mono-brand mt-0.5 truncate"
                      style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}
                    >
                      {b.business.toUpperCase()}
                    </p>
                  </div>
                  <span
                    className="font-mono-brand font-semibold flex-shrink-0"
                    style={{ fontSize: "13px", color: "var(--midnight)" }}
                  >
                    {b.count} {b.count === 1 ? "uso" : "usos"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </StaggerEntrance>
  )
}
