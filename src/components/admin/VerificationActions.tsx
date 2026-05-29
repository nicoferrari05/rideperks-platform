"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  verificationId: string
  driverId: string
}

export default function VerificationActions({ verificationId, driverId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [showRejectNote, setShowRejectNote] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")

  async function approve() {
    setLoading("approve")
    const supabase = createClient()

    await supabase.from("driver_verifications").update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
    }).eq("id", verificationId)

    await supabase.from("profiles").update({ status: "verified" }).eq("id", driverId)

    const now = new Date()
    const expires = new Date(now)
    expires.setDate(expires.getDate() + 30)

    await supabase.from("subscriptions").insert({
      driver_id: driverId,
      status: "active",
      plan_name: "monthly",
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })

    toast.success("Conductor verificado — membresía activada por 30 días")
    setLoading(null)
    router.refresh()
  }

  async function reject() {
    setLoading("reject")
    const supabase = createClient()

    await supabase.from("driver_verifications").update({
      status: "rejected",
      admin_notes: adminNotes || "Verificación rechazada",
      reviewed_at: new Date().toISOString(),
    }).eq("id", verificationId)

    await supabase.from("profiles").update({ status: "rejected" }).eq("id", driverId)

    toast.success("Verificación rechazada")
    setLoading(null)
    setShowRejectNote(false)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {showRejectNote && (
        <Textarea
          placeholder="Motivo del rechazo (opcional)..."
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          className="text-sm resize-none"
          rows={2}
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={approve}
          disabled={!!loading}
          className="pressable flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{
            backgroundColor: "rgba(47,143,110,0.12)",
            color: "var(--verde)",
            border: "1px solid rgba(47,143,110,0.2)",
          }}
        >
          {loading === "approve"
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <><CheckCircle2 className="w-3.5 h-3.5" />Aprobar</>
          }
        </button>

        {showRejectNote ? (
          <button
            onClick={reject}
            disabled={!!loading}
            className="pressable flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{
              backgroundColor: "var(--ember-soft)",
              color: "var(--ember-2)",
              border: "1px solid rgba(232,80,42,0.2)",
            }}
          >
            {loading === "reject"
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : "Confirmar rechazo"
            }
          </button>
        ) : (
          <button
            onClick={() => setShowRejectNote(true)}
            disabled={!!loading}
            className="pressable flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium disabled:opacity-50"
            style={{
              backgroundColor: "var(--paper)",
              color: "var(--ember)",
              border: "1px solid rgba(232,80,42,0.2)",
            }}
          >
            <XCircle className="w-3.5 h-3.5" />
            Rechazar
          </button>
        )}
      </div>
    </div>
  )
}
