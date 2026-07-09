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
  width: "device-width",
  initialScale: 1,
  // Extends the layout under the notch/home indicator so env(safe-area-inset-*)
  // reports real values on iOS — every fixed surface relies on those insets.
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "RidePerks — Tu trabajo rinde más",
  description: "El club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá.",
  appleWebApp: {
    title: "RidePerks",
    capable: true,
    statusBarStyle: "black",
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
