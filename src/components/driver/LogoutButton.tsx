"use client"

import { useState } from "react"
import { LogOut, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Sesión cerrada")
    router.push("/")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="pressable w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-sm"
      style={{
        backgroundColor: "var(--paper)",
        border: "1px solid var(--line)",
        color: loading ? "var(--mute)" : "var(--ember)",
        transition: "color 160ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      {loading ? "Saliendo..." : "Cerrar sesión"}
    </button>
  )
}
