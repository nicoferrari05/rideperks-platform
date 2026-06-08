import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Users } from "lucide-react"
import Link from "next/link"
import DriverActions from "@/components/admin/DriverActions"
import VerificationActions from "@/components/admin/VerificationActions"
import StaggerEntrance from "@/components/shared/StaggerEntrance"

const PAGE_SIZE = 50

const platformLabel: Record<string, string> = {
  uber: "Uber", indrive: "InDrive", pedidosya: "PedidosYa", multiple: "Múltiple",
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending: { label: "Pendiente", dot: "var(--sol)", bg: "rgba(242,183,59,0.15)", text: "oklch(0.5 0.1 82)" },
  verified: { label: "Verificado", dot: "var(--verde)", bg: "rgba(47,143,110,0.12)", text: "var(--verde)" },
  rejected: { label: "Rechazado", dot: "var(--ember)", bg: "var(--ember-soft)", text: "var(--ember-2)" },
  suspended: { label: "Suspendido", dot: "var(--mute)", bg: "var(--bone-2)", text: "var(--mute)" },
}

// driver-photos paths may be stored as full public URLs (legacy) or bare paths (new).
// This extracts the bare storage path in either case.
function extractStoragePath(photoUrl: string): string {
  const marker = "/object/public/driver-photos/"
  const idx = photoUrl.indexOf(marker)
  return idx !== -1 ? photoUrl.substring(idx + marker.length) : photoUrl
}

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const [{ data: drivers, count: totalDrivers }, { data: rawVerifications }] = await Promise.all([
    supabase.from("profiles")
      .select("*", { count: "exact" })
      .eq("role", "driver")
      .order("created_at", { ascending: false })
      .range(start, end),
    supabase.from("driver_verifications")
      .select("*, profiles(full_name, platform)")
      .eq("status", "pending").order("created_at", { ascending: false }),
  ])

  const totalPages = Math.ceil((totalDrivers ?? 0) / PAGE_SIZE)

  // Generate signed URLs so the admin can view private bucket photos
  const pendingVerifications = await Promise.all(
    (rawVerifications ?? []).map(async (v) => {
      if (!v.photo_url) return { ...v, signedPhotoUrl: null }
      const path = extractStoragePath(v.photo_url)
      const { data } = await adminSupabase.storage
        .from("driver-photos")
        .createSignedUrl(path, 3600)
      return { ...v, signedPhotoUrl: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
          Conductores
        </h1>
        <p className="eyebrow-muted mt-1">{drivers?.length ?? 0} REGISTRADOS</p>
      </div>

      {/* Pending verifications */}
      {(pendingVerifications?.length ?? 0) > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(242,183,59,0.3)", backgroundColor: "rgba(242,183,59,0.06)" }}
        >
          <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(242,183,59,0.2)" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--sol)" }} />
            <p className="font-semibold text-sm" style={{ color: "oklch(0.5 0.1 82)" }}>
              Verificaciones pendientes ({pendingVerifications?.length})
            </p>
          </div>
          <div className="p-5 space-y-4">
            {pendingVerifications?.map((v) => (
              <div
                key={v.id}
                className="rounded-xl p-5 space-y-4"
                style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--midnight)" }}>{v.profiles?.full_name}</p>
                    <p className="font-mono-brand mt-0.5" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}>
                      {v.platform ? platformLabel[v.platform] : "—"} · {new Date(v.created_at).toLocaleDateString("es-PA")}
                    </p>
                  </div>
                  <span
                    className="text-xs font-mono-brand px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "rgba(242,183,59,0.15)", color: "oklch(0.5 0.1 82)", letterSpacing: "0.08em" }}
                  >
                    PENDIENTE
                  </span>
                </div>
                {v.signedPhotoUrl && (
                  <img
                    src={v.signedPhotoUrl}
                    alt="Foto verificación"
                    className="max-h-48 w-auto rounded-xl object-contain"
                    style={{ border: "1px solid var(--line)" }}
                  />
                )}
                <VerificationActions verificationId={v.id} driverId={v.driver_id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All drivers */}
      <div>
        <p className="eyebrow-muted mb-4 flex items-center gap-2">
          <Users className="w-3.5 h-3.5" />
          TODOS LOS CONDUCTORES
        </p>
        {(drivers?.length ?? 0) === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--mute)" }}>
            No hay conductores registrados aún.
          </p>
        ) : (
          <StaggerEntrance selector=".list-row" stagger={0.05} y={14} duration={0.4}>
            <div>
              {drivers?.map((d) => {
                const sc = statusConfig[d.status] ?? statusConfig.pending
                return (
                  <div
                    key={d.id}
                    className="list-row row-interactive flex items-center justify-between py-3.5 border-b gap-3 flex-wrap"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
                      >
                        {d.full_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--midnight)" }}>{d.full_name}</p>
                        <p className="font-mono-brand mt-0.5" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.05em" }}>
                          {d.phone ?? "—"} · {d.platform ? platformLabel[d.platform] : "—"} · {new Date(d.created_at).toLocaleDateString("es-PA")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
                        <span className="text-xs" style={{ color: "var(--mute)" }}>{sc.label}</span>
                      </div>
                      <DriverActions driverId={d.id} currentStatus={d.status} />
                    </div>
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
