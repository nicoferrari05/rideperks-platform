"use client"

import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LogoutButton() {
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
      className="pressable w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-sm"
      style={{
        backgroundColor: "var(--paper)",
        border: "1px solid var(--line)",
        color: "var(--ember)",
      }}
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </button>
  )
}
