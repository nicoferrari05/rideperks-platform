import { createAdminClient } from "@/lib/supabase/admin"
import { CreditCard } from "lucide-react"
import Link from "next/link"
import SubscriptionForm from "@/components/admin/SubscriptionForm"
import SubscriptionRowActions from "@/components/admin/SubscriptionRowActions"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

const PAGE_SIZE = 50

const paymentLabel: Record<string, string> = {
  yappy: "Yappy", transfer: "Transferencia", cash: "Efectivo",
}

const statusConfig: Record<string, { label: string; dot: string }> = {
  active: { label: "Activa", dot: "var(--verde)" },
  expired: { label: "Expirada", dot: "var(--mute)" },
  cancelled: { label: "Cancelada", dot: "var(--ember)" },
}

export default async function SubscriptionsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  const supabase = createAdminClient()

  const [{ data: subscriptions, count: totalSubscriptions }, { data: verifiedDrivers }, { count: activeCount }] = await Promise.all([
    supabase.from("subscriptions")
      .select("*, profiles(id, full_name, phone, platform)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(start, end),
    supabase.from("profiles").select("id, full_name, phone")
      .eq("role", "driver").eq("status", "verified"),
    supabase.from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString()),
  ])

  const totalPages = Math.ceil((totalSubscriptions ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
            Membresías
          </h1>
          <p className="eyebrow-muted mt-1">
            {activeCount ?? 0} ACTIVAS · {totalSubscriptions ?? 0} TOTAL
          </p>
        </div>
        <SubscriptionForm drivers={verifiedDrivers ?? []} />
      </div>

      <div>
        <p className="eyebrow-muted mb-4 flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          HISTORIAL
        </p>
        {(subscriptions?.length ?? 0) === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--mute)" }}>
            No hay membresías aún. Activa la primera con el botón de arriba.
          </p>
        ) : (
          <StaggerEntrance selector=".list-row" stagger={0.05} y={14} duration={0.4}>
            <div>
              {subscriptions?.map((s) => {

                const isExpired = new Date(s.expires_at) < new Date()
                const effectiveStatus = isExpired && s.status === "active" ? "expired" : s.status
                const sc = statusConfig[effectiveStatus] ?? statusConfig.expired
                return (
                  <div
                    key={s.id}
                    className="list-row row-interactive flex items-start justify-between gap-3 py-3.5 border-b flex-wrap"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
                      >
                        {s.profiles?.full_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-medium text-sm" style={{ color: "var(--midnight)" }}>
                            {s.profiles?.full_name ?? "—"}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
                            <span className="text-xs" style={{ color: "var(--mute)" }}>{sc.label}</span>
                          </div>
                        </div>
                        <p className="font-mono-brand" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.04em" }}>
                          {new Date(s.starts_at).toLocaleDateString("es-PA")} → {new Date(s.expires_at).toLocaleDateString("es-PA")}
                          {s.amount ? ` · $${s.amount}` : ""}
                          {s.payment_method ? ` · ${paymentLabel[s.payment_method] ?? s.payment_method}` : ""}
                          {s.payment_reference ? ` · ${s.payment_reference}` : ""}
                        </p>
                      </div>
                    </div>
                    <SubscriptionRowActions subscriptionId={s.id} status={s.status} />
                  </div>
                )
              })}
            </div>
          </StaggerEntrance>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-5">
            <span className="text-xs" style={{ color: "var(--mute)" }}>
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}`}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: "var(--bone-2)", color: "var(--midnight)" }}
                >
                  ← Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?page=${page + 1}`}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
                >
                  Siguiente →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
