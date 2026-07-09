import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ViewTransition } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (!profile || profile?.role !== "admin") redirect("/login")

  return (
    <div className="min-h-dvh flex">
      <AdminSidebar adminName={profile.full_name} />
      <ViewTransition name="admin-main">
        <main className="flex-1 min-h-dvh" style={{ backgroundColor: "var(--bone)" }}>
          <div className="max-w-5xl mx-auto px-6 py-8 md:py-10 pt-[calc(5rem+env(safe-area-inset-top,0px))] md:pt-10">
            {children}
          </div>
        </main>
      </ViewTransition>
    </div>
  )
}
