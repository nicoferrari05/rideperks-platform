"use client"

import YappyPayButton from "./YappyPayButton"

export default function PaymentBanner({ phone }: { phone: string }) {
  return (
    <div
      className="w-full rounded-2xl px-5 py-4 mb-2"
      style={{
        backgroundColor: "var(--midnight)",
        border: "1px solid rgba(232,80,42,0.2)",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.16em",
          color: "rgba(232,80,42,0.7)",
          marginBottom: "4px",
        }}
      >
        MEMBRESÍA INACTIVA
      </p>
      <p
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--bone)",
          lineHeight: 1.4,
          marginBottom: "14px",
        }}
      >
        Activa tu membresía para usar todos los beneficios · B/. 15.00/mes
      </p>
      <YappyPayButton defaultPhone={phone} />
    </div>
  )
}
