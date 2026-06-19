import { createClient } from "@/lib/supabase/server"
import { Store, TrendingUp } from "lucide-react"
import BusinessForm from "@/components/admin/BusinessForm"
import BusinessRowActions from "@/components/admin/BusinessRowActions"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

type BizStats = { total: number; monthly: number; drivers: Set<string> }

export default async function BusinessesAdminPage() {
  const supabase = await createClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ data: businesses }, { data: redemptions }] = await Promise.all([
    supabase.from("partner_businesses").select("*").order("created_at", { ascending: false }),
    supabase
      .from("benefit_redemptions")
      .select("driver_id, redeemed_at, business_id")
      .not("business_id", "is", null),
  ])

  // Aggregate stats per business
  const statsMap = new Map<string, BizStats>()
  redemptions?.forEach((r) => {
    if (!r.business_id) return
    if (!statsMap.has(r.business_id)) {
      statsMap.set(r.business_id, { total: 0, monthly: 0, drivers: new Set() })
    }
    const s = statsMap.get(r.business_id)!
    s.total++
    s.drivers.add(r.driver_id)
    if (new Date(r.redeemed_at) >= startOfMonth) s.monthly++
  })

  // Top 3 by monthly redemptions (for the highlight section)
  const topThisMonth = (businesses ?? [])
    .map((b) => ({ ...b, monthly: statsMap.get(b.id)?.monthly ?? 0 }))
    .filter((b) => b.monthly > 0)
    .sort((a, b) => b.monthly - a.monthly)
    .slice(0, 3)

  const monthLabel = new Date()
    .toLocaleDateString("es-PA", { month: "long" })
    .toUpperCase()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="font-bold"
            style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
          >
            Comercios aliados
          </h1>
          <p className="eyebrow-muted mt-1">{businesses?.length ?? 0} REGISTRADOS</p>
        </div>
        <BusinessForm />
      </div>

      {/* Top comercios este mes */}
      {topThisMonth.length > 0 && (
        <div>
          <p className="eyebrow-muted mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            TOP {monthLabel}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topThisMonth.map((b, i) => {
              const stats = statsMap.get(b.id)
              return (
                <div
                  key={b.id}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      backgroundColor: i === 0 ? "rgba(232,80,42,0.12)" : "var(--bone-2)",
                      color: i === 0 ? "var(--ember)" : "var(--mute)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--midnight)" }}>
                      {b.name}
                    </p>
                    <p className="font-mono-brand mt-0.5" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}>
                      {b.monthly} USOS · {stats?.drivers.size ?? 0} CONDUCTORES
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full list */}
      <div>
        <p className="eyebrow-muted mb-4 flex items-center gap-2">
          <Store className="w-3.5 h-3.5" />
          LISTA
        </p>
        {(businesses?.length ?? 0) === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--mute)" }}>
            No hay comercios aún. Crea el primero con el botón de arriba.
          </p>
        ) : (
          <StaggerEntrance selector=".list-row" stagger={0.05} y={14} duration={0.4}>
            <div>
              {businesses?.map((b) => {
                const stats = statsMap.get(b.id)
                const monthlyCount = stats?.monthly ?? 0
                const uniqueDrivers = stats?.drivers.size ?? 0
                const totalCount = stats?.total ?? 0

                return (
                  <div
                    key={b.id}
                    className="list-row row-interactive flex items-start justify-between gap-3 py-4 border-b flex-wrap"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                        style={{ backgroundColor: "var(--ember-soft)", color: "var(--ember)" }}
                      >
                        {b.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-medium text-sm" style={{ color: "var(--midnight)" }}>{b.name}</p>
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
                        <p className="text-xs" style={{ color: "var(--mute)" }}>
                          {b.category ?? "Sin categoría"}{b.address ? ` · ${b.address}` : ""}
                        </p>
                        {b.access_code && (
                          <p
                            className="font-mono-brand mt-1.5 inline-block px-2 py-0.5 rounded-lg"
                            style={{
                              fontSize: "11px",
                              letterSpacing: "0.1em",
                              backgroundColor: "var(--bone-2)",
                              color: "var(--midnight)",
                            }}
                          >
                            {b.access_code}
                          </p>
                        )}

                        {/* Redemption stats */}
                        <div className="flex items-center gap-3 mt-2">
                          {monthlyCount > 0 ? (
                            <span
                              className="font-mono-brand font-semibold"
                              style={{ fontSize: "11px", color: "var(--ember)", letterSpacing: "0.06em" }}
                            >
                              {monthlyCount} {monthlyCount === 1 ? "USO" : "USOS"} ESTE MES
                            </span>
                          ) : (
                            <span
                              className="font-mono-brand"
                              style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}
                            >
                              SIN ACTIVIDAD ESTE MES
                            </span>
                          )}
                          {uniqueDrivers > 0 && (
                            <span
                              className="font-mono-brand"
                              style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}
                            >
                              · {uniqueDrivers} {uniqueDrivers === 1 ? "CONDUCTOR" : "CONDUCTORES"}
                            </span>
                          )}
                          {totalCount > 0 && (
                            <span
                              className="font-mono-brand"
                              style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}
                            >
                              · {totalCount} TOTAL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <BusinessRowActions
                      businessId={b.id}
                      isActive={b.is_active}
                      accessCode={b.access_code ?? null}
                      name={b.name}
                      category={b.category ?? null}
                      address={b.address ?? null}
                      wazeUrl={(b as { waze_url?: string | null }).waze_url ?? null}
                      phone={b.phone ?? null}
                      description={b.description ?? null}
                    />
                  </div>
                )
              })}
            </div>
          </StaggerEntrance>
        )}
      </div>
    </div>
  )
}
