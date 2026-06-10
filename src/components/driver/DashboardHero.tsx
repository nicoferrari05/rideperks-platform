"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import SavingsCounter from "./SavingsCounter"

interface DashboardHeroProps {
  totalSaved: number
  lifetimeSaved: number
  redemptionsThisMonth: number
  totalRedemptions: number
  roi: number
  expiresAt: string | null
  daysUntilExpiry: number | null
  potentialMonthly: number
  monthLabel: string
}

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)"

export default function DashboardHero({
  totalSaved,
  lifetimeSaved,
  redemptionsThisMonth,
  totalRedemptions,
  roi,
  expiresAt,
  daysUntilExpiry,
  potentialMonthly,
  monthLabel,
}: DashboardHeroProps) {
  const [view, setView] = useState<"month" | "lifetime">("month")

  const displayValue = view === "month" ? totalSaved : lifetimeSaved
  const hasLifetimeData = lifetimeSaved > 0

  return (
    <div
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        backgroundColor: "var(--midnight)",
        color: "var(--bone)",
        boxShadow: "var(--shadow-float), inset 0 1px 0 rgba(245,241,234,0.07)",
      }}
    >
      {/* Ember glow — top right */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "-20%", top: "-30%", width: "70%", height: "70%",
          background: "radial-gradient(circle, rgba(232,80,42,0.35), transparent 60%)",
        }}
      />
      {/* Midnight-2 lift — bottom left, barely there, gives the card dimension */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "-25%", bottom: "-40%", width: "80%", height: "80%",
          background: "radial-gradient(circle, rgba(38,52,94,0.55), transparent 65%)",
        }}
      />

      <div className="relative">

        {/* Header: eyebrow + segmented control */}
        <div className="flex items-center justify-between mb-4">
          <p className="eyebrow" style={{ color: "rgba(245,241,234,0.5)", fontSize: "10px" }}>
            {view === "month" ? `${monthLabel} · AHORRO` : "AHORRO TOTAL"}
          </p>

          {hasLifetimeData && (
            <div
              className="relative grid grid-cols-2 rounded-full p-0.5"
              style={{ backgroundColor: "rgba(245,241,234,0.07)" }}
            >
              {/* Sliding thumb */}
              <div
                aria-hidden="true"
                className="absolute rounded-full"
                style={{
                  top: "2px",
                  bottom: "2px",
                  left: "2px",
                  width: "calc(50% - 2px)",
                  backgroundColor: "rgba(245,241,234,0.14)",
                  transform: view === "month" ? "translateX(0)" : "translateX(calc(100% - 2px))",
                  transition: `transform 260ms ${EASE}`,
                }}
              />
              {(["month", "lifetime"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="relative rounded-full px-3 py-1 font-semibold"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.02em",
                    color: view === v ? "var(--bone)" : "rgba(245,241,234,0.38)",
                    transition: `color 260ms ${EASE}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {v === "month" ? "Este mes" : "Total"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Counter — key forces remount to retrigger the count-up animation */}
        <SavingsCounter
          key={view}
          value={displayValue}
          color={displayValue > 0 ? "var(--ember)" : "var(--bone)"}
        />

        {/* Subtitle */}
        <div style={{ marginTop: "8px" }}>
          {displayValue === 0 && view === "month" ? (
            <p style={{ fontSize: "13px", color: "rgba(245,241,234,0.45)" }}>
              {potentialMonthly > 0
                ? `Conductores activos ahorran hasta $${potentialMonthly.toFixed(2)} al mes`
                : "Usa tus primeros beneficios para empezar a acumular."}
            </p>
          ) : view === "month" ? (
            <>
              <p style={{ fontSize: "13px", color: "rgba(245,241,234,0.5)" }}>
                {redemptionsThisMonth}{" "}
                {redemptionsThisMonth === 1 ? "beneficio usado" : "beneficios usados"} este mes
              </p>
              {roi >= 1 && (
                <p style={{ fontSize: "12px", color: "var(--verde)", marginTop: "4px", fontWeight: 600 }}>
                  Has recuperado {roi.toFixed(1)}x el precio de tu membresía
                </p>
              )}
            </>
          ) : (
            <p style={{ fontSize: "13px", color: "rgba(245,241,234,0.5)" }}>
              {totalRedemptions}{" "}
              {totalRedemptions === 1 ? "beneficio usado en total" : "beneficios usados en total"}
            </p>
          )}
        </div>

        {/* Bottom row: expiry + CTA */}
        <div className="flex items-end justify-between mt-6">
          <div>
            <p className="font-mono-brand" style={{ fontSize: "10px", opacity: 0.4, letterSpacing: "0.1em" }}>
              MEMBRESÍA ACTIVA HASTA
            </p>
            <p className="font-mono-brand font-medium mt-0.5" style={{ fontSize: "13px" }}>
              {expiresAt}
            </p>
            {daysUntilExpiry !== null && daysUntilExpiry > 7 && daysUntilExpiry <= 30 && (
              <span
                className="inline-flex items-center font-mono-brand font-semibold mt-2 px-2.5 py-1 rounded-full"
                style={{
                  fontSize: "11px",
                  backgroundColor: "rgba(201,167,53,0.18)",
                  color: "var(--sol)",
                  letterSpacing: "0.08em",
                }}
              >
                VENCE EN {daysUntilExpiry} DÍAS
              </span>
            )}
          </div>
          <Link href="/driver/benefits">
            <button
              className="pressable flex items-center gap-1.5 px-4 py-3 rounded-full font-semibold text-sm min-h-[44px]"
              style={{
                backgroundColor: "var(--ember)",
                color: "#fff",
                boxShadow: "var(--shadow-ember)",
              }}
            >
              Usar beneficios
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}
