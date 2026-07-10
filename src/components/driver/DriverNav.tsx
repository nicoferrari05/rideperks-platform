"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Gift, History, User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Profile } from "@/types/database"

const navItems = [
  { href: "/driver/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/driver/benefits", label: "Beneficios", icon: Gift },
  { href: "/driver/history", label: "Historial", icon: History },
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
      {/* Identity row — flows with the page, no fixed bar. A row this short (64px)
          can't fit a glow without it reading as a flat color banner, so it stays plain. */}
      <div className="relative">
        <div className="relative max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <span
            className="font-extrabold"
            style={{ fontSize: "15px", letterSpacing: "-0.02em", color: "var(--midnight)" }}
          >
            RIDEPERKS
          </span>
          <div className="flex items-center gap-3">
            <span
              className="text-sm hidden sm:block"
              style={{ color: "var(--mute)" }}
            >
              {profile.full_name?.split(" ")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="pressable p-3.5 -m-2 rounded-lg"
              style={{ color: "var(--mute)" }}
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom navigation — floating pill, inset from all edges */}
      <nav
        className="fixed z-40"
        style={{
          left: "max(16px, env(safe-area-inset-left, 0px))",
          right: "max(16px, env(safe-area-inset-right, 0px))",
          bottom: "max(20px, calc(env(safe-area-inset-bottom, 0px) + 8px))",
        }}
      >
        <div
          className="relative max-w-2xl mx-auto h-[64px]"
          style={{
            backgroundColor: "var(--midnight)",
            borderRadius: "22px",
            border: "1px solid rgba(245,241,234,0.08)",
            boxShadow: "0 16px 40px rgba(15,27,61,0.32), 0 4px 14px rgba(15,27,61,0.2)",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          {/* Sliding background pill — positioned within the padded content area */}
          {activeIdx >= 0 && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: "16px",
                height: "42px",
                width: "calc((100% - 24px) / 4 - 8px)",
                backgroundColor: "rgba(245,241,234,0.08)",
                borderRadius: "14px",
                // Slide with transform (compositor-only) instead of `left`,
                // which forces layout on every frame. translateX % is relative
                // to the pill's own width; one slot = pill width + 8px gap.
                transform: `translate(calc(${activeIdx} * (100% + 8px)), -50%)`,
                transition: "transform 320ms cubic-bezier(0.23, 1, 0.32, 1)",
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
                  onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  className="pressable flex flex-col items-center gap-1"
                  style={{
                    flex: "1",
                    color: active ? "var(--ember)" : "rgba(245,241,234,0.38)",
                    fontSize: "11px",
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
