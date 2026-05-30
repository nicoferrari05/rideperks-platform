import type { Metadata } from "next"
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
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

export const metadata: Metadata = {
  title: "RidePerks — Tu trabajo rinde más",
  description: "El club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá.",
  appleWebApp: {
    title: "RidePerks",
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
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
