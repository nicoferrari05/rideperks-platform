import { ImageResponse } from "next/og"
import { readFileSync } from "fs"
import { join } from "path"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  const font = readFileSync(
    join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Black.ttf")
  )

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
          fontFamily: "Geist",
          fontWeight: 900,
          fontSize: 84,
          letterSpacing: -6,
          lineHeight: 1,
        }}
      >
        RP
      </span>
    </div>,
    {
      width: 180,
      height: 180,
      fonts: [{ name: "Geist", data: font, weight: 900, style: "normal" }],
    }
  )
}
