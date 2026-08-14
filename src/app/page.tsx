import Logo from "@/components/shared/Logo"
import WaitlistForm from "@/components/shared/WaitlistForm"

const benefits = [
  { label: "COMBUSTIBLE", figure: "20%", bg: "var(--sol)", color: "var(--midnight)" },
  { label: "COMIDA", figure: "$5", bg: "var(--verde)", color: "#fff" },
  { label: "TALLER", figure: "15%", bg: "var(--ember)", color: "#fff" },
  { label: "SALUD", figure: "10%", bg: "var(--midnight)", color: "var(--bone)" },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden flex flex-col justify-center"
        style={{ backgroundColor: "var(--midnight)", minHeight: "100dvh", padding: "clamp(28px, 6vw, 64px) 0" }}
      >
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: "-8%", right: "-8%", width: "52%", height: "28%",
            backgroundColor: "var(--ember)", borderRadius: "50%",
            filter: "blur(72px)", opacity: 0.28,
          }}
        />
        <div className="relative mx-auto w-full" style={{ maxWidth: "480px", padding: "0 clamp(24px, 6.5vw, 48px)" }}>
          <div className="mb-10">
            <Logo size="md" />
          </div>
          <p className="font-mono-brand mb-7" style={{ fontSize: "12px", letterSpacing: "0.18em", color: "var(--ember)" }}>
            CLUB DE CONDUCTORES · PANAMÁ
          </p>
          <h1
            className="font-bold"
            style={{ fontSize: "clamp(40px, 7vw, 64px)", letterSpacing: "-0.04em", lineHeight: 0.98, color: "var(--bone)", marginBottom: "20px" }}
          >
            Tu trabajo<br />
            rinde{" "}
            <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--ember)", fontFamily: "var(--font-fraunces)" }}>
              más.
            </em>
          </h1>
          <p style={{ color: "rgba(245,241,234,0.5)", fontSize: "16px", lineHeight: 1.6 }}>
            RidePerks está en construcción. Anótate ahora y sé de los primeros en tener acceso — más rápido si invitas a otros conductores.
          </p>
        </div>
      </section>

      {/* Value props */}
      <section style={{ backgroundColor: "var(--bone)", padding: "72px 0" }}>
        <div className="mx-auto w-full" style={{ maxWidth: "480px", padding: "0 clamp(24px, 6.5vw, 48px)" }}>
          <p className="font-mono-brand mb-4" style={{ fontSize: "12px", letterSpacing: "0.18em", color: "var(--ember)" }}>
            BENEFICIOS
          </p>
          <h2
            className="font-bold"
            style={{ fontSize: "clamp(28px, 5vw, 44px)", letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--midnight)", marginBottom: "24px" }}
          >
            Una membresía.<br />Todo incluido.
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((b) => (
              <div
                key={b.label}
                className="rounded-2xl"
                style={{ backgroundColor: b.bg, color: b.color, padding: "clamp(16px, 2vw, 24px)" }}
              >
                <p className="font-mono-brand mb-2" style={{ fontSize: "11px", letterSpacing: "0.12em", opacity: 0.65 }}>
                  {b.label}
                </p>
                <p className="font-bold" style={{ fontSize: "clamp(32px, 3.5vw, 40px)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {b.figure}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lista de espera */}
      <section style={{ backgroundColor: "var(--midnight)", padding: "72px 0" }}>
        <div className="mx-auto w-full" style={{ maxWidth: "480px", padding: "0 clamp(24px, 6.5vw, 48px)" }}>
          <WaitlistForm />
        </div>
      </section>
    </div>
  )
}
