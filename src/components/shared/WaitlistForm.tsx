"use client"

import { useState, useEffect, Suspense, type FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Share2, Check } from "lucide-react"
import { toast } from "sonner"

type Status = {
  full_name: string
  referral_code: string
  referral_count: number
  position: number
}

const inputStyle = {
  backgroundColor: "rgba(245,241,234,0.07)",
  border: "1px solid rgba(245,241,234,0.12)",
  color: "var(--bone)",
}

function WaitlistFormInner() {
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref")?.trim().toUpperCase() || null

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", platform: "" })

  useEffect(() => {
    const savedCode = localStorage.getItem("rp_waitlist_code")
    if (!savedCode) {
      setLoading(false)
      return
    }
    fetch(`/api/waitlist/status?code=${encodeURIComponent(savedCode)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStatus(data)
      })
      .finally(() => setLoading(false))
  }, [])

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Nombre y email son requeridos")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ref }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Error al procesar tu registro")
        setSubmitting(false)
        return
      }
      localStorage.setItem("rp_waitlist_code", data.referral_code)
      setStatus(data)
      toast.success("¡Ya estás en la lista!")
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
    }
    setSubmitting(false)
  }

  function shareLink() {
    return `${window.location.origin}/join?ref=${status?.referral_code}`
  }

  function handleShare() {
    if (!status) return
    const text = encodeURIComponent(
      `¡Oye! Me anoté a la lista de espera de RidePerks — beneficios para conductores en Panamá. Únete conmigo 👇\n${shareLink()}`
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  function copyLink() {
    if (!status) return
    navigator.clipboard.writeText(shareLink())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return null

  if (status) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "rgba(245,241,234,0.06)", border: "1px solid rgba(245,241,234,0.1)" }}
      >
        <p className="font-mono-brand mb-2" style={{ fontSize: "11px", letterSpacing: "0.14em", color: "rgba(245,241,234,0.5)" }}>
          YA ESTÁS EN LA LISTA
        </p>
        <p
          className="font-bold font-mono-brand"
          style={{ fontSize: "48px", letterSpacing: "-0.02em", color: "var(--ember)", lineHeight: 1 }}
        >
          #{status.position}
        </p>
        <p className="text-sm mt-3" style={{ color: "rgba(245,241,234,0.55)", lineHeight: 1.5 }}>
          {status.referral_count > 0
            ? `Has invitado a ${status.referral_count} ${status.referral_count === 1 ? "conductor" : "conductores"} — cada invitación te sube en la fila.`
            : "Invita a otros conductores para subir en la fila."}
        </p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={handleShare}
            className="pressable flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm min-h-[48px]"
            style={{ backgroundColor: "var(--ember)", color: "#fff" }}
          >
            <Share2 className="w-4 h-4" />
            Invitar por WhatsApp
          </button>
          <button
            onClick={copyLink}
            aria-label="Copiar link de invitación"
            className="pressable px-4 py-3 rounded-xl font-semibold text-sm min-h-[48px]"
            style={{ backgroundColor: "rgba(245,241,234,0.1)", color: "var(--bone)" }}
          >
            {copied ? <Check className="w-4 h-4" /> : "Copiar link"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="font-mono-brand mb-2" style={{ fontSize: "11px", letterSpacing: "0.14em", color: "rgba(245,241,234,0.5)" }}>
        ACCESO ANTICIPADO
      </p>
      <h2 className="font-bold" style={{ fontSize: "clamp(24px, 4vw, 32px)", letterSpacing: "-0.02em", color: "var(--bone)", marginBottom: "8px" }}>
        Anótate a la lista de espera
      </h2>
      <p className="text-sm mb-6" style={{ color: "rgba(245,241,234,0.5)", lineHeight: 1.5 }}>
        Te avisamos apenas la app esté lista. Invita a otros conductores para subir en la fila.
      </p>

      {ref && (
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-center gap-2"
          style={{ backgroundColor: "rgba(47,143,110,0.12)", border: "1px solid rgba(47,143,110,0.2)" }}
        >
          <span style={{ fontSize: "16px" }}>🎁</span>
          <p className="text-xs font-medium" style={{ color: "var(--verde)" }}>
            Te invitó un conductor con código {ref}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          autoComplete="name"
          placeholder="Nombre completo"
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          required
          className="w-full rounded-xl px-4 py-3 text-base md:text-sm outline-none"
          style={inputStyle}
        />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
          className="w-full rounded-xl px-4 py-3 text-base md:text-sm outline-none"
          style={inputStyle}
        />
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Teléfono (opcional)"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-base md:text-sm outline-none"
          style={inputStyle}
        />
        <select
          value={form.platform}
          onChange={(e) => set("platform", e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-base md:text-sm outline-none appearance-none"
          style={inputStyle}
        >
          <option value="" style={{ backgroundColor: "var(--midnight-2)" }}>¿En qué plataforma trabajas? (opcional)</option>
          <option value="uber" style={{ backgroundColor: "var(--midnight-2)" }}>Uber</option>
          <option value="indrive" style={{ backgroundColor: "var(--midnight-2)" }}>InDrive</option>
          <option value="pedidosya" style={{ backgroundColor: "var(--midnight-2)" }}>PedidosYa</option>
          <option value="multiple" style={{ backgroundColor: "var(--midnight-2)" }}>Varias plataformas</option>
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="pressable w-full rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 mt-2 min-h-[48px]"
          style={{ backgroundColor: "var(--ember)", color: "#fff" }}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Únete a la lista"}
        </button>
      </form>
    </div>
  )
}

export default function WaitlistForm() {
  return (
    <Suspense fallback={null}>
      <WaitlistFormInner />
    </Suspense>
  )
}
