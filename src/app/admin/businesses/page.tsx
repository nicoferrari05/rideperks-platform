import { createClient } from "@/lib/supabase/server"
import { Store } from "lucide-react"
import BusinessForm from "@/components/admin/BusinessForm"
import BusinessRowActions from "@/components/admin/BusinessRowActions"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

export default async function BusinessesAdminPage() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from("partner_businesses").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
            Comercios aliados
          </h1>
          <p className="eyebrow-muted mt-1">{businesses?.length ?? 0} REGISTRADOS</p>
        </div>
        <BusinessForm />
      </div>

      <div>
        <p className="eyebrow-muted mb-4 flex items-center gap-2">
          <Store className="w-3.5 h-3.5" />
          LISTA
        </p>
        {(businesses?.length ?? 0) === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--mute)" }}>
            No hay comercios aún. Crea el primero con el botón de arriba.
          </p>
        ) : (
          <StaggerEntrance selector=".list-row" stagger={0.05} y={14} duration={0.4}>
            <div>
              {businesses?.map((b) => (
                <div
                  key={b.id}
                  className="list-row row-interactive flex items-start justify-between gap-3 py-4 border-b flex-wrap"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                      style={{ backgroundColor: "var(--ember-soft)", color: "var(--ember)" }}
                    >
                      {b.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-medium text-sm" style={{ color: "var(--midnight)" }}>{b.name}</p>
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
                      <p className="text-xs" style={{ color: "var(--mute)" }}>
                        {b.category ?? "Sin categoría"}{b.address ? ` · ${b.address}` : ""}
                      </p>
                      {b.access_code && (
                        <p
                          className="font-mono-brand mt-1.5 inline-block px-2 py-0.5 rounded-lg"
                          style={{
                            fontSize: "11px",
                            letterSpacing: "0.1em",
                            backgroundColor: "var(--bone-2)",
                            color: "var(--midnight)",
                          }}
                        >
                          {b.access_code}
                        </p>
                      )}
                    </div>
                  </div>
                  <BusinessRowActions businessId={b.id} isActive={b.is_active} />
                </div>
              ))}
            </div>
          </StaggerEntrance>
        )}
      </div>
    </div>
  )
}
