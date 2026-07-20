"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function BusinessPortalLogout() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Sesión cerrada")
    router.push("/")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      className="pressable inline-flex items-center justify-center w-9 h-9 rounded-full"
      style={{ backgroundColor: "var(--bone-2)", color: "var(--mute)" }}
    >
      <LogOut className="w-4 h-4" />
    </button>
  )
}
