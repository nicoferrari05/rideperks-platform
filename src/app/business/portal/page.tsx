import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StaggerEntrance from "@/components/shared/StaggerEntrance"
import BusinessPortalLogout from "@/components/business/BusinessPortalLogout"

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
    .select("driver_id, redeemed_at")
    .eq("business_id", business.id)

  const all = redemptions ?? []
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
