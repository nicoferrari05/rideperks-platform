import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight, AlertTriangle, Clock } from "lucide-react"
import DashboardAnimation from "@/components/driver/DashboardAnimation"
import DashboardHero from "@/components/driver/DashboardHero"

type BenefitPreview = {
  id: string
  title: string
  discount_value: string | null
  savings_value: number | null
  partner_businesses: { name: string } | null
}

export default async function DriverDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { data: profile },
    { data: subscription },
    { data: monthlyRedemptions },
    { data: allRedemptions },
    { data: activeBenefits },
  ] = await Promise.all([
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
    supabase.from("benefit_redemptions")
      .select("benefits(savings_value)")
      .eq("driver_id", user.id),
    supabase.from("benefits")
      .select("id, title, discount_value, savings_value, partner_businesses(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ])

  const benefits = (activeBenefits ?? []) as unknown as BenefitPreview[]

  const totalSaved = monthlyRedemptions?.reduce((sum, r) => {
    const val = (r.benefits as { savings_value?: number } | null)?.savings_value ?? 0
    return sum + val
  }, 0) ?? 0

  const lifetimeSaved = allRedemptions?.reduce((sum, r) => {
    const val = (r.benefits as { savings_value?: number } | null)?.savings_value ?? 0
    return sum + val
  }, 0) ?? 0

  const potentialMonthly = benefits.reduce((sum, b) => sum + (b.savings_value ?? 0), 0)

  const isVerified = profile?.status === "verified"
  const hasSubscription = !!subscription
  const expiresAt = subscription?.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("es-PA", { day: "2-digit", month: "long" })
    : null

  const daysUntilExpiry = subscription?.expires_at
    ? Math.floor((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000)
    : null

  const membershipCost = (subscription as { amount?: number } | null)?.amount ?? 15
  const roi = totalSaved > 0 ? totalSaved / membershipCost : 0

  const monthLabel = new Date()
    .toLocaleDateString("es-PA", { month: "long" })
    .toUpperCase()

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
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: "var(--ember-soft)", border: "1px solid rgba(232,80,42,0.2)" }}
          >
            {profile?.status === "rejected"
              ? <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ember)" }} />
              : <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ember)" }} />
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
                  className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "var(--ember)", color: "#fff" }}
                >
                  Reintentar
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Expiry warning — urgent (≤7 days) */}
        {hasSubscription && daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
          <div
            data-animate="hero"
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: "var(--ember-soft)", border: "1px solid rgba(232,80,42,0.25)" }}
          >
            <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ember)" }} />
            <p className="text-sm font-semibold flex-1" style={{ color: "var(--midnight)" }}>
              {daysUntilExpiry <= 1
                ? "Tu membresía vence mañana"
                : `Tu membresía vence en ${daysUntilExpiry} días`}
            </p>
            <span
              className="font-semibold flex-shrink-0"
              style={{ fontSize: "11px", color: "var(--ember)", letterSpacing: "0.04em" }}
            >
              Renueva ya
            </span>
          </div>
        )}

        {/* Savings hero */}
        {hasSubscription ? (
          <div data-animate="hero">
            <DashboardHero
              totalSaved={totalSaved}
              lifetimeSaved={lifetimeSaved}
              redemptionsThisMonth={monthlyRedemptions?.length ?? 0}
              totalRedemptions={allRedemptions?.length ?? 0}
              roi={roi}
              expiresAt={expiresAt}
              daysUntilExpiry={daysUntilExpiry}
              potentialMonthly={potentialMonthly}
              monthLabel={monthLabel}
            />
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

        {/* Benefits preview */}
        {benefits.length > 0 && (
          <div data-animate="row">
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow-muted">BENEFICIOS DISPONIBLES</p>
              <Link
                href="/driver/benefits"
                className="flex items-center gap-0.5 font-semibold"
                style={{ fontSize: "12px", color: "var(--ember)" }}
              >
                Ver todos
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
            >
              {benefits.slice(0, 3).map((benefit, i) => (
                <Link
                  key={benefit.id}
                  href="/driver/benefits"
                  className="flex items-center gap-3 px-4 py-3.5 pressable"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--line)" : "none",
                    textDecoration: "none",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--midnight)" }}>
                      {benefit.title}
                    </p>
                    {benefit.partner_businesses?.name && (
                      <p
                        className="font-mono-brand mt-0.5 truncate"
                        style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}
                      >
                        {benefit.partner_businesses.name.toUpperCase()}
                      </p>
                    )}
                  </div>
                  {benefit.discount_value && (
                    <span
                      className="font-mono-brand font-semibold flex-shrink-0 px-2.5 py-0.5 rounded-full"
                      style={{
                        fontSize: "11px",
                        backgroundColor: "var(--ember-soft)",
                        color: "var(--ember)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {benefit.discount_value}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--line)" }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent redemptions — empty state */}
        {hasSubscription && (monthlyRedemptions?.length ?? 0) === 0 && (
          <div data-animate="row">
            <p className="eyebrow-muted mb-3">ÚLTIMOS USOS</p>
            <div
              className="rounded-2xl p-5 text-center"
              style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: "var(--midnight)" }}>
                Aún no usaste ningún beneficio este mes
              </p>
              <p className="text-sm" style={{ color: "var(--mute)" }}>
                Cada uso suma a tu ahorro mensual.
              </p>
            </div>
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
                        +${benefit.savings_value.toFixed(2)}
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
