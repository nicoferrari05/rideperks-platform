"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, CheckCircle, Check, Loader2, ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const platforms = [
  { value: "uber",      label: "Uber" },
  { value: "indrive",   label: "InDrive" },
  { value: "pedidosya", label: "PedidosYa" },
  { value: "multiple",  label: "Varias plataformas" },
]

export default function VerifyPage() {
  const router = useRouter()
  const [platform, setPlatform] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleFile(e: { target: HTMLInputElement }) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5MB")
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!file || !platform) {
      toast.error("Seleccioná la plataforma y subí una foto")
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const ext = file.name.split(".").pop()
    const path = `${user.id}/verification-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from("driver-photos")
      .upload(path, file)

    if (uploadError) {
      toast.error("Error al subir la foto. Intenta de nuevo.")
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase
      .from("driver_verifications")
      .insert({ driver_id: user.id, photo_url: path, platform })

    if (verifyError) {
      toast.error("Error al enviar la verificación.")
      setLoading(false)
      return
    }

    await supabase
      .from("profiles")
      .update({ platform, status: "pending" })
      .eq("id", user.id)

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "rgba(47,143,110,0.15)" }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: "var(--verde)" }} />
          </div>
          <div>
            <h2 className="font-bold" style={{ fontSize: "22px", letterSpacing: "-0.02em", color: "var(--midnight)" }}>
              ¡Verificación enviada!
            </h2>
            <p className="text-sm mt-2" style={{ color: "var(--mute)", maxWidth: "280px" }}>
              Revisaremos tu solicitud en las próximas 24 horas.
            </p>
          </div>
          <button
            onClick={() => router.push("/driver/dashboard")}
            className="pressable px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    )
  }

  const canSubmit = !!file && !!platform

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="font-bold" style={{ fontSize: "28px", letterSpacing: "-0.025em", color: "var(--midnight)" }}>
          Verificá tu cuenta
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
          Confirma que sos conductor activo para acceder a los beneficios.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Platform selector */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
        >
          <div className="px-5 pt-4 pb-2">
            <p className="eyebrow-muted">PLATAFORMA</p>
          </div>
          <div className="p-4 space-y-2">
            {platforms.map((p) => {
              const selected = platform === p.value
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlatform(p.value)}
                  aria-pressed={selected}
                  className="pressable w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium min-h-[48px]"
                  style={{
                    backgroundColor: selected ? "var(--midnight)" : "var(--bone-2)",
                    color: selected ? "var(--bone)" : "var(--midnight)",
                    border: selected ? "1px solid transparent" : "1px solid var(--line)",
                    boxShadow: selected ? "var(--shadow-card), inset 0 1px 0 rgba(245,241,234,0.08)" : "none",
                    transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 200ms cubic-bezier(0.23, 1, 0.32, 1), color 200ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  {p.label}
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: "var(--ember)",
                      transform: selected ? "scale(1)" : "scale(0.5)",
                      opacity: selected ? 1 : 0,
                      transition: "transform 260ms cubic-bezier(0.23, 1, 0.32, 1), opacity 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                    aria-hidden="true"
                  >
                    <Check className="w-3 h-3" strokeWidth={3} style={{ color: "#fff" }} />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Photo upload */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
        >
          <div className="px-5 pt-4 pb-2">
            <p className="eyebrow-muted">FOTO DE PERFIL</p>
          </div>
          <div className="p-4">
            <label className="pressable block cursor-pointer">
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  backgroundColor: "var(--bone-2)",
                  border: preview ? "1px solid var(--line)" : "2px dashed var(--line)",
                }}
              >
                {preview ? (
                  <div className="space-y-3">
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                    <p className="text-xs" style={{ color: "var(--mute)" }}>Toca para cambiar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="w-10 h-10 mx-auto" style={{ color: "var(--mute)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--midnight)" }}>Subir captura de pantalla</p>
                    <p className="font-mono-brand" style={{ fontSize: "11px", color: "var(--mute)", letterSpacing: "0.06em" }}>
                      PNG, JPG — MÁX. 5MB
                    </p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Tips */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: "var(--bone-2)", border: "1px solid var(--line)" }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--midnight)" }}>¿Qué debe mostrar la foto?</p>
          <ul className="space-y-1">
            {[
              "Tu nombre completo en la app",
              "Tu foto de perfil",
              "Estado \"activo\" o tu calificación",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--mute)" }}>
                <span style={{ color: "var(--ember)", marginTop: "1px" }}>·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="pressable w-full rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2"
          style={{
            backgroundColor: canSubmit ? "var(--midnight)" : "var(--bone-2)",
            color: canSubmit ? "var(--bone)" : "var(--mute)",
            cursor: canSubmit ? "pointer" : "not-allowed",
            boxShadow: canSubmit ? "var(--shadow-float)" : "none",
            transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 200ms cubic-bezier(0.23, 1, 0.32, 1), color 200ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 300ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</>
          ) : (
            <><Upload className="w-4 h-4" />Enviar verificación</>
          )}
        </button>
      </form>
    </div>
  )
}
