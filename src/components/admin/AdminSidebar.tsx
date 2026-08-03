"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Gift, Store, CreditCard, BarChart2, LogOut, Menu, X, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Logo from "@/components/shared/Logo"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/drivers", label: "Conductores", icon: Users },
  { href: "/admin/benefits", label: "Beneficios", icon: Gift },
  { href: "/admin/businesses", label: "Comercios", icon: Store },
  { href: "/admin/subscriptions", label: "Membresías", icon: CreditCard },
  { href: "/admin/referrals", label: "Referidos", icon: UserPlus },
  { href: "/admin/stats", label: "Estadísticas", icon: BarChart2 },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Lock body scroll while the mobile drawer is open so the page
  // behind it can't scroll under the finger.
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [mobileOpen])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Sesión cerrada")
    router.push("/")
    router.refresh()
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const sidebar = (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--midnight)", paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(245,241,234,0.08)" }}>
        <Logo size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="admin-nav-link pressable flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
              data-active={active}
              style={{
                backgroundColor: active ? "rgba(232,80,42,0.15)" : "transparent",
                color: active ? "var(--ember)" : "rgba(245,241,234,0.45)",
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(245,241,234,0.08)" }}>
        <div className="px-3 py-2 mb-1">
          <p className="font-mono-brand" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(245,241,234,0.3)" }}>
            ADMIN
          </p>
          <p className="text-sm font-medium mt-0.5 truncate" style={{ color: "var(--bone)" }}>
            {adminName}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="admin-nav-link pressable flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full"
          data-active="false"
          style={{ color: "rgba(245,241,234,0.35)" }}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-56 flex-col sticky top-0 h-dvh flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center px-4 justify-between border-b"
        style={{
          backgroundColor: "var(--midnight)",
          borderColor: "rgba(245,241,234,0.08)",
          height: "calc(3.5rem + env(safe-area-inset-top, 0px))",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <Logo size="sm" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="pressable p-3 -m-3 rounded-lg"
          style={{ color: "rgba(245,241,234,0.5)" }}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer — always in DOM, animated with CSS */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{
          backgroundColor: mobileOpen ? "rgba(15,27,61,0.75)" : "rgba(15,27,61,0)",
          transition: "background-color 280ms cubic-bezier(0.23, 1, 0.32, 1)",
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className="w-56 h-full"
          style={{
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: `transform ${mobileOpen ? "320ms" : "240ms"} cubic-bezier(0.32, 0.72, 0, 1)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {sidebar}
        </div>
      </div>
    </>
  )
}
