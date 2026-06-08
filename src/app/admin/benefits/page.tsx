import { createClient } from "@/lib/supabase/server"
import { Gift } from "lucide-react"
import BenefitForm from "@/components/admin/BenefitForm"
import AdminBenefitsList from "@/components/admin/AdminBenefitsList"

export default async function BenefitsAdminPage() {
  const supabase = await createClient()

  const [{ data: benefits }, { data: businesses }] = await Promise.all([
    supabase.from("benefits").select("*, partner_businesses(id, name, category)").order("created_at", { ascending: false }),
    supabase.from("partner_businesses").select("id, name").eq("is_active", true),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
            Beneficios
          </h1>
          <p className="eyebrow-muted mt-1">{benefits?.length ?? 0} CREADOS</p>
        </div>
        <BenefitForm businesses={businesses ?? []} />
      </div>

      <div>
        <p className="eyebrow-muted mb-4 flex items-center gap-2">
          <Gift className="w-3.5 h-3.5" />
          LISTA
        </p>
        {(benefits?.length ?? 0) === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--mute)" }}>
            No hay beneficios aún. Crea el primero con el botón de arriba.
          </p>
        ) : (
          <AdminBenefitsList
            benefits={(benefits ?? []).map((b) => ({
              ...b,
              savings_value: (b as { savings_value?: number }).savings_value ?? null,
              partner_businesses: b.partner_businesses
                ? { ...b.partner_businesses, category: (b.partner_businesses as { category?: string | null }).category ?? null }
                : null,
            }))}
            businesses={businesses ?? []}
          />
        )}
      </div>
    </div>
  )
}
