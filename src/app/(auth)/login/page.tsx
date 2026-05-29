"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Logo from "@/components/shared/Logo"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error("Email o contraseña incorrectos")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", data.user.id).single()

    window.location.href = profile?.role === "admin" ? "/admin" : "/driver/dashboard"
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--midnight)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Logo size="md" />
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: "var(--midnight-2)", border: "1px solid rgba(245,241,234,0.08)" }}
        >
          <h1
            className="font-bold mb-1"
            style={{ fontSize: "22px", letterSpacing: "-0.025em", color: "var(--bone)" }}
          >
            Bienvenido de vuelta
          </h1>
          <p className="text-sm mb-8" style={{ color: "rgba(245,241,234,0.4)" }}>
            Ingresa con tu cuenta para ver tus beneficios.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="font-mono-brand block"
                style={{ fontSize: "11px", letterSpacing: "0.12em", color: "rgba(245,241,234,0.5)" }}
              >
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "rgba(245,241,234,0.07)",
                  border: "1px solid rgba(245,241,234,0.12)",
                  color: "var(--bone)",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="font-mono-brand block"
                style={{ fontSize: "11px", letterSpacing: "0.12em", color: "rgba(245,241,234,0.5)" }}
              >
                CONTRASEÑA
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors pr-11"
                  style={{
                    backgroundColor: "rgba(245,241,234,0.07)",
                    border: "1px solid rgba(245,241,234,0.12)",
                    color: "var(--bone)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(245,241,234,0.3)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors mt-2"
              style={{ backgroundColor: "var(--ember)", color: "#fff" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ingresar"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "rgba(245,241,234,0.3)" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium" style={{ color: "var(--ember)" }}>
              Regístrate
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm" style={{ color: "rgba(245,241,234,0.25)" }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
