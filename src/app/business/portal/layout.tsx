import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function BusinessPortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "business") redirect("/login")

  return (
    <div className="min-h-dvh" style={{ backgroundColor: "var(--bone)" }}>
      <main
        className="max-w-2xl mx-auto px-4"
        style={{
          paddingTop: "calc(24px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </main>
    </div>
  )
}
