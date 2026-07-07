"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import SavingsCounter from "./SavingsCounter"
import SavingsProgressBar from "./SavingsProgressBar"
import YappyPayButton from "./YappyPayButton"

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
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ backgroundColor: "var(--midnight)", color: "var(--bone)" }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          right: "-20%", top: "-30%", width: "70%", height: "70%",
          background: "radial-gradient(circle, rgba(232,80,42,0.35), transparent 60%)",
        }}
      />

      <div className="relative">

        {/* Header: eyebrow + toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="eyebrow" style={{ color: "rgba(245,241,234,0.5)", fontSize: "10px" }}>
            {view === "month" ? `${monthLabel} · AHORRO` : "AHORRO TOTAL"}
          </p>

          {hasLifetimeData && (
            <div
              className="flex items-center rounded-full p-0.5 gap-0.5"
              style={{ backgroundColor: "rgba(245,241,234,0.07)" }}
            >
              <button
                onClick={() => setView("month")}
                className="rounded-full px-3 py-1 font-semibold"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.02em",
                  backgroundColor: view === "month" ? "rgba(245,241,234,0.14)" : "transparent",
                  color: view === "month" ? "var(--bone)" : "rgba(245,241,234,0.38)",
                  transition: "background-color 180ms cubic-bezier(0.23, 1, 0.32, 1), color 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                Este mes
              </button>
              <button
                onClick={() => setView("lifetime")}
                className="rounded-full px-3 py-1 font-semibold"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.02em",
                  backgroundColor: view === "lifetime" ? "rgba(245,241,234,0.14)" : "transparent",
                  color: view === "lifetime" ? "var(--bone)" : "rgba(245,241,234,0.38)",
                  transition: "background-color 180ms cubic-bezier(0.23, 1, 0.32, 1), color 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                Total
              </button>
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

        {/* Progress bar — monthly view only */}
        {view === "month" && potentialMonthly > 0 && (
          <div style={{ marginTop: "20px" }}>
            <SavingsProgressBar
              current={totalSaved}
              max={potentialMonthly}
              variant="full"
              monthLabel={monthLabel}
            />
          </div>
        )}

        {/* Bottom row: expiry + CTA */}
        <div className="flex items-end justify-between mt-6">
          <div>
            <p className="font-mono-brand" style={{ fontSize: "10px", opacity: 0.5, letterSpacing: "0.1em" }}>
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
              style={{ backgroundColor: "var(--ember)", color: "#fff" }}
            >
              Usar beneficios
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* Yappy renewal button */}
        <div
          className="mt-4 pt-4 flex flex-col items-center gap-2"
          style={{ borderTop: "1px solid rgba(245,241,234,0.08)" }}
        >
          <p className="font-mono-brand" style={{ fontSize: "10px", opacity: 0.45, letterSpacing: "0.1em" }}>
            RENOVAR MEMBRESÍA · B/. 15.00
          </p>
          <YappyPayButton />
        </div>

      </div>
    </div>
  )
}
