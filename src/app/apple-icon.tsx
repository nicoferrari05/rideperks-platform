import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
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
          fontSize: 84,
          letterSpacing: -6,
          lineHeight: 1,
          fontFamily: "sans-serif",
        }}
      >
        RP
      </span>
    </div>,
    { width: 180, height: 180 }
  )
}
