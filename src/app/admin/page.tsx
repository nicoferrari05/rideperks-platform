import { createClient } from "@/lib/supabase/server"
import { Users, Gift, Store, CreditCard, Clock, TrendingUp } from "lucide-react"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalDrivers },
    { count: pendingVerifications },
    { count: activeSubscriptions },
    { count: totalBenefits },
    { count: totalBusinesses },
    { count: monthlyRedemptions },
    { data: recentDrivers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "driver"),
    supabase.from("driver_verifications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active").gte("expires_at", new Date().toISOString()),
    supabase.from("benefits").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("partner_businesses").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("benefit_redemptions").select("*", { count: "exact", head: true }).gte("redeemed_at", new Date(new Date().setDate(1)).toISOString()),
    supabase.from("profiles").select("id, full_name, platform, status, created_at").eq("role", "driver").order("created_at", { ascending: false }).limit(5),
  ])

  const stats = [
    { label: "Conductores", value: totalDrivers ?? 0, icon: Users },
    { label: "Membresías activas", value: activeSubscriptions ?? 0, icon: CreditCard },
    { label: "Beneficios activos", value: totalBenefits ?? 0, icon: Gift },
    { label: "Comercios", value: totalBusinesses ?? 0, icon: Store },
    { label: "Usos este mes", value: monthlyRedemptions ?? 0, icon: TrendingUp },
    {
      label: "Verificaciones pendientes",
      value: pendingVerifications ?? 0,
      icon: Clock,
      urgent: (pendingVerifications ?? 0) > 0,
    },
  ]

  const platformLabel: Record<string, string> = {
    uber: "Uber", indrive: "InDrive", pedidosya: "PedidosYa", multiple: "Múltiple",
  }

  const statusConfig: Record<string, { label: string; dot: string }> = {
    pending: { label: "Pendiente", dot: "var(--sol)" },
    verified: { label: "Verificado", dot: "var(--verde)" },
    rejected: { label: "Rechazado", dot: "var(--ember)" },
    suspended: { label: "Suspendido", dot: "var(--mute)" },
  }

  return (
    <StaggerEntrance selector=".admin-section" stagger={0.1} y={20} duration={0.55}>
      <div className="space-y-8">
        <div className="admin-section">
          <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
            Dashboard
          </h1>
          <p className="eyebrow-muted mt-1">
            {new Date().toLocaleDateString("es-PA", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
          </p>
        </div>

        {/* Stats grid */}
        <div className="admin-section">
          <StaggerEntrance selector=".stat-card" stagger={0.06} y={18} duration={0.45} delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="stat-card card-interactive rounded-2xl p-5"
                  style={{
                    backgroundColor: s.urgent ? "var(--ember-soft)" : "var(--paper)",
                    border: `1px solid ${s.urgent ? "rgba(232,80,42,0.2)" : "var(--line)"}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <s.icon
                      className="w-4 h-4"
                      style={{ color: s.urgent ? "var(--ember)" : "var(--mute)" }}
                    />
                  </div>
                  <p
                    className="font-bold font-mono-brand"
                    style={{
                      fontSize: "36px",
                      letterSpacing: "-0.02em",
                      color: s.urgent ? "var(--ember)" : "var(--midnight)",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="mt-1.5 text-xs"
                    style={{ color: s.urgent ? "var(--ember-2)" : "var(--mute)" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </StaggerEntrance>
        </div>

        {/* Recent drivers */}
        <div className="admin-section">
          <p className="eyebrow-muted mb-4">CONDUCTORES RECIENTES</p>
          {(recentDrivers?.length ?? 0) === 0 ? (
            <p className="text-sm" style={{ color: "var(--mute)" }}>No hay conductores aún.</p>
          ) : (
            <StaggerEntrance selector=".recent-row" stagger={0.07} y={12} duration={0.4} delay={0.15}>
              <div className="space-y-0">
                {recentDrivers?.map((d) => {
                  const sc = statusConfig[d.status] ?? statusConfig.pending
                  return (
                    <div
                      key={d.id}
                      className="recent-row flex items-center justify-between py-3 border-b"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
                        >
                          {d.full_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--midnight)" }}>{d.full_name}</p>
                          <p className="font-mono-brand mt-0.5" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}>
                            {d.platform ? platformLabel[d.platform] : "—"} · {new Date(d.created_at).toLocaleDateString("es-PA")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.dot }} />
                        <span className="text-xs" style={{ color: "var(--mute)" }}>{sc.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </StaggerEntrance>
          )}
        </div>
      </div>
    </StaggerEntrance>
  )
}
