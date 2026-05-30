import { ImageResponse } from "next/og"
import { readFileSync } from "fs"
import { join } from "path"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  const font = readFileSync(
    join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Black.ttf")
  )

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
          fontFamily: "Geist",
          fontWeight: 900,
          fontSize: 240,
          letterSpacing: -16,
          lineHeight: 1,
        }}
      >
        RP
      </span>
    </div>,
    {
      width: 512,
      height: 512,
      fonts: [{ name: "Geist", data: font, weight: 900, style: "normal" }],
    }
  )
}
