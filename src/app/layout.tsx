import type { Metadata, Viewport } from "next"
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import AppSplash from "@/components/shared/AppSplash"
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
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "RidePerks — Tu trabajo rinde más",
  description: "El club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá.",
  appleWebApp: {
    title: "RidePerks",
    capable: true,
    statusBarStyle: "black-translucent",
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
        {/* Fixed dark strip behind the iOS status bar so it never shows the page's own background color */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "env(safe-area-inset-top, 0px)",
            backgroundColor: "#0F1B3D",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
        <AppSplash />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
