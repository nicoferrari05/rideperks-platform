"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, EyeOff, Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props { benefitId: string; isActive: boolean }

export default function BenefitRowActions({ benefitId, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from("benefits").update({ is_active: !isActive }).eq("id", benefitId)
    toast.success(isActive ? "Beneficio desactivado" : "Beneficio activado")
    setLoading(false)
    router.refresh()
  }

  async function deleteBenefit() {
    if (!confirm("¿Seguro que quieres eliminar este beneficio? Esta acción no se puede deshacer.")) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from("benefits").delete().eq("id", benefitId)
    toast.success("Beneficio eliminado")
    setLoading(false)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="pressable inline-flex items-center justify-center h-7 w-7 rounded-md disabled:opacity-50 flex-shrink-0"
        style={{ color: "var(--mute)" }}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MoreHorizontal className="w-3.5 h-3.5" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggle}>
          {isActive ? <><EyeOff className="w-4 h-4 mr-2" />Desactivar</> : <><Eye className="w-4 h-4 mr-2" />Activar</>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={deleteBenefit} className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
