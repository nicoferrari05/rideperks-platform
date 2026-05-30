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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sol → Ember gradient orb */}
      <div
        style={{
          position: "absolute",
          bottom: -36,
          left: -36,
          width: 180,
          height: 180,
          borderRadius: 90,
          background: "radial-gradient(circle at 35% 35%, #F2B73B 0%, #E8502A 65%)",
          display: "flex",
        }}
      />
      {/* RP monogram */}
      <span
        style={{
          position: "relative",
          color: "#F5F1EA",
          fontWeight: 800,
          fontSize: 80,
          letterSpacing: -5,
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
