"use client"

import QRCode from "react-qr-code"

export default function MembershipQR({ driverId }: { driverId: string }) {
  const value = `member:${driverId}`

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: "var(--paper)", border: "1px solid var(--line)" }}
    >
      <p className="eyebrow mb-4">TU QR DE MEMBRESÍA</p>

      <div className="flex flex-col items-center gap-4">
        <div
          className="p-4 rounded-2xl"
          style={{ backgroundColor: "#fff", border: "1px solid var(--line)" }}
        >
          <QRCode value={value} size={180} />
        </div>

        <p className="text-sm text-center" style={{ color: "var(--mute)" }}>
          Muestra este QR en cualquier comercio aliado para que escaneen y confirmen tu membresía.
        </p>
      </div>
    </div>
  )
}
