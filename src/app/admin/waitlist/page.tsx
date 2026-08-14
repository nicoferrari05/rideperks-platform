import { createAdminClient } from "@/lib/supabase/admin"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

export default async function WaitlistAdminPage() {
  const supabase = createAdminClient()

  const { data: signups } = await supabase
    .from("waitlist_signups")
    .select("id, full_name, email, phone, platform, referral_code, referral_count, created_at")
    .order("referral_count", { ascending: false })
    .order("created_at", { ascending: true })

  const rows = signups ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
          Lista de espera
        </h1>
        <p className="eyebrow-muted mt-1">{rows.length} CONDUCTORES ANOTADOS</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: "var(--mute)" }}>
          Todavía no hay nadie anotado.
        </p>
      ) : (
        <StaggerEntrance selector=".list-row" stagger={0.04} y={12} duration={0.35}>
          <div>
            {rows.map((r, i) => (
              <div
                key={r.id}
                className="list-row flex items-start justify-between gap-3 py-3.5 border-b flex-wrap"
                style={{ borderColor: "var(--line)" }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-medium text-sm" style={{ color: "var(--midnight)" }}>{r.full_name}</p>
                      <span className="font-mono-brand" style={{ fontSize: "10px", color: "var(--mute)", letterSpacing: "0.06em" }}>
                        {r.referral_code}
                      </span>
                    </div>
                    <p className="font-mono-brand truncate" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.04em" }}>
                      {r.email}{r.phone ? ` · ${r.phone}` : ""}{r.platform ? ` · ${r.platform.toUpperCase()}` : ""}
                    </p>
                  </div>
                </div>
                <span
                  className="font-mono-brand font-semibold flex-shrink-0"
                  style={{ fontSize: "12px", color: r.referral_count > 0 ? "var(--verde)" : "var(--mute)" }}
                >
                  {r.referral_count} {r.referral_count === 1 ? "referido" : "referidos"}
                </span>
              </div>
            ))}
          </div>
        </StaggerEntrance>
      )}
    </div>
  )
}
