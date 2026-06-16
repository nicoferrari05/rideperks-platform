import { createClient } from "@/lib/supabase/server"
import { Zap, Wrench, Utensils, Heart, ArrowRight } from "lucide-react"

interface Props {
  searchParams: Promise<{ ref?: string }>
}

const BENEFITS = [
  { Icon: Zap,      label: "Combustible",  desc: "Descuentos en gasolineras aliadas" },
  { Icon: Wrench,   label: "Taller",       desc: "Mantenimiento y chapistería" },
  { Icon: Utensils, label: "Comida",       desc: "Restaurantes y delivery" },
  { Icon: Heart,    label: "Salud",        desc: "Clínicas y farmacias" },
]

export default async function JoinPage({ searchParams }: Props) {
  const { ref } = await searchParams
  const code = ref?.toUpperCase().trim() ?? null

  // Look up referrer name if a code was provided
  let referrerName: string | null = null
  if (code) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("referral_code", code)
      .single()
    referrerName = data?.full_name ?? null
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: "var(--midnight)" }}
    >
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">

        {/* Logo mark */}
        <div
          className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-8"
          style={{
            backgroundColor: "oklch(0.24 0.06 255)",
            border: "1px solid rgba(245,241,234,0.10)",
            boxShadow: "0 0 40px rgba(232,80,42,0.25)",
          }}
        >
          <span
            className="font-bold"
            style={{
              fontSize: "36px",
              letterSpacing: "-0.05em",
              fontFamily: "var(--font-geist)",
              color: "var(--bone)",
              lineHeight: 1,
            }}
          >
            RP
          </span>
        </div>

        {/* Invitation context */}
        {referrerName ? (
          <p
            className="font-semibold mb-2"
            style={{ fontSize: "13px", letterSpacing: "0.06em", color: "var(--ember)" }}
          >
            {referrerName.split(" ")[0].toUpperCase()} TE INVITÓ
          </p>
        ) : (
          <p
            className="font-semibold mb-2"
            style={{ fontSize: "13px", letterSpacing: "0.06em", color: "var(--ember)" }}
          >
            TE INVITARON A
          </p>
        )}

        <h1
          className="font-bold"
          style={{
            fontSize: "34px",
            letterSpacing: "-0.03em",
            color: "var(--bone)",
            lineHeight: 1.15,
            maxWidth: "280px",
          }}
        >
          RidePerks
        </h1>

        <p
          className="mt-3"
          style={{ fontSize: "16px", color: "rgba(245,241,234,0.55)", lineHeight: 1.55, maxWidth: "300px" }}
        >
          El club de beneficios exclusivo para conductores en Panamá.
        </p>

        {/* Code badge */}
        {code && (
          <div
            className="mt-6 px-4 py-2 rounded-full font-mono-brand font-bold"
            style={{
              fontSize: "14px",
              letterSpacing: "0.08em",
              backgroundColor: "rgba(232,80,42,0.12)",
              color: "var(--ember)",
              border: "1px solid rgba(232,80,42,0.25)",
            }}
          >
            Código: {code}
          </div>
        )}
      </div>

      {/* Benefits grid */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {BENEFITS.map(({ Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: "oklch(0.24 0.06 255)",
                border: "1px solid rgba(245,241,234,0.07)",
              }}
            >
              <Icon className="w-5 h-5 mb-2" style={{ color: "var(--ember)" }} />
              <p className="font-semibold text-sm" style={{ color: "var(--bone)" }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(245,241,234,0.45)", lineHeight: 1.4 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={code ? `/register?ref=${code}` : "/register"}
          className="pressable flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-base"
          style={{
            backgroundColor: "var(--ember)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(232,80,42,0.35)",
          }}
        >
          Crear mi cuenta
          <ArrowRight className="w-5 h-5" />
        </a>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(245,241,234,0.30)" }}>
          Es gratis. Tu membresía se activa cuando el equipo de RidePerks verifique tu cuenta.
        </p>
      </div>
    </div>
  )
}
