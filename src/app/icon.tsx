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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sol → Ember gradient orb — bottom-left, per brand Dir. 02 */}
      <div
        style={{
          position: "absolute",
          bottom: -102,
          left: -102,
          width: 512,
          height: 512,
          borderRadius: 256,
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
          fontSize: 228,
          letterSpacing: -14,
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
