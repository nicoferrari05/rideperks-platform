import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { unstable_cache } from "next/cache"
import { redirect } from "next/navigation"
import { Map } from "lucide-react"
import Link from "next/link"
import BenefitsListAnimated from "@/components/driver/BenefitsListAnimated"
import PaymentBanner from "@/components/driver/PaymentBanner"
import SavingsProgressBar from "@/components/driver/SavingsProgressBar"

// Beneficios activos: iguales para todos los conductores, cambian solo cuando
// el admin agrega o edita uno. Se cachean 5 minutos para evitar una query
// por cada conductor que abre la pantalla.
const getActiveBenefits = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("benefits")
      .select("*, partner_businesses(id, name, logo_url, category, address, waze_url)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
    return data ?? []
  },
  ["active-benefits"],
  { revalidate: 300, tags: ["active-benefits"] }
)

export default async function BenefitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ data: profile }, { data: subscription }, benefits, { data: monthlyRaw }, { count: referralCount }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*")
      .eq("driver_id", user.id).eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .limit(1).single(),
    getActiveBenefits(),
    supabase.from("benefit_redemptions")
      .select("benefits(savings_value)")
      .eq("driver_id", user.id)
      .gte("redeemed_at", startOfMonth.toISOString()),
    supabase.from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user.id),
  ])

  const monthlySaved = (monthlyRaw ?? []).reduce((sum, r) => {
    return sum + ((r.benefits as { savings_value?: number } | null)?.savings_value ?? 0)
  }, 0)

  const isVerified = profile?.status === "verified"
  const canUse = isVerified && !!subscription

  const catalogPotential = benefits?.reduce((sum, b) => {
    return sum + ((b as { savings_value?: number }).savings_value ?? 0)
  }, 0) ?? 0

  return (
    <div className="space-y-5">
      <div className="pt-2 pb-1">
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow-muted">BENEFICIOS</p>
          <Link
            href="/driver/directory"
            className="pressable inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold"
            style={{
              fontSize: "12px",
              backgroundColor: "var(--midnight)",
              color: "var(--bone)",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            <Map className="w-3.5 h-3.5" />
            Ver mapa
          </Link>
        </div>

        <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
          Beneficios
        </h1>
        {(benefits?.length ?? 0) > 0 && (
          <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
            {benefits?.length ?? 0}{" "}
            {(benefits?.length ?? 0) === 1 ? "disponible" : "disponibles"}
          </p>
        )}
        {catalogPotential > 0 && (
          <div className="mt-3">
            <SavingsProgressBar
              current={monthlySaved}
              max={catalogPotential}
              variant="mini"
            />
          </div>
        )}
      </div>

      {!canUse && <PaymentBanner phone={profile?.phone ?? ""} />}

      {(benefits?.length ?? 0) > 0 ? (
        <BenefitsListAnimated
          benefits={benefits!}
          driverId={user.id}
          canUse={canUse}
          referralCode={profile?.referral_code ?? null}
          referralCount={referralCount ?? 0}
        />
      ) : (
        <div className="text-center py-20">
          <p className="font-semibold mb-1" style={{ color: "var(--midnight)" }}>Próximamente más beneficios</p>
          <p className="text-sm" style={{ color: "var(--mute)" }}>Estamos sumando comercios aliados.</p>
        </div>
      )}
    </div>
  )
}
