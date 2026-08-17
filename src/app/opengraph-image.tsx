import { ImageResponse } from "next/og"

export const alt = "RidePerks — Tu trabajo rinde más"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#141B33",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-140px",
            right: "-120px",
            width: "560px",
            height: "560px",
            borderRadius: "9999px",
            backgroundColor: "rgba(216,84,44,0.35)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "9999px", backgroundColor: "#D8542C", display: "flex" }} />
          <div style={{ fontSize: "22px", letterSpacing: "4px", color: "#D8542C", fontWeight: 700, display: "flex" }}>
            RIDEPERKS
          </div>
        </div>
        <div
          style={{
            fontSize: "76px",
            fontWeight: 800,
            color: "#F5F1EA",
            lineHeight: 1.02,
            letterSpacing: "-3px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span style={{ display: "flex" }}>Tu trabajo</span>
          <span style={{ display: "flex" }}>
            rinde <span style={{ color: "#D8542C", marginLeft: "22px" }}>más.</span>
          </span>
        </div>
        <div style={{ fontSize: "28px", color: "rgba(245,241,234,0.55)", marginTop: "32px", display: "flex" }}>
          El club de beneficios para conductores en Panamá
        </div>
      </div>
    ),
    { ...size }
  )
}
