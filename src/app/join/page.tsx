import { createClient } from "@/lib/supabase/server"
import { Wrench, Utensils, Heart, Fuel } from "lucide-react"
import JoinForm from "@/components/join/JoinForm"

interface Props {
  searchParams: Promise<{ ref?: string }>
}

const BENEFITS = [
  { Icon: Fuel,      label: "Combustible",  desc: "Gana un tanque gratis invitando conductores" },
  { Icon: Wrench,    label: "Taller",       desc: "Mantenimiento y chapistería" },
  { Icon: Utensils,  label: "Comida",       desc: "Restaurantes y delivery" },
  { Icon: Heart,     label: "Salud",        desc: "Clínicas y farmacias" },
]

export default async function JoinPage({ searchParams }: Props) {
  const { ref } = await searchParams
  const code = ref?.toUpperCase().trim() ?? null

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
      <div className="flex flex-col items-center px-6 pt-14 pb-6 text-center">
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
            ÚNETE A
          </p>
        )}

        <h1
          className="font-bold"
          style={{
            fontSize: "34px",
            letterSpacing: "-0.03em",
            color: "var(--bone)",
            lineHeight: 1.15,
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
      </div>

      {/* Benefits grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
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
      </div>

      {/* Divider */}
      <div
        className="mx-6 mb-2"
        style={{ height: "1px", backgroundColor: "rgba(245,241,234,0.07)" }}
      />

      {/* Registration form with Yappy payment */}
      <JoinForm referralCode={code} />
    </div>
  )
}
