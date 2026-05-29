import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight, AlertTriangle, Clock } from "lucide-react"
import DashboardAnimation from "@/components/driver/DashboardAnimation"
import SavingsCounter from "@/components/driver/SavingsCounter"

export default async function DriverDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ data: profile }, { data: subscription }, { data: monthlyRedemptions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*")
      .eq("driver_id", user.id).eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false }).limit(1).single(),
    supabase.from("benefit_redemptions")
      .select("benefits(savings_value, title), partner_businesses(name), redeemed_at")
      .eq("driver_id", user.id)
      .gte("redeemed_at", startOfMonth.toISOString())
      .order("redeemed_at", { ascending: false }),
  ])

  const totalSaved = monthlyRedemptions?.reduce((sum, r) => {
    const val = (r.benefits as { savings_value?: number } | null)?.savings_value ?? 0
    return sum + val
  }, 0) ?? 0

  const isVerified = profile?.status === "verified"
  const hasSubscription = !!subscription
  const expiresAt = subscription?.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("es-PA", { day: "2-digit", month: "long" })
    : null

  return (
    <DashboardAnimation>
      <div className="space-y-5">

        {/* Greeting */}
        <div className="pt-2" data-animate="greeting">
          <p className="eyebrow-muted mb-1">
            {new Date().toLocaleDateString("es-PA", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1
            className="font-bold"
            style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
          >
            Hola, {profile?.full_name?.split(" ")[0]}.
          </h1>
        </div>

        {/* Verification banner */}
        {!isVerified && (
          <div
            data-animate="hero"
            className="rounded-2xl p-5 flex items-start gap-4"
            style={{ backgroundColor: "var(--ember-soft)", border: "1px solid rgba(232,80,42,0.2)" }}
          >
            {profile?.status === "rejected"
              ? <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--ember)" }} />
              : <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--ember)" }} />
            }
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "var(--midnight)" }}>
                {profile?.status === "rejected" ? "Verificación rechazada" : "Verificación en proceso"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ember-2)" }}>
                {profile?.status === "rejected"
                  ? "Vuelve a enviar tu foto de perfil."
                  : "Revisamos tu solicitud en 24 horas."}
              </p>
            </div>
            {profile?.status === "rejected" && (
              <Link href="/driver/verify">
                <button
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "var(--ember)", color: "#fff" }}
                >
                  Reintentar
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Savings hero */}
        {hasSubscription ? (
          <div
            data-animate="hero"
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
          >
            <div
              className="absolute pointer-events-none"
              style={{
                right: "-20%", top: "-30%", width: "70%", height: "70%",
                background: "radial-gradient(circle, rgba(232,80,42,0.35), transparent 60%)",
              }}
            />
            <div className="relative">
              <p className="eyebrow mb-4" style={{ color: "rgba(245,241,234,0.5)", fontSize: "10px" }}>
                {new Date().toLocaleDateString("es-PA", { month: "long" }).toUpperCase()} · AHORRO ACUMULADO
              </p>

              <SavingsCounter
                value={totalSaved}
                color={totalSaved > 0 ? "var(--ember)" : "var(--bone)"}
              />

              {totalSaved === 0 ? (
                <p style={{ fontSize: "13px", color: "rgba(245,241,234,0.4)", marginTop: "8px" }}>
                  Usa tus primeros beneficios para empezar a acumular.
                </p>
              ) : (
                <p style={{ fontSize: "13px", color: "rgba(245,241,234,0.5)", marginTop: "8px" }}>
                  {monthlyRedemptions?.length} {monthlyRedemptions?.length === 1 ? "beneficio usado" : "beneficios usados"} este mes
                </p>
              )}

              <div className="flex items-end justify-between mt-6">
                <div>
                  <p className="font-mono-brand" style={{ fontSize: "10px", opacity: 0.4, letterSpacing: "0.1em" }}>
                    MEMBRESÍA ACTIVA HASTA
                  </p>
                  <p className="font-mono-brand font-medium mt-0.5" style={{ fontSize: "12px" }}>
                    {expiresAt}
                  </p>
                </div>
                <Link href="/driver/benefits">
                  <button
                    className="flex items-center gap-1.5 px-4 py-3 rounded-full font-semibold text-sm min-h-[44px]"
                    style={{ backgroundColor: "var(--ember)", color: "#fff" }}
                  >
                    Usar beneficios
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div
            data-animate="hero"
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: "var(--bone-2)", border: "1px dashed var(--line)" }}
          >
            <p className="font-semibold mb-2" style={{ color: "var(--midnight)" }}>
              Membresía inactiva
            </p>
            <p className="text-sm" style={{ color: "var(--mute)" }}>
              Tu membresía se activa automáticamente cuando el equipo de RidePerks verifique tu cuenta. Si ya pasaron 24 horas, escríbenos.
            </p>
          </div>
        )}

        {/* Recent redemptions */}
        {(monthlyRedemptions?.length ?? 0) > 0 && (
          <div>
            <p className="eyebrow-muted mb-3">ÚLTIMOS USOS</p>
            <div className="space-y-0">
              {monthlyRedemptions?.slice(0, 4).map((r, i) => {
                const benefit = r.benefits as { savings_value?: number; title?: string } | null
                const business = r.partner_businesses as { name?: string } | null
                return (
                  <div
                    key={i}
                    data-animate="row"
                    className="flex items-center justify-between py-3 border-b"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--midnight)" }}>
                        {benefit?.title}
                      </p>
                      <p className="font-mono-brand mt-0.5" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}>
                        {business?.name} · {new Date(r.redeemed_at).toLocaleDateString("es-PA")}
                      </p>
                    </div>
                    {benefit?.savings_value && (
                      <span
                        className="font-mono-brand font-semibold"
                        style={{ fontSize: "13px", color: "var(--verde)" }}
                      >
                        +B/. {benefit.savings_value.toFixed(2)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardAnimation>
  )
}
