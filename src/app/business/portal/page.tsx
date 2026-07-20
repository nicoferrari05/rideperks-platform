import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StaggerEntrance from "@/components/shared/StaggerEntrance"
import BusinessPortalLogout from "@/components/business/BusinessPortalLogout"
import SavingsCounter from "@/components/driver/SavingsCounter"

type RedemptionRow = {
  driver_id: string
  redeemed_at: string
  benefits: { savings_value: number | null; rideperks_price: number | null } | null
}

export default async function BusinessPortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: business } = await supabase
    .from("partner_businesses")
    .select("id, name, category")
    .eq("owner_user_id", user.id)
    .single()

  if (!business) redirect("/login")

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const startOfLastMonth = new Date(startOfMonth)
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

  const { data: redemptions } = await supabase
    .from("benefit_redemptions")
    .select("driver_id, redeemed_at, benefits(savings_value, rideperks_price)")
    .eq("business_id", business.id)

  const all = (redemptions ?? []) as unknown as RedemptionRow[]
  const totalCount = all.length

  const monthly = all.filter((r) => new Date(r.redeemed_at) >= startOfMonth)
  const lastMonth = all.filter(
    (r) => new Date(r.redeemed_at) >= startOfLastMonth && new Date(r.redeemed_at) < startOfMonth
  )
  const monthlyCount = monthly.length
  const lastMonthCount = lastMonth.length
  const trend = lastMonthCount > 0
    ? Math.round(((monthlyCount - lastMonthCount) / lastMonthCount) * 100)
    : null

  const uniqueDriversAllTime = new Set(all.map((r) => r.driver_id)).size

  const driversBeforeThisMonth = new Set(
    all.filter((r) => new Date(r.redeemed_at) < startOfMonth).map((r) => r.driver_id)
  )
  const driversThisMonth = new Set(monthly.map((r) => r.driver_id))
  const newDriversThisMonth = [...driversThisMonth].filter((id) => !driversBeforeThisMonth.has(id)).length
  const recurringDriversThisMonth = driversThisMonth.size - newDriversThisMonth

  // Ahorro total — savings_value siempre está poblado (fuente confiable en todo el proyecto).
  const totalSaved = all.reduce((sum, r) => sum + (r.benefits?.savings_value ?? 0), 0)

  // Facturación — rideperks_price es opcional en el formulario de beneficios, así que
  // solo se suma sobre los canjes que sí lo tienen y se muestra la cobertura si es parcial.
  const redemptionsWithPrice = all.filter((r) => r.benefits?.rideperks_price != null)
  const totalRevenue = redemptionsWithPrice.reduce((sum, r) => sum + (r.benefits?.rideperks_price ?? 0), 0)
  const hasPartialRevenueCoverage = totalCount > 0 && redemptionsWithPrice.length < totalCount

  const monthLabel = new Date().toLocaleDateString("es-PA", { month: "long" }).toUpperCase()

  const kpis: { label: string; value: number; sub: string | null; subColor: string }[] = [
    {
      label: `CANJES ${monthLabel}`,
      value: monthlyCount,
      sub: trend !== null ? `${trend >= 0 ? "+" : ""}${trend}% vs. mes anterior` : null,
      subColor: trend !== null && trend < 0 ? "var(--ember)" : "var(--verde)",
    },
    { label: "CANJES TOTALES", value: totalCount, sub: null, subColor: "var(--mute)" },
    { label: "CONDUCTORES ÚNICOS", value: uniqueDriversAllTime, sub: null, subColor: "var(--mute)" },
    { label: "NUEVOS ESTE MES", value: newDriversThisMonth, sub: `${recurringDriversThisMonth} recurrentes`, subColor: "var(--mute)" },
  ]

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow-muted mb-1">PORTAL DE COMERCIO</p>
          <h1
            className="font-bold"
            style={{ fontSize: "26px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
          >
            {business.name}
          </h1>
          {business.category && (
            <p className="text-sm mt-0.5" style={{ color: "var(--mute)" }}>{business.category}</p>
          )}
        </div>
        <BusinessPortalLogout />
      </div>

      {/* Hero: ahorro total generado a conductores */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          backgroundColor: "var(--midnight)",
          color: "var(--bone)",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
      >
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            right: "-15%", top: "-25%", width: "48%", height: "48%",
            backgroundColor: "rgba(232,80,42,0.55)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.5,
            mixBlendMode: "overlay",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative">
          <p className="eyebrow" style={{ color: "rgba(245,241,234,0.5)", fontSize: "10px" }}>
            AHORRO TOTAL GENERADO A CONDUCTORES
          </p>
          <div style={{ marginTop: "8px" }}>
            <SavingsCounter value={totalSaved} color={totalSaved > 0 ? "var(--ember)" : "var(--bone)"} />
          </div>
          <p style={{ fontSize: "13px", color: "rgba(245,241,234,0.5)", marginTop: "4px" }}>
            {totalCount} {totalCount === 1 ? "beneficio usado en total" : "beneficios usados en total"}
          </p>
        </div>
      </div>

      {/* Accent: facturación generada */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
      >
        <p className="eyebrow-muted mb-2">FACTURACIÓN GENERADA A TRAVÉS DE RIDEPERKS</p>
        <p
          className="font-mono-brand font-bold"
          style={{ fontSize: "36px", letterSpacing: "-0.02em", lineHeight: 1, color: "var(--ember)" }}
        >
          ${totalRevenue.toFixed(2)}
        </p>
        {hasPartialRevenueCoverage && (
          <p className="text-xs mt-2" style={{ color: "var(--mute)" }}>
            Calculado sobre {redemptionsWithPrice.length} de {totalCount} canjes con precio cargado
          </p>
        )}
      </div>

      {/* Actividad */}
      <StaggerEntrance selector=".kpi-card" stagger={0.06} y={14} duration={0.4}>
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="kpi-card rounded-2xl p-4"
              style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
            >
              <p className="eyebrow-muted mb-2">{kpi.label}</p>
              <p className="font-bold" style={{ fontSize: "28px", color: "var(--midnight)" }}>
                {kpi.value}
              </p>
              {kpi.sub && (
                <p className="text-xs mt-1" style={{ color: kpi.subColor }}>
                  {kpi.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      </StaggerEntrance>

      {monthlyCount === 0 && (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
        >
          <p className="text-sm" style={{ color: "var(--mute)" }}>
            Aún no hay canjes este mes.
          </p>
        </div>
      )}
    </div>
  )
}
