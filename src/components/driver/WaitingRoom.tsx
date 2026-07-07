import { Clock, CheckCircle2, Wrench, Fuel, Utensils } from "lucide-react"
import YappyLoader from "./YappyLoader"
import YappyPayButton from "./YappyPayButton"

interface Props {
  status: string
  phone: string
}

export default function WaitingRoom({ status, phone }: Props) {
  const isApproved = status === "verified"

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5"
      style={{
        backgroundColor: "var(--bone-2)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "calc(40px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <YappyLoader />

      {/* Logo */}
      <div className="mt-14 mb-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl"
          style={{ backgroundColor: "var(--midnight)", color: "var(--bone)", fontSize: "18px", letterSpacing: "-0.02em" }}
        >
          RP
        </div>
      </div>

      {isApproved ? (
        /* ── APPROVED: needs payment ── */
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(47,143,110,0.14)" }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: "var(--verde)" }} />
            </div>
            <div>
              <h1
                className="font-bold"
                style={{ fontSize: "26px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
              >
                ¡Cuenta aprobada!
              </h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--mute)" }}>
                Ya eres parte de RidePerks. Activa tu membresía para acceder a todos los beneficios.
              </p>
            </div>
          </div>

          {/* Membership card */}
          <div
            className="w-full rounded-2xl p-5 relative overflow-hidden"
            style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
          >
            <div
              className="absolute pointer-events-none"
              style={{
                right: "-15%", top: "-30%", width: "55%", height: "60%",
                background: "radial-gradient(circle, rgba(232,80,42,0.3), transparent 60%)",
              }}
            />
            <div className="relative">
              <p
                className="font-mono-brand mb-1"
                style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(245,241,234,0.45)" }}
              >
                MEMBRESÍA MENSUAL
              </p>
              <p
                className="font-bold mb-4"
                style={{ fontSize: "32px", letterSpacing: "-0.03em", color: "var(--bone)" }}
              >
                B/. 15.00
              </p>

              <div className="flex flex-col gap-2 mb-5">
                {[
                  { Icon: Wrench, text: "Descuentos en talleres y mantenimiento" },
                  { Icon: Utensils, text: "Comida próximamente" },
                  { Icon: Fuel, text: "Programa de combustible gratis" },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(245,241,234,0.45)" }} />
                    <p style={{ fontSize: "13px", color: "rgba(245,241,234,0.7)" }}>{text}</p>
                  </div>
                ))}
              </div>

              <div
                className="pt-4 flex flex-col items-center gap-2"
                style={{ borderTop: "1px solid rgba(245,241,234,0.08)" }}
              >
                <p
                  className="font-mono-brand"
                  style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(245,241,234,0.4)" }}
                >
                  PAGAR CON YAPPY
                </p>
                <YappyPayButton defaultPhone={phone} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── PENDING: under review ── */
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(201,167,53,0.14)" }}
            >
              <Clock className="w-8 h-8" style={{ color: "var(--sol)" }} />
            </div>
            <div>
              <h1
                className="font-bold"
                style={{ fontSize: "26px", letterSpacing: "-0.025em", color: "var(--midnight)" }}
              >
                Revisando tu cuenta
              </h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--mute)" }}>
                El equipo de RidePerks está revisando tu solicitud. Normalmente toma menos de 24 horas.
              </p>
            </div>
          </div>

          {/* What they'll unlock */}
          <div
            className="w-full rounded-2xl p-5"
            style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <p
              className="font-mono-brand mb-4"
              style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--mute)" }}
            >
              LO QUE TE ESPERA
            </p>
            <div className="flex flex-col gap-3.5">
              {[
                { Icon: Wrench, label: "Talleres y mantenimiento", sub: "Descuentos en servicios para tu vehículo" },
                { Icon: Utensils, label: "Comida", sub: "Próximamente" },
                { Icon: Fuel, label: "Combustible gratis", sub: "Invita conductores y gana un tanque lleno" },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "var(--bone-2)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "var(--mute)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--midnight)" }}>{label}</p>
                    <p style={{ fontSize: "12px", color: "var(--mute)" }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "var(--mute)", textAlign: "center" }}>
            Te avisaremos en cuanto tu cuenta esté lista.
          </p>
        </div>
      )}
    </div>
  )
}
