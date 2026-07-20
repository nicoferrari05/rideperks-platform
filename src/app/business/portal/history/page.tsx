import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

type RedemptionRow = {
  id: string
  redeemed_at: string
  benefits: { title: string } | null
  profiles: { full_name: string } | null
}

type MonthGroup = {
  key: string
  label: string
  rows: RedemptionRow[]
}

export default async function BusinessHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: business } = await supabase
    .from("partner_businesses")
    .select("id, name")
    .eq("owner_user_id", user.id)
    .single()

  if (!business) redirect("/login")

  const [{ data: raw }, { count: benefitsCount }] = await Promise.all([
    supabase.from("benefit_redemptions")
      .select("id, redeemed_at, benefits(title), profiles(full_name)")
      .eq("business_id", business.id)
      .order("redeemed_at", { ascending: false }),
    supabase.from("benefits")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id),
  ])

  const redemptions = (raw ?? []) as unknown as RedemptionRow[]
  const showBenefitName = (benefitsCount ?? 0) > 1

  // Group by YYYY-MM
  const groupMap = new Map<string, MonthGroup>()
  const groups: MonthGroup[] = []

  for (const r of redemptions) {
    const d = new Date(r.redeemed_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("es-PA", { month: "long", year: "numeric" }).toUpperCase()
    if (!groupMap.has(key)) {
      const g: MonthGroup = { key, label, rows: [] }
      groupMap.set(key, g)
      groups.push(g)
    }
    groupMap.get(key)!.rows.push(r)
  }

  return (
    <StaggerEntrance>
      <div className="space-y-6 pt-2">

        {/* Header */}
        <div data-stagger>
          <Link
            href="/business/portal"
            className="inline-flex items-center gap-1 mb-4 font-semibold"
            style={{ fontSize: "13px", color: "var(--ember)", textDecoration: "none" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Portal
          </Link>
          <h1
            className="font-bold"
            style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
          >
            Historial de canjes
          </h1>
        </div>

        {/* Empty state */}
        {redemptions.length === 0 && (
          <div
            data-stagger
            className="rounded-2xl p-8 text-center space-y-3"
            style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <p className="font-semibold" style={{ color: "var(--midnight)" }}>
              Aún no hay canjes registrados
            </p>
            <p className="text-sm" style={{ color: "var(--mute)" }}>
              Cada vez que un conductor use un beneficio aquí, aparecerá en este historial.
            </p>
          </div>
        )}

        {/* Month groups */}
        {groups.map((group) => (
          <div key={group.key} data-stagger>
            <p className="eyebrow-muted mb-3">{group.label}</p>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
            >
              {group.rows.map((r, i) => {
                const driverName = r.profiles?.full_name ?? "Conductor"
                const benefitTitle = r.benefits?.title
                const date = new Date(r.redeemed_at).toLocaleDateString("es-PA", {
                  day: "2-digit",
                  month: "short",
                })
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderTop: i > 0 ? "1px solid var(--line)" : "none" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--midnight)" }}
                      >
                        {driverName}
                      </p>
                      <p
                        className="font-mono-brand mt-0.5 truncate"
                        style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}
                      >
                        {showBenefitName && benefitTitle ? `${benefitTitle.toUpperCase()} · ` : ""}
                        {date}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

      </div>
    </StaggerEntrance>
  )
}
