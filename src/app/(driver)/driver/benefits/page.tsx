import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { unstable_cache } from "next/cache"
import { redirect } from "next/navigation"
import { Lock } from "lucide-react"
import Link from "next/link"
import BenefitsListAnimated from "@/components/driver/BenefitsListAnimated"

// Beneficios activos: iguales para todos los conductores, cambian solo cuando
// el admin agrega o edita uno. Se cachean 5 minutos para evitar una query
// por cada conductor que abre la pantalla.
const getActiveBenefits = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("benefits")
      .select("*, partner_businesses(id, name, logo_url, category, address)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
    return data ?? []
  },
  ["active-benefits"],
  { revalidate: 300 }
)

export default async function BenefitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: subscription }, benefits] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*")
      .eq("driver_id", user.id).eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .limit(1).single(),
    getActiveBenefits(),
  ])

  const isVerified = profile?.status === "verified"
  const canUse = isVerified && !!subscription

  const catalogPotential = benefits?.reduce((sum, b) => {
    return sum + ((b as { savings_value?: number }).savings_value ?? 0)
  }, 0) ?? 0

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
          Beneficios
        </h1>
        <p className="eyebrow-muted mt-1">
          {benefits?.length ?? 0} BENEFICIOS ACTIVOS
        </p>
        {catalogPotential > 0 && (
          <p className="text-sm font-medium mt-1" style={{ color: "var(--ember)" }}>
            Ahorra hasta ${catalogPotential.toFixed(2)} al mes
          </p>
        )}
      </div>

      {!canUse && (
        <div
          className="rounded-2xl p-6 text-center space-y-3"
          style={{ backgroundColor: "var(--bone-2)", border: "1px dashed var(--line)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "var(--bone)" }}
          >
            <Lock className="w-5 h-5" style={{ color: "var(--mute)" }} />
          </div>
          <p className="font-semibold" style={{ color: "var(--midnight)" }}>
            {!isVerified ? "Cuenta en revisión" : "Membresía inactiva"}
          </p>
          <p className="text-sm" style={{ color: "var(--mute)" }}>
            {!isVerified
              ? "Estamos revisando tu cuenta. En menos de 24 horas quedas activo y puedes usar todos los beneficios."
              : "Tu membresía venció. Contacta al equipo de RidePerks para renovarla."}
          </p>
          {!isVerified && (
            <Link href="/driver/verify">
              <button
                className="px-5 py-2.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: "var(--ember)", color: "#fff" }}
              >
                Ver mi verificación
              </button>
            </Link>
          )}
        </div>
      )}

      {(benefits?.length ?? 0) > 0 ? (
        <BenefitsListAnimated
          benefits={benefits!}
          driverId={user.id}
          canUse={canUse}
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
