import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import DriverNav from "@/components/driver/DriverNav"
import ScrollToTop from "@/components/shared/ScrollToTop"
import YappyLoader from "@/components/driver/YappyLoader"
import WaitingRoom from "@/components/driver/WaitingRoom"

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("id")
      .eq("driver_id", user.id).eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .limit(1).single(),
  ])

  if (!profile) redirect("/login")
  if (profile.role === "admin") redirect("/admin")

  const isFullyActive = profile.status === "verified" && !!subscription

  if (!isFullyActive) {
    const adminClient = createAdminClient()
    const { data: benefitsData } = await adminClient
      .from("benefits")
      .select("savings_value, partner_businesses(id)")
      .eq("is_active", true)

    const savingsPotential = Math.round(
      (benefitsData ?? []).reduce(
        (sum, b) => sum + ((b as { savings_value?: number }).savings_value ?? 0),
        0
      ) * 100
    ) / 100

    const benefitCount = benefitsData?.length ?? 0
    const partnerCount = new Set(
      (benefitsData ?? [])
        .map(b => (b.partner_businesses as unknown as { id: string } | null)?.id)
        .filter(Boolean)
    ).size

    return (
      <WaitingRoom
        status={profile.status}
        phone={profile.phone ?? ""}
        savingsPotential={savingsPotential}
        benefitCount={benefitCount}
        partnerCount={partnerCount}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <YappyLoader />
      <ScrollToTop />
      <DriverNav profile={profile} />
      <main
        className="max-w-2xl mx-auto px-4 py-6"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </main>
    </div>
  )
}
