import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DriverNav from "@/components/driver/DriverNav"
import ScrollToTop from "@/components/shared/ScrollToTop"
import YappyLoader from "@/components/driver/YappyLoader"

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const [{ data: profile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ])

  if (!profile) redirect("/login")
  if (profile.role === "admin") redirect("/admin")

  if (profile.status !== "verified") redirect("/driver/verify")

  return (
    <div className="min-h-dvh">
      <YappyLoader />
      <ScrollToTop />
      <DriverNav profile={profile} />
      <main
        className="max-w-2xl mx-auto px-4 py-6"
        style={{ paddingBottom: "calc(112px + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </main>
    </div>
  )
}
