import { createClient } from "@/lib/supabase/server"
import { Gift } from "lucide-react"
import BenefitForm from "@/components/admin/BenefitForm"
import BenefitRowActions from "@/components/admin/BenefitRowActions"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

const discountTypeLabel: Record<string, string> = {
  percentage: "Porcentaje", fixed: "Monto fijo", free_item: "Artículo gratis", other: "Otro",
}

export default async function BenefitsAdminPage() {
  const supabase = await createClient()

  const [{ data: benefits }, { data: businesses }] = await Promise.all([
    supabase.from("benefits").select("*, partner_businesses(id, name)").order("created_at", { ascending: false }),
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
          <StaggerEntrance selector=".list-row" stagger={0.05} y={14} duration={0.4}>
            <div>
              {benefits?.map((b) => (
                <div
                  key={b.id}
                  className="list-row row-interactive flex items-start justify-between gap-3 py-4 border-b flex-wrap"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-sm" style={{ color: "var(--midnight)" }}>{b.title}</p>
                      {b.discount_value && (
                        <span
                          className="font-mono-brand text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "var(--ember-soft)", color: "var(--ember)" }}
                        >
                          {b.discount_value}
                        </span>
                      )}
                      <span
                        className="font-mono-brand text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: b.is_active ? "rgba(47,143,110,0.12)" : "var(--bone-2)",
                          color: b.is_active ? "var(--verde)" : "var(--mute)",
                        }}
                      >
                        {b.is_active ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-1 mb-0.5" style={{ color: "var(--mute)" }}>{b.description}</p>
                    <p className="font-mono-brand" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.04em" }}>
                      {b.partner_businesses?.name ?? "Sin comercio"} · {discountTypeLabel[b.discount_type] ?? b.discount_type}
                      {b.valid_until ? ` · Hasta ${new Date(b.valid_until).toLocaleDateString("es-PA")}` : ""}
                    </p>
                  </div>
                  <BenefitRowActions benefitId={b.id} isActive={b.is_active} />
                </div>
              ))}
            </div>
          </StaggerEntrance>
        )}
      </div>
    </div>
  )
}
