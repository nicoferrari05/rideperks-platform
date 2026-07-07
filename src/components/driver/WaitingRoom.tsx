"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Wrench, Utensils, Fuel } from "lucide-react"
import YappyLoader from "./YappyLoader"
import YappyPayButton from "./YappyPayButton"

gsap.registerPlugin(useGSAP)

interface Props {
  status: string
  phone: string
  savingsPotential: number
  benefitCount: number
  partnerCount: number
}

export default function WaitingRoom({ status, phone, savingsPotential, benefitCount, partnerCount }: Props) {
  const isApproved = status === "verified"
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".wr-item", {
          autoAlpha: 0,
          y: 20,
          duration: 0.65,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.1,
        })

        if (!isApproved) {
          const rings = gsap.utils.toArray<HTMLElement>(".pulse-ring")
          rings.forEach((ring, i) => {
            gsap.fromTo(
              ring,
              { scale: 1, opacity: 0.55 },
              {
                scale: 2.5,
                opacity: 0,
                duration: 2.2,
                delay: i * 0.73,
                repeat: -1,
                ease: "power1.out",
                transformOrigin: "50% 50%",
              }
            )
          })
        }
      })
      return () => mm.revert()
    },
    { scope: containerRef, dependencies: [isApproved] }
  )

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center px-6"
      style={{
        backgroundColor: "var(--midnight)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "calc(48px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <YappyLoader />

      <div className="wr-item w-full flex justify-center" style={{ paddingTop: "56px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "var(--ember)",
          }}
        >
          RIDEPERKS
        </span>
      </div>

      {isApproved ? (
        <ApprovedContent
          phone={phone}
          savingsPotential={savingsPotential}
          benefitCount={benefitCount}
          partnerCount={partnerCount}
        />
      ) : (
        <PendingContent savingsPotential={savingsPotential} benefitCount={benefitCount} />
      )}
    </div>
  )
}

function PendingContent({ savingsPotential, benefitCount }: { savingsPotential: number; benefitCount: number }) {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center pb-4">
      {/* Radar rings + RP mark */}
      <div
        className="wr-item relative flex items-center justify-center"
        style={{ width: "108px", height: "108px", marginBottom: "40px", flexShrink: 0 }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="pulse-ring absolute inset-0 rounded-full"
            style={{ border: "1.5px solid var(--ember)" }}
          />
        ))}
        <div
          className="relative z-10 flex items-center justify-center"
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "16px",
            backgroundColor: "rgba(232,80,42,0.08)",
            border: "1px solid rgba(232,80,42,0.2)",
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: "18px",
              letterSpacing: "-0.02em",
              color: "var(--ember)",
            }}
          >
            RP
          </span>
        </div>
      </div>

      {/* Heading */}
      <div className="wr-item text-center" style={{ marginBottom: "12px" }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            color: "rgba(245,241,234,0.28)",
            marginBottom: "10px",
          }}
        >
          ESTADO · EN REVISIÓN
        </p>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            color: "var(--bone)",
          }}
        >
          Revisando
          <br />
          tu cuenta
        </h1>
      </div>

      <div className="wr-item text-center" style={{ maxWidth: "272px", marginBottom: "44px" }}>
        <p style={{ fontSize: "15px", lineHeight: 1.7, color: "rgba(245,241,234,0.45)" }}>
          El equipo de RidePerks está verificando tu solicitud. Normalmente toma menos de 24 horas.
        </p>
      </div>

      {/* Savings teaser */}
      {savingsPotential > 0 && (
        <div
          className="wr-item w-full rounded-2xl px-5 py-4"
          style={{
            backgroundColor: "rgba(232,80,42,0.07)",
            border: "1px solid rgba(232,80,42,0.14)",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: "rgba(245,241,234,0.3)",
              marginBottom: "4px",
            }}
          >
            LO QUE TE ESPERA
          </p>
          <p
            style={{
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--bone)",
              lineHeight: 1.2,
            }}
          >
            Hasta B/. {savingsPotential.toFixed(2)}
            <span style={{ fontSize: "13px", fontWeight: 500, color: "rgba(245,241,234,0.45)", marginLeft: "6px" }}>
              en descuentos / mes
            </span>
          </p>
          {benefitCount > 0 && (
            <p style={{ fontSize: "12px", color: "rgba(245,241,234,0.35)", marginTop: "3px" }}>
              {benefitCount} {benefitCount === 1 ? "beneficio disponible" : "beneficios disponibles"}
            </p>
          )}
        </div>
      )}

      {/* Benefit preview */}
      <div className="wr-item w-full">
        {savingsPotential === 0 && (
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              color: "rgba(245,241,234,0.22)",
              marginBottom: "14px",
            }}
          >
            LO QUE TE ESPERA
          </p>
        )}
        {[
          { Icon: Wrench, label: "Talleres y mantenimiento", detail: "Descuentos" },
          { Icon: Utensils, label: "Comida", detail: "Próximamente" },
          { Icon: Fuel, label: "Combustible gratis", detail: "Referidos" },
        ].map(({ Icon, label, detail }) => (
          <div
            key={label}
            className="flex items-center justify-between py-3.5"
            style={{ borderTop: "1px solid rgba(245,241,234,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(245,241,234,0.3)" }} />
              <span style={{ fontSize: "14px", fontWeight: 500, color: "rgba(245,241,234,0.72)" }}>
                {label}
              </span>
            </div>
            <span style={{ fontSize: "12px", color: "rgba(245,241,234,0.28)" }}>{detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ApprovedProps {
  phone: string
  savingsPotential: number
  benefitCount: number
  partnerCount: number
}

function ApprovedContent({ phone, savingsPotential, benefitCount, partnerCount }: ApprovedProps) {
  const benefits = [
    { Icon: Wrench, label: "Talleres y mantenimiento", detail: "Descuentos exclusivos" },
    { Icon: Utensils, label: "Comida", detail: "Próximamente" },
    { Icon: Fuel, label: "Combustible gratis", detail: "Referidos" },
  ]

  const showStats = savingsPotential > 0 || partnerCount > 0

  return (
    <>
      {/* Ember ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: "45vh",
          background:
            "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(232,80,42,0.14), transparent)",
        }}
      />

      <div className="relative w-full flex flex-col gap-5 pt-8 pb-4">
        {/* Price block */}
        <div>
          <div className="wr-item text-center" style={{ marginBottom: "4px" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.18em", color: "rgba(245,241,234,0.28)" }}>
              MEMBRESÍA MENSUAL
            </p>
          </div>
          <div className="wr-item flex items-start justify-center" style={{ gap: "3px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "rgba(245,241,234,0.38)",
                paddingTop: "8px",
                letterSpacing: "-0.01em",
              }}
            >
              B/.
            </span>
            <span
              style={{
                fontSize: "80px",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: "1",
                color: "var(--bone)",
              }}
            >
              15
            </span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "rgba(245,241,234,0.38)",
                paddingTop: "8px",
                letterSpacing: "-0.01em",
              }}
            >
              .00
            </span>
          </div>
          <div className="wr-item text-center">
            <p style={{ fontSize: "12px", letterSpacing: "0.05em", fontWeight: 500, color: "rgba(245,241,234,0.28)" }}>
              /mes · cancela cuando quieras
            </p>
          </div>
        </div>

        {/* ROI stats */}
        {showStats && (
          <div
            className="wr-item w-full rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(245,241,234,0.07)" }}
          >
            <div className="flex">
              {savingsPotential > 0 && (
                <div
                  className="flex-1 px-4 py-3.5"
                  style={{
                    borderRight: partnerCount > 0 ? "1px solid rgba(245,241,234,0.07)" : "none",
                  }}
                >
                  <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", color: "rgba(245,241,234,0.28)", marginBottom: "4px" }}>
                    AHORRAS HASTA
                  </p>
                  <p style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--bone)", lineHeight: 1 }}>
                    B/. {savingsPotential.toFixed(2)}
                  </p>
                  <p style={{ fontSize: "11px", color: "rgba(245,241,234,0.35)", marginTop: "2px" }}>
                    por mes
                  </p>
                </div>
              )}
              {partnerCount > 0 && (
                <div className="flex-1 px-4 py-3.5">
                  <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", color: "rgba(245,241,234,0.28)", marginBottom: "4px" }}>
                    ALIADOS
                  </p>
                  <p style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--bone)", lineHeight: 1 }}>
                    {partnerCount}
                  </p>
                  <p style={{ fontSize: "11px", color: "rgba(245,241,234,0.35)", marginTop: "2px" }}>
                    {partnerCount === 1 ? "comercio activo" : "comercios activos"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benefits */}
        <div
          className="wr-item w-full"
          style={{ borderTop: "1px solid rgba(245,241,234,0.07)" }}
        >
          {benefits.map(({ Icon, label, detail }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid rgba(245,241,234,0.07)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(245,241,234,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: "rgba(245,241,234,0.35)" }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--bone)" }}>
                  {label}
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "rgba(245,241,234,0.3)" }}>{detail}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="wr-item space-y-3">
          <p
            style={{
              textAlign: "center",
              fontSize: "10px",
              letterSpacing: "0.16em",
              fontWeight: 600,
              color: "rgba(245,241,234,0.25)",
            }}
          >
            ACTIVAR CON YAPPY
          </p>
          <YappyPayButton defaultPhone={phone} />
          <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(245,241,234,0.2)" }}>
            Pago seguro · Sin tarjeta de crédito
          </p>
        </div>
      </div>
    </>
  )
}
