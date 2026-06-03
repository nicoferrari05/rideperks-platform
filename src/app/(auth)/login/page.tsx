"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Logo from "@/components/shared/Logo"

type Mode = "driver" | "business"

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("driver")

  // Driver state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Business state
  const [businessCode, setBusinessCode] = useState("")
  const [loadingBusiness, setLoadingBusiness] = useState(false)

  const router = useRouter()

  async function handleDriverLogin(e: { preventDefault(): void }) {
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

  async function handleBusinessAccess(e: { preventDefault(): void }) {
    e.preventDefault()
    const code = businessCode.trim()
    if (code.length < 3) {
      toast.error("Ingresa tu código de comercio")
      return
    }
    setLoadingBusiness(true)
    try {
      const res = await fetch("/api/verify-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_code: code }),
      })
      const data = await res.json()
      if (!data.valid) {
        toast.error(data.error ?? "Código de comercio inválido")
        setLoadingBusiness(false)
        return
      }
      router.push(`/business/verify?code=${encodeURIComponent(code)}`)
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
      setLoadingBusiness(false)
    }
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

          {/* Mode toggle */}
          <div
            className="flex rounded-xl p-1 mb-8"
            style={{ backgroundColor: "rgba(245,241,234,0.05)" }}
          >
            {(["driver", "business"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 rounded-lg py-2.5 font-semibold text-sm"
                style={{
                  backgroundColor: mode === m ? "rgba(245,241,234,0.1)" : "transparent",
                  color: mode === m ? "var(--bone)" : "rgba(245,241,234,0.32)",
                  transition: "background-color 180ms ease, color 180ms ease",
                  letterSpacing: "0.01em",
                }}
              >
                {m === "driver" ? "Conductor" : "Comercio aliado"}
              </button>
            ))}
          </div>

          {/* ── DRIVER FORM ─────────────────────────────────────── */}
          {mode === "driver" && (
            <>
              <h1
                className="font-bold mb-1"
                style={{ fontSize: "22px", letterSpacing: "-0.025em", color: "var(--bone)" }}
              >
                Bienvenido de vuelta
              </h1>
              <p className="text-sm mb-8" style={{ color: "rgba(245,241,234,0.4)" }}>
                Ingresa con tu cuenta para ver tus beneficios.
              </p>

              <form onSubmit={handleDriverLogin} className="space-y-4">
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
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
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
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-11"
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
                  className="w-full rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 mt-2"
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
            </>
          )}

          {/* ── BUSINESS FORM ───────────────────────────────────── */}
          {mode === "business" && (
            <>
              <h1
                className="font-bold mb-1"
                style={{ fontSize: "22px", letterSpacing: "-0.025em", color: "var(--bone)" }}
              >
                Portal de comercios
              </h1>
              <p className="text-sm mb-8" style={{ color: "rgba(245,241,234,0.4)" }}>
                Ingresa tu código para abrir el escáner de QR.
              </p>

              <form onSubmit={handleBusinessAccess} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="biz-code"
                    className="font-mono-brand block"
                    style={{ fontSize: "11px", letterSpacing: "0.12em", color: "rgba(245,241,234,0.5)" }}
                  >
                    CÓDIGO DE COMERCIO
                  </label>
                  <input
                    id="biz-code"
                    type="text"
                    value={businessCode}
                    onChange={(e) => setBusinessCode(e.target.value.toUpperCase())}
                    placeholder="TIENDA01"
                    autoCapitalize="characters"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="text"
                    className="w-full rounded-xl text-center font-mono-brand font-bold outline-none"
                    style={{
                      fontSize: "28px",
                      letterSpacing: "0.16em",
                      padding: "18px 16px",
                      backgroundColor: "rgba(245,241,234,0.07)",
                      border: "1px solid rgba(245,241,234,0.12)",
                      color: "var(--bone)",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingBusiness}
                  className="pressable w-full rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 mt-2"
                  style={{ backgroundColor: "var(--ember)", color: "#fff" }}
                >
                  {loadingBusiness
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <>Acceder al escáner <ChevronRight className="w-4 h-4" /></>
                  }
                </button>
              </form>
            </>
          )}

        </div>

        {mode === "driver" && (
          <div className="text-center mt-6">
            <Link href="/" className="text-sm" style={{ color: "rgba(245,241,234,0.25)" }}>
              Volver al inicio
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
