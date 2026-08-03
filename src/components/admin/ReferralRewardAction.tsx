"use client"

import { useState } from "react"
import { Loader2, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  referrerId: string
  eligibleGroups: number
  rewardAmount: number
  groupSize: number
}

export default function ReferralRewardAction({ referrerId, eligibleGroups, rewardAmount, groupSize }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markPaid() {
    if (eligibleGroups < 1) return
    if (!confirm(`¿Confirmás que pagaste $${rewardAmount.toFixed(2)} por ${groupSize} referidos?`)) return

    setLoading(true)
    const supabase = createClient()

    const { data: pending } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", referrerId)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(groupSize)

    if (!pending || pending.length < groupSize) {
      toast.error("No hay suficientes referidos pendientes")
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("referrals")
      .update({ status: "rewarded", rewarded_at: new Date().toISOString() })
      .in("id", pending.map((p: { id: string }) => p.id))

    if (error) {
      toast.error("Error al marcar el pago")
    } else {
      toast.success(`Marcado como pagado — $${rewardAmount.toFixed(2)}`)
      router.refresh()
    }
    setLoading(false)
  }

  if (eligibleGroups < 1) return null

  return (
    <button
      onClick={markPaid}
      disabled={loading}
      className="pressable flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 flex-shrink-0"
      style={{
        backgroundColor: "rgba(47,143,110,0.12)",
        color: "var(--verde)",
        border: "1px solid rgba(47,143,110,0.2)",
      }}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5" />}
      Marcar ${rewardAmount.toFixed(2)} pagado
    </button>
  )
}
