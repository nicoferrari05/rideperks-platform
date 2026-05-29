"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Ban, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props { subscriptionId: string; status: string }

export default function SubscriptionRowActions({ subscriptionId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function cancel() {
    if (!confirm("¿Cancelar esta membresía?")) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", subscriptionId)
    toast.success("Membresía cancelada")
    setLoading(false)
    router.refresh()
  }

  if (status === "cancelled") return null

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
        <DropdownMenuItem onClick={cancel} className="text-destructive">
          <Ban className="w-4 h-4 mr-2" />
          Cancelar membresía
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
