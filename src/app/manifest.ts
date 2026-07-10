import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RidePerks",
    short_name: "RidePerks",
    description: "El club de beneficios para conductores en Panamá.",
    lang: "es",
    dir: "ltr",
    categories: ["finance", "lifestyle"],
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0F1B3D",
    theme_color: "#0F1B3D",
    orientation: "portrait-primary",
    id: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Full-bleed square with the mark in the safe zone — Android
        // masks this into its circle/squircle adaptive shape.
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}
