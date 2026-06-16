import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { User, Phone, Car, CheckCircle2, Clock, XCircle } from "lucide-react"
import type { ElementType } from "react"
import LogoutButton from "@/components/driver/LogoutButton"
import StaggerEntrance from "@/components/shared/StaggerEntrance"
import ReferralCard from "@/components/driver/ReferralCard"

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

  const [{ data: profile }, { data: subscription }, { data: redemptions }, { data: firstSubscription }, { count: referralCount }] = await Promise.all([
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
    supabase.from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user.id),
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

        {/* Membership */}
        <div
          data-stagger
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
        >
          <div className="px-5 pt-4 pb-2">
            <p className="eyebrow-muted">MEMBRESÍA</p>
          </div>
          {subscription ? (
            <>
              {([
                { label: "Estado",            value: "Activa",              color: "var(--verde)" },
                { label: "Vence",             value: new Date(subscription.expires_at).toLocaleDateString("es-PA", { day: "2-digit", month: "long", year: "numeric" }) },
                ...(memberSince ? [{ label: "Miembro desde", value: memberSince }] : []),
                { label: "Beneficios usados", value: String(redemptions?.length ?? 0) },
                ...(lifetimeSaved > 0 ? [{ label: "Ahorro total", value: `$${lifetimeSaved.toFixed(2)}`, color: "var(--verde)" }] : []),
              ] as { label: string; value: string; color?: string }[]).map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  <span className="text-sm" style={{ color: "var(--mute)" }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color: color ?? "var(--midnight)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <p
              className="px-5 py-4 text-sm"
              style={{ color: "var(--mute)", borderTop: "1px solid var(--line)" }}
            >
              Tu membresía se activa cuando el equipo de RidePerks verifique tu cuenta.
            </p>
          )}
        </div>

        {/* Referral program */}
        {profile?.referral_code && (
          <div data-stagger>
            <ReferralCard
              code={profile.referral_code}
              referralCount={referralCount ?? 0}
            />
          </div>
        )}

        <div data-stagger className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </StaggerEntrance>
  )
}
