"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"

type Business = {
  id: string
  name: string
  category: string | null
  address: string | null
  latitude: number
  longitude: number
}

function MapPlaceholder() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: "var(--midnight-2)" }}
    >
      <div className="flex flex-col items-center gap-2">
        <MapPin className="w-6 h-6 animate-pulse" style={{ color: "var(--ember)" }} />
        <p className="text-sm" style={{ color: "rgba(245,241,234,0.4)" }}>Cargando mapa…</p>
      </div>
    </div>
  )
}

const BusinessMap = dynamic(
  () => import("@/components/driver/BusinessMap"),
  { ssr: false, loading: () => <MapPlaceholder /> }
)

export default function DirectoryMapClient({ businesses }: { businesses: Business[] }) {
  return <BusinessMap businesses={businesses} />
}
