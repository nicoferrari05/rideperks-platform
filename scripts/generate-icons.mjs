// One-off generator for the static PWA icons in public/.
// Reuses the exact "RP" pill design the dynamic icon.tsx/apple-icon.tsx used,
// rendered through the same engine (satori via next/og) so output is identical.
// Run: node scripts/generate-icons.mjs
import { ImageResponse } from "next/og.js"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

const font = readFileSync(
  join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Black.ttf")
)

function rpIcon(size, { radius, fontSize, letterSpacing }) {
  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: size,
          height: size,
          background: "#0F1B3D",
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        children: {
          type: "span",
          props: {
            style: {
              color: "#F5F1EA",
              fontFamily: "Geist",
              fontWeight: 900,
              fontSize,
              letterSpacing,
              lineHeight: 1,
            },
            children: "RP",
          },
        },
      },
    },
    {
      width: size,
      height: size,
      fonts: [{ name: "Geist", data: font, weight: 900, style: "normal" }],
    }
  )
}

// A single-image .ico whose payload is a PNG (valid for every modern browser).
function pngToIco(png, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // one image
  const entry = Buffer.alloc(16)
  entry[0] = size === 256 ? 0 : size
  entry[1] = size === 256 ? 0 : size
  entry.writeUInt16LE(1, 4) // color planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(22, 12) // data offset (6 + 16)
  return Buffer.concat([header, entry, png])
}

async function save(name, response) {
  const buf = Buffer.from(await response.arrayBuffer())
  writeFileSync(join(process.cwd(), "public", name), buf)
  console.log(`public/${name} — ${buf.length} bytes`)
  return buf
}

// Round icons (matches the old /icon route exactly at 512)
await save("icon-512.png", rpIcon(512, { radius: 256, fontSize: 240, letterSpacing: -16 }))
await save("icon-192.png", rpIcon(192, { radius: 96, fontSize: 90, letterSpacing: -6 }))

// Maskable: full-bleed square, mark inside the central safe zone so
// Android's circle/squircle mask never clips it.
await save("icon-maskable-512.png", rpIcon(512, { radius: 0, fontSize: 200, letterSpacing: -13 }))

// iOS home screen: solid background, no radius (iOS rounds it itself)
await save("apple-touch-icon.png", rpIcon(180, { radius: 0, fontSize: 84, letterSpacing: -6 }))

// Favicon: 32px square wrapped as .ico
const fav = await save("favicon-32.png", rpIcon(32, { radius: 8, fontSize: 15, letterSpacing: -1 }))
writeFileSync(join(process.cwd(), "public", "favicon.ico"), pngToIco(fav, 32))
console.log("public/favicon.ico written")
