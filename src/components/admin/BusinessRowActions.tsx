"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props { businessId: string; isActive: boolean }

export default function BusinessRowActions({ businessId, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from("partner_businesses").update({ is_active: !isActive }).eq("id", businessId)
    toast.success(isActive ? "Comercio desactivado" : "Comercio activado")
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
