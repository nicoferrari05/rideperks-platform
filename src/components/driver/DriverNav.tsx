"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Gift, User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Logo from "@/components/shared/Logo"
import type { Profile } from "@/types/database"

const navItems = [
  { href: "/driver/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/driver/benefits", label: "Beneficios", icon: Gift },
  { href: "/driver/profile", label: "Perfil", icon: User },
]

export default function DriverNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()

  const activeIdx = navItems.findIndex(({ href }) => pathname.startsWith(href))

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Sesión cerrada")
    router.push("/")
    router.refresh()
  }

  return (
    <>
      {/* Top header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: "var(--midnight)",
          borderColor: "rgba(245,241,234,0.1)",
          viewTransitionName: "driver-header",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <span
              className="text-sm hidden sm:block"
              style={{ color: "rgba(245,241,234,0.5)" }}
            >
              {profile.full_name?.split(" ")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="pressable p-1.5 rounded-lg"
              style={{ color: "rgba(245,241,234,0.4)" }}
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          backgroundColor: "var(--midnight)",
          borderColor: "rgba(245,241,234,0.1)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          viewTransitionName: "driver-nav",
        }}
      >
        {/* 20px side padding keeps pill away from iPhone curved-corner clip zone */}
        <div className="relative max-w-2xl mx-auto h-[68px]" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
          {/* Sliding background pill — positioned within the padded content area */}
          {activeIdx >= 0 && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                height: "44px",
                width: "calc((100% - 40px) / 3 - 8px)",
                backgroundColor: "rgba(245,241,234,0.07)",
                borderRadius: "14px",
                transform: "translateY(-50%)",
                left: `calc(20px + ${activeIdx} * (100% - 40px) / 3 + 4px)`,
                transition: "left 320ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            />
          )}

          {/* Nav items */}
          <div className="relative h-full flex items-center z-10">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  className="pressable flex flex-col items-center gap-1"
                  style={{
                    flex: "1",
                    color: active ? "var(--ember)" : "rgba(245,241,234,0.38)",
                    fontSize: "12px",
                    letterSpacing: "0.05em",
                    transition: "color 280ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
