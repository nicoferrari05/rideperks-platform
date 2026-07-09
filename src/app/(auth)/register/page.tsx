"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Logo from "@/components/shared/Logo"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [refCode, setRefCode] = useState("")
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    platform: "",
    password: "",
    confirm_password: "",
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("ref")
    if (ref) setRefCode(ref.toUpperCase())
  }, [])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (form.password !== form.confirm_password) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    if (form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }
    if (!form.platform) {
      toast.error("Selecciona tu plataforma")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: "driver" } },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .update({
          phone: form.phone,
          platform: form.platform,
          full_name: form.full_name,
          ...(refCode ? { referred_by: refCode } : {}),
        })
        .eq("id", user.id)
    }

    toast.success("Cuenta creada. Ahora sube tu foto de verificación.")
    router.push("/driver/verify")
    router.refresh()
  }

  const inputStyle = {
    backgroundColor: "rgba(245,241,234,0.07)",
    border: "1px solid rgba(245,241,234,0.12)",
    color: "var(--bone)",
  }

  const labelStyle = {
    fontSize: "11px" as const,
    letterSpacing: "0.12em",
    color: "rgba(245,241,234,0.5)",
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4 py-12"
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
            Crea tu cuenta
          </h1>
          <p className="text-sm mb-6" style={{ color: "rgba(245,241,234,0.4)" }}>
            Completa tus datos para acceder a tus beneficios.
          </p>

          {refCode && (
            <div
              className="rounded-xl px-4 py-3 mb-6 flex items-center gap-2"
              style={{ backgroundColor: "rgba(47,143,110,0.12)", border: "1px solid rgba(47,143,110,0.2)" }}
            >
              <span style={{ fontSize: "16px" }}>🎁</span>
              <p className="text-xs font-medium" style={{ color: "var(--verde)", lineHeight: 1.5 }}>
                Registrándote con código de referido <strong>{refCode}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono-brand block" style={labelStyle}>NOMBRE COMPLETO</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono-brand block" style={labelStyle}>EMAIL</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono-brand block" style={labelStyle}>TELÉFONO</label>
              <input
                type="tel"
                placeholder="+507 6000-0000"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono-brand block" style={labelStyle}>PLATAFORMA</label>
              <select
                value={form.platform}
                onChange={(e) => set("platform", e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none appearance-none"
                style={inputStyle}
              >
                <option value="" disabled style={{ backgroundColor: "var(--midnight-2)" }}>
                  Selecciona tu plataforma
                </option>
                <option value="uber" style={{ backgroundColor: "var(--midnight-2)" }}>Uber</option>
                <option value="indrive" style={{ backgroundColor: "var(--midnight-2)" }}>InDrive</option>
                <option value="pedidosya" style={{ backgroundColor: "var(--midnight-2)" }}>PedidosYa</option>
                <option value="multiple" style={{ backgroundColor: "var(--midnight-2)" }}>Varias plataformas</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono-brand block" style={labelStyle}>CONTRASEÑA</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-11"
                  style={inputStyle}
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

            <div className="space-y-1.5">
              <label className="font-mono-brand block" style={labelStyle}>CONFIRMAR CONTRASEÑA</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={form.confirm_password}
                onChange={(e) => set("confirm_password", e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: "var(--ember)", color: "#fff" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta gratis"}
            </button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: "rgba(245,241,234,0.25)", lineHeight: 1.6 }}>
            Al crear tu cuenta aceptas nuestros{" "}
            <Link href="/terminos" className="font-medium" style={{ color: "rgba(245,241,234,0.45)" }}>
              Términos
            </Link>{" "}
            y{" "}
            <Link href="/privacidad" className="font-medium" style={{ color: "rgba(245,241,234,0.45)" }}>
              Política de Privacidad
            </Link>
            .
          </p>

          <p className="text-center text-sm mt-4" style={{ color: "rgba(245,241,234,0.3)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--ember)" }}>
              Ingresar
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
