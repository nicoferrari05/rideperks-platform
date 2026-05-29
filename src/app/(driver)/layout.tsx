import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DriverNav from "@/components/driver/DriverNav"

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")
  if (profile.role === "admin") redirect("/admin")

  return (
    <div className="min-h-screen bg-muted/20">
      <DriverNav profile={profile} />
      <main
        className="max-w-4xl mx-auto px-4 py-6"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </main>
    </div>
  )
}
