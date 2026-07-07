import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { User, Phone, Car, CheckCircle2, Clock, XCircle, CalendarDays, Zap, TrendingUp } from "lucide-react"
import type { ElementType } from "react"
import LogoutButton from "@/components/driver/LogoutButton"
import StaggerEntrance from "@/components/shared/StaggerEntrance"
import YappyPayButton from "@/components/driver/YappyPayButton"

const platformLabel: Record<string, string> = {
  uber: "Uber",
  indrive: "InDrive",
  pedidosya: "PedidosYa",
  multiple: "Varias plataformas",
}

const statusConfig: Record<string, { label: string; color: string; bg: string; Icon: ElementType }> = {
  pending: {
    label: "Verificación pendiente",
    color: "var(--sol)",
    bg: "rgba(201, 167, 53, 0.12)",
    Icon: Clock,
  },
  verified: {
    label: "Conductor verificado",
    color: "var(--verde)",
    bg: "rgba(47, 143, 110, 0.12)",
    Icon: CheckCircle2,
  },
  rejected: {
    label: "Verificación rechazada",
    color: "var(--ember)",
    bg: "var(--ember-soft)",
    Icon: XCircle,
  },
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: subscription }, { data: redemptions }, { data: firstSubscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*")
      .eq("driver_id", user.id).eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false }).limit(1).single(),
    supabase.from("benefit_redemptions")
      .select("benefits(savings_value)")
      .eq("driver_id", user.id),
    supabase.from("subscriptions")
      .select("starts_at")
      .eq("driver_id", user.id)
      .order("starts_at", { ascending: true })
      .limit(1).single(),
  ])

  const lifetimeSaved = redemptions?.reduce((sum, r) => {
    const val = (r.benefits as { savings_value?: number } | null)?.savings_value ?? 0
    return sum + val
  }, 0) ?? 0

  const memberSince = firstSubscription?.starts_at
    ? new Date(firstSubscription.starts_at).toLocaleDateString("es-PA", { day: "2-digit", month: "long", year: "numeric" })
    : null

  const sc = statusConfig[profile?.status ?? "pending"]
  const StatusIcon = sc.Icon

  const infoRows = [
    { Icon: User,  label: "Nombre",      value: profile?.full_name ?? "—" },
    { Icon: Phone, label: "Teléfono",    value: profile?.phone ?? "—" },
    { Icon: Car,   label: "Plataforma",  value: profile?.platform ? platformLabel[profile.platform] : "—" },
  ]

  return (
    <StaggerEntrance>
      <div className="space-y-5 pt-2">
        <h1
          data-stagger
          className="font-bold"
          style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
        >
          Mi perfil
        </h1>

        {/* Identity card */}
        <div
          data-stagger
          className="rounded-2xl p-5"
          style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0"
              style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
            >
              {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold" style={{ fontSize: "17px", color: "var(--midnight)", letterSpacing: "-0.01em" }}>
                {profile?.full_name}
              </p>
              <p className="text-sm mt-0.5 truncate" style={{ color: "var(--mute)" }}>
                {user.email}
              </p>
              <span
                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: sc.bg, color: sc.color }}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {sc.label}
              </span>
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div
          data-stagger
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
        >
          <div className="px-5 pt-4 pb-2">
            <p className="eyebrow-muted">INFORMACIÓN</p>
          </div>
          {infoRows.map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-4 px-5 py-3.5"
              style={{ borderTop: "1px solid var(--line)" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--bone-2)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--mute)" }} />
              </div>
              <div>
                <p className="font-mono-brand" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--mute)" }}>
                  {label.toUpperCase()}
                </p>
                <p className="text-sm font-medium mt-0.5" style={{ color: "var(--midnight)" }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Membership card */}
        <div
          data-stagger
          className="rounded-2xl relative overflow-hidden"
          style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
        >
          {/* Background glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              right: "-15%", top: "-25%", width: "55%", height: "55%",
              background: "radial-gradient(circle, rgba(232,80,42,0.3), transparent 60%)",
            }}
          />

          <div className="relative p-5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <p className="font-mono-brand" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(245,241,234,0.45)" }}>
                MEMBRESÍA
              </p>
              {subscription ? (
                <span
                  className="font-mono-brand font-semibold px-2.5 py-1 rounded-full"
                  style={{ fontSize: "10px", letterSpacing: "0.08em", backgroundColor: "rgba(47,143,110,0.2)", color: "var(--verde)" }}
                >
                  ACTIVA
                </span>
              ) : (
                <span
                  className="font-mono-brand font-semibold px-2.5 py-1 rounded-full"
                  style={{ fontSize: "10px", letterSpacing: "0.08em", backgroundColor: "rgba(232,80,42,0.18)", color: "var(--ember)" }}
                >
                  INACTIVA
                </span>
              )}
            </div>

            {subscription ? (
              <>
                {/* Expiry */}
                <p className="font-mono-brand" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(245,241,234,0.4)" }}>
                  ACTIVA HASTA
                </p>
                <p className="font-bold mt-1 mb-5" style={{ fontSize: "22px", letterSpacing: "-0.02em", color: "var(--bone)" }}>
                  {new Date(subscription.expires_at).toLocaleDateString("es-PA", { day: "2-digit", month: "long", year: "numeric" })}
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {memberSince && (
                    <div
                      className="rounded-xl p-3"
                      style={{ backgroundColor: "rgba(245,241,234,0.06)" }}
                    >
                      <CalendarDays className="w-3.5 h-3.5 mb-2" style={{ color: "rgba(245,241,234,0.4)" }} />
                      <p className="font-mono-brand" style={{ fontSize: "9px", letterSpacing: "0.08em", color: "rgba(245,241,234,0.4)" }}>DESDE</p>
                      <p className="font-semibold mt-0.5" style={{ fontSize: "11px", color: "var(--bone)" }}>
                        {new Date(firstSubscription!.starts_at).toLocaleDateString("es-PA", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  )}
                  <div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: "rgba(245,241,234,0.06)" }}
                  >
                    <Zap className="w-3.5 h-3.5 mb-2" style={{ color: "rgba(245,241,234,0.4)" }} />
                    <p className="font-mono-brand" style={{ fontSize: "9px", letterSpacing: "0.08em", color: "rgba(245,241,234,0.4)" }}>USOS</p>
                    <p className="font-semibold mt-0.5" style={{ fontSize: "11px", color: "var(--bone)" }}>
                      {redemptions?.length ?? 0}
                    </p>
                  </div>
                  {lifetimeSaved > 0 && (
                    <div
                      className="rounded-xl p-3"
                      style={{ backgroundColor: "rgba(245,241,234,0.06)" }}
                    >
                      <TrendingUp className="w-3.5 h-3.5 mb-2" style={{ color: "var(--verde)" }} />
                      <p className="font-mono-brand" style={{ fontSize: "9px", letterSpacing: "0.08em", color: "rgba(245,241,234,0.4)" }}>AHORRO</p>
                      <p className="font-semibold mt-0.5" style={{ fontSize: "11px", color: "var(--verde)" }}>
                        ${lifetimeSaved.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-5">
                <p className="font-semibold mb-1" style={{ fontSize: "17px", letterSpacing: "-0.01em", color: "var(--bone)" }}>
                  Sin membresía activa
                </p>
                <p className="text-sm" style={{ color: "rgba(245,241,234,0.45)" }}>
                  Activa tu membresía para acceder a descuentos en combustible, comida, talleres y más.
                </p>
              </div>
            )}

            {/* Yappy CTA */}
            <div
              className="flex flex-col items-center gap-2 pt-4"
              style={{ borderTop: "1px solid rgba(245,241,234,0.08)" }}
            >
              <p className="font-mono-brand" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(245,241,234,0.4)" }}>
                {subscription ? "RENOVAR · B/. 15.00" : "ACTIVAR · B/. 15.00"}
              </p>
              <YappyPayButton defaultPhone={profile?.phone ?? ""} />
            </div>
          </div>
        </div>

        <div data-stagger className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </StaggerEntrance>
  )
}
