"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserCheck, UserX, ShieldOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  driverId: string
  currentStatus: string
}

export default function DriverActions({ driverId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(newStatus: string) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", driverId)
    if (error) {
      toast.error("Error al actualizar el estado")
    } else {
      toast.success("Estado actualizado")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="pressable inline-flex items-center justify-center h-7 w-7 rounded-md disabled:opacity-50"
        style={{ color: "var(--mute)" }}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MoreHorizontal className="w-3.5 h-3.5" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== "verified" && (
          <DropdownMenuItem onClick={() => updateStatus("verified")} style={{ color: "var(--verde)" }}>
            <UserCheck className="w-4 h-4 mr-2" />
            Marcar como verificado
          </DropdownMenuItem>
        )}
        {currentStatus !== "rejected" && (
          <DropdownMenuItem onClick={() => updateStatus("rejected")} style={{ color: "var(--ember)" }}>
            <UserX className="w-4 h-4 mr-2" />
            Rechazar verificación
          </DropdownMenuItem>
        )}
        {currentStatus !== "suspended" && (
          <DropdownMenuItem onClick={() => updateStatus("suspended")} style={{ color: "var(--mute)" }}>
            <ShieldOff className="w-4 h-4 mr-2" />
            Suspender cuenta
          </DropdownMenuItem>
        )}
        {currentStatus === "suspended" && (
          <DropdownMenuItem onClick={() => updateStatus("verified")} style={{ color: "var(--verde)" }}>
            <UserCheck className="w-4 h-4 mr-2" />
            Reactivar cuenta
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
