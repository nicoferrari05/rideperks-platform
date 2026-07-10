import type { Metadata, Viewport } from "next"
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import AppSplash from "@/components/shared/AppSplash"
import ServiceWorkerRegister from "@/components/shared/ServiceWorkerRegister"
import "./globals.css"

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["italic"],
  weight: "variable",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const viewport: Viewport = {
  themeColor: "#0F1B3D",
  width: "device-width",
  initialScale: 1,
  // Extends the layout under the notch/home indicator so env(safe-area-inset-*)
  // reports real values on iOS — every fixed surface relies on those insets.
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    : new URL("http://localhost:3000"),
  title: "RidePerks — Tu trabajo rinde más",
  description: "El club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá.",
  openGraph: {
    title: "RidePerks — Tu trabajo rinde más",
    description: "El club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá.",
    siteName: "RidePerks",
    locale: "es_PA",
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512 }],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    title: "RidePerks",
    capable: true,
    // Must pair with viewportFit:"cover" — "black" (opaque) contradicts
    // the edge-to-edge request and iOS resolves the conflict inconsistently,
    // producing a stray color strip around the notch/status bar.
    statusBarStyle: "black-translucent",
  },
  // Stops iOS from turning amounts, IDs and dates into blue tel: links;
  // real phone actions use explicit tel:/wa.me links.
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <AppSplash />
        {children}
        <Toaster
          richColors
          position="top-center"
          mobileOffset={{ top: "max(16px, calc(env(safe-area-inset-top, 0px) + 8px))" }}
        />
      </body>
    </html>
  )
}
