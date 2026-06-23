import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RidePerks",
    short_name: "RidePerks",
    description: "El club de beneficios para conductores en Panamá.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0F1B3D",
    theme_color: "#0F1B3D",
    orientation: "portrait-primary",
    id: "/",
    icons: [
      {
        // Android Chrome uses "any" purpose for install prompt and splash screen
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        // Android adaptive icon (rounded/squircle shape)
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}
