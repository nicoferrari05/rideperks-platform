import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/components/shared/Logo"
import { ChevronRight } from "lucide-react"

const benefits = [
  {
    color: "var(--sol)",
    textColor: "var(--midnight)",
    label: "Combustible",
    figure: "20%",
    desc: "Menos en estaciones aliadas. Por tanque, toda la semana.",
  },
  {
    color: "var(--verde)",
    textColor: "#fff",
    label: "Comida",
    figure: "B/. 5",
    desc: "Descuento fijo en fondas y restaurantes del corredor.",
  },
  {
    color: "var(--ember)",
    textColor: "#fff",
    label: "Taller & llantas",
    figure: "15%",
    desc: "Mantenimiento, aceite, y llantas donde van los que saben.",
  },
  {
    color: "var(--midnight)",
    textColor: "var(--bone)",
    label: "Farmacia & salud",
    figure: "10%",
    desc: "Medicamentos y consultas. Porque el cuerpo también importa.",
  },
]

const steps = [
  {
    n: "01",
    title: "Regístrate",
    desc: "Crea tu cuenta y sube una foto de tu perfil de conductor para verificar que eres activo.",
  },
  {
    n: "02",
    title: "Activa tu membresía",
    desc: "Coordinamos por WhatsApp. Pagas en Yappy o efectivo. Sin tarjeta.",
  },
  {
    n: "03",
    title: "Usa tu QR",
    desc: "Muestra el QR en el comercio. El empleado lo escanea y aplica el descuento al instante.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--paper)" }}>

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: "var(--bone)", borderColor: "var(--line)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Link href="/login">
              <button
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{ color: "var(--mute)" }}
              >
                Ingresar
              </button>
            </Link>
            <Link href="/register">
              <button
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                style={{ backgroundColor: "var(--ember)", color: "#fff" }}
              >
                Unirme
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto w-full px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 items-end">
        <div>
          <p className="eyebrow mb-6">Club de conductores · Panamá</p>
          <h1
            className="text-5xl sm:text-7xl font-bold tracking-tight leading-[0.95] mb-8"
            style={{ color: "var(--midnight)", letterSpacing: "-0.035em" }}
          >
            Tu trabajo<br />
            rinde{" "}
            <em
              className="not-italic font-serif-brand"
              style={{
                fontStyle: "italic",
                color: "var(--ember)",
                fontWeight: 400,
              }}
            >
              más.
            </em>
          </h1>
          <p
            className="text-lg leading-relaxed max-w-lg mb-10"
            style={{ color: "var(--mute)" }}
          >
            RidePerks negocia descuentos en combustible, comida y talleres
            para que cada semana de trabajo valga más.
            Una membresía. Sin letra chica.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link href="/register">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-base transition-colors"
                style={{ backgroundColor: "var(--ember)", color: "#fff" }}
              >
                Quiero unirme
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/login">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-base border transition-colors"
                style={{ color: "var(--midnight)", borderColor: "var(--line)" }}
              >
                Ya soy miembro
              </button>
            </Link>
          </div>

          <div
            className="mt-12 flex items-center gap-4 text-sm font-mono-brand"
            style={{ color: "var(--mute)", fontSize: "11px", letterSpacing: "0.1em" }}
          >
            <span>UBER</span>
            <span style={{ color: "var(--line)" }}>·</span>
            <span>INDRIVE</span>
            <span style={{ color: "var(--line)" }}>·</span>
            <span>PEDIDOSYA</span>
          </div>
        </div>

        {/* Membership card */}
        <div className="hidden lg:block">
          <div
            className="relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden"
            style={{
              backgroundColor: "var(--midnight)",
              color: "var(--bone)",
              aspectRatio: "3/4",
              boxShadow: "0 32px 80px -24px rgba(15,27,61,0.4)",
            }}
          >
            {/* glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: "-40% -40% auto auto",
                width: "120%",
                height: "120%",
                background: "radial-gradient(circle at 30% 30%, rgba(232,80,42,0.45), transparent 55%)",
              }}
            />
            <div className="relative flex items-start justify-between">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl"
                style={{ backgroundColor: "var(--ember)", color: "#fff" }}
              >
                R
              </div>
              <span
                className="font-mono-brand"
                style={{ fontSize: "10px", letterSpacing: "0.16em", opacity: 0.5 }}
              >
                Nº 001 / FOUNDERS
              </span>
            </div>
            <div className="relative">
              <p
                className="eyebrow mb-2"
                style={{ color: "rgba(245,241,234,0.5)", fontSize: "10px" }}
              >
                CONDUCTOR
              </p>
              <p
                className="font-bold mb-6"
                style={{ fontSize: "28px", letterSpacing: "-0.025em", lineHeight: 1.1 }}
              >
                Tu nombre<br />aquí
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p
                    className="font-mono-brand"
                    style={{ fontSize: "10px", opacity: 0.5, letterSpacing: "0.1em" }}
                  >
                    CONDUCTOR · PANAMÁ
                  </p>
                  <p
                    className="font-mono-brand mt-1 font-medium"
                    style={{ fontSize: "13px", opacity: 0.7 }}
                  >
                    MIEMBRO ACTIVO
                  </p>
                </div>
                <p
                  className="font-serif-brand"
                  style={{ fontStyle: "italic", fontSize: "16px", opacity: 0.6 }}
                >
                  RidePerks
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Manifesto ── */}
      <section
        className="px-6 py-24"
        style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
      >
        <div className="max-w-6xl mx-auto">
          <p className="eyebrow mb-6">MANIFIESTO</p>
          <h2
            className="font-bold leading-[0.92] mb-8"
            style={{
              fontSize: "clamp(40px, 7vw, 96px)",
              letterSpacing: "-0.04em",
              color: "var(--bone)",
            }}
          >
            Para el que{" "}
            <em
              className="font-serif-brand"
              style={{ fontStyle: "italic", fontWeight: 400, color: "var(--ember)" }}
            >
              madruga.
            </em>
            <br />
            Para el que hace doble turno.<br />
            Para el que no descansa<br />los domingos.
          </h2>
          <p style={{ color: "rgba(245,241,234,0.6)", fontSize: "18px", maxWidth: "560px", lineHeight: 1.55 }}>
            RidePerks es un club. Tú manejas. Nosotros negociamos.
            Tu semana rinde más. Así de simple.
          </p>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--bone)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="eyebrow mb-4">BENEFICIOS</p>
            <h2
              className="font-bold"
              style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.03em", color: "var(--midnight)" }}
            >
              Una membresía. Todo incluido.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl p-7 flex flex-col justify-between"
                style={{
                  backgroundColor: b.color,
                  color: b.textColor,
                  minHeight: "200px",
                }}
              >
                <div>
                  <p
                    className="font-mono-brand mb-3"
                    style={{ fontSize: "11px", letterSpacing: "0.14em", opacity: 0.7 }}
                  >
                    {b.label.toUpperCase()}
                  </p>
                  <p
                    className="font-bold leading-none"
                    style={{ fontSize: "56px", letterSpacing: "-0.04em" }}
                  >
                    {b.figure}
                  </p>
                </div>
                <p style={{ fontSize: "14px", lineHeight: 1.5, opacity: 0.8 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--paper)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="eyebrow mb-4">CÓMO FUNCIONA</p>
            <h2
              className="font-bold"
              style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.03em", color: "var(--midnight)" }}
            >
              Tres pasos. Sin complicaciones.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t"
            style={{ borderColor: "var(--line)" }}>
            {steps.map((s, i) => (
              <div
                key={i}
                className="pt-8 pb-10 pr-8"
                style={{ borderRight: i < 2 ? `1px solid var(--line)` : "none" }}
              >
                <p
                  className="font-mono-brand font-semibold mb-6"
                  style={{ fontSize: "40px", color: "var(--ember)", letterSpacing: "-0.02em" }}
                >
                  {s.n}
                </p>
                <h3
                  className="font-semibold mb-3"
                  style={{ fontSize: "20px", color: "var(--midnight)", letterSpacing: "-0.02em" }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--mute)", lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Savings proof ── */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--midnight)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="eyebrow mb-6">EL NÚMERO QUE IMPORTA</p>
            <h2
              className="font-bold mb-6"
              style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-0.035em", color: "var(--bone)", lineHeight: 1 }}
            >
              Lo que ahorras<br />
              <em
                className="font-serif-brand"
                style={{ fontStyle: "italic", fontWeight: 400, color: "var(--ember)", fontSize: "0.65em" }}
              >
                cada semana.
              </em>
            </h2>
            <p style={{ color: "rgba(245,241,234,0.6)", fontSize: "16px", lineHeight: 1.6 }}>
              Gasolina, almuerzo, mantenimiento. Todo suma.
              Con RidePerks cada vuelta rinde un poco más.
            </p>
          </div>

          {/* Receipt-style breakdown */}
          <div
            className="rounded-2xl p-7"
            style={{ backgroundColor: "var(--midnight-2)", border: "1px solid rgba(245,241,234,0.1)" }}
          >
            <p
              className="font-mono-brand mb-6"
              style={{ fontSize: "10px", letterSpacing: "0.14em", color: "rgba(245,241,234,0.4)" }}
            >
              SEMANA 16 / 2026 · PA-0420-2601
            </p>
            {[
              { label: "GAS", val: "B/. 18.40" },
              { label: "COMIDA", val: "B/. 12.00" },
              { label: "TALLER", val: "B/. 45.00" },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between py-3 font-mono-brand"
                style={{ borderBottom: "1px dashed rgba(245,241,234,0.1)", fontSize: "13px" }}
              >
                <span style={{ color: "rgba(245,241,234,0.5)", letterSpacing: "0.1em" }}>{r.label}</span>
                <span style={{ color: "var(--bone)" }}>{r.val} AHORRO</span>
              </div>
            ))}
            <div
              className="flex items-center justify-between pt-4 font-mono-brand font-semibold"
              style={{ fontSize: "16px" }}
            >
              <span style={{ color: "rgba(245,241,234,0.5)", letterSpacing: "0.1em" }}>TOTAL</span>
              <span style={{ color: "var(--ember)" }}>B/. 75.40 ↑</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24" style={{ backgroundColor: "var(--ember)" }}>
        <div className="max-w-6xl mx-auto">
          <p
            className="font-mono-brand mb-6"
            style={{ fontSize: "11px", letterSpacing: "0.14em", color: "var(--midnight)", opacity: 0.7 }}
          >
            ÚLTIMA PALABRA
          </p>
          <h2
            className="font-bold leading-[0.92] mb-10"
            style={{
              fontSize: "clamp(48px, 8vw, 112px)",
              letterSpacing: "-0.04em",
              color: "#fff",
            }}
          >
            Conduce. Ahorra.<br />
            <em
              className="font-serif-brand"
              style={{ fontStyle: "italic", fontWeight: 400, color: "var(--midnight)" }}
            >
              Repite.
            </em>
          </h2>
          <Link href="/register">
            <button
              className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-base transition-colors"
              style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
            >
              Quiero mis beneficios
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-10" style={{ backgroundColor: "var(--midnight)", borderTop: "1px solid rgba(245,241,234,0.1)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Logo size="sm" />
          <p
            className="font-mono-brand"
            style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(245,241,234,0.35)" }}
          >
            © 2026 RIDEPERKS · PANAMÁ
          </p>
          <div className="flex gap-6">
            <Link
              href="/business/verify"
              className="transition-colors"
              style={{ fontSize: "13px", color: "rgba(245,241,234,0.4)" }}
            >
              Portal Comercios
            </Link>
            <Link
              href="/login"
              className="transition-colors"
              style={{ fontSize: "13px", color: "rgba(245,241,234,0.4)" }}
            >
              Conductores
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
