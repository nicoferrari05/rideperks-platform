import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 512,
        height: 512,
        background: "#0F1B3D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          color: "#F5F1EA",
          fontWeight: 800,
          fontSize: 240,
          letterSpacing: -16,
          lineHeight: 1,
          fontFamily: "sans-serif",
        }}
      >
        RP
      </span>
    </div>,
    { width: 512, height: 512 }
  )
}
