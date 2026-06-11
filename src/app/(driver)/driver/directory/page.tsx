import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Navigation } from "lucide-react"
import DirectoryMapClient from "@/components/driver/DirectoryMapClient"

export default async function DirectoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: raw } = await supabase
    .from("partner_businesses")
    .select("id, name, category, address, latitude, longitude")
    .eq("is_active", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("name")

  const businesses = (raw ?? []) as {
    id: string
    name: string
    category: string | null
    address: string | null
    latitude: number
    longitude: number
  }[]

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100dvh - 130px)" }}>

      {/* Header */}
      <div className="pt-2 pb-4">
        <Link
          href="/driver/benefits"
          className="inline-flex items-center gap-1 mb-4 font-semibold"
          style={{ fontSize: "13px", color: "var(--ember)", textDecoration: "none" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Beneficios
        </Link>
        <h1
          className="font-bold"
          style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
        >
          Comercios aliados
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
          {businesses.length} {businesses.length === 1 ? "local cerca de ti" : "locales cerca de ti"}
        </p>
      </div>

      {/* Map */}
      <div
        className="rounded-2xl overflow-hidden flex-shrink-0"
        style={{ height: "340px", border: "1px solid rgba(245,241,234,0.08)" }}
      >
        <DirectoryMapClient businesses={businesses} />
      </div>

      {/* Business list */}
      <div className="mt-5 space-y-3 pb-6">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
          >
            {/* Initial avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold"
              style={{
                backgroundColor: "var(--ember-soft)",
                color: "var(--ember)",
                fontSize: "16px",
              }}
            >
              {b.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: "var(--midnight)" }}>
                {b.name}
              </p>
              {(b.category || b.address) && (
                <p
                  className="font-mono-brand mt-0.5 truncate"
                  style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.05em" }}
                >
                  {(b.category ?? b.address ?? "").toUpperCase()}
                </p>
              )}
            </div>

            {/* Waze button */}
            <a
              href={`https://waze.com/ul?ll=${b.latitude},${b.longitude}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold"
              style={{
                fontSize: "12px",
                backgroundColor: "var(--ember-soft)",
                color: "var(--ember)",
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              <Navigation className="w-3.5 h-3.5" />
              Waze
            </a>
          </div>
        ))}

        {businesses.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <p className="font-semibold mb-1" style={{ color: "var(--midnight)" }}>
              Sin ubicaciones aún
            </p>
            <p className="text-sm" style={{ color: "var(--mute)" }}>
              Próximamente agregamos los locales al mapa.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
