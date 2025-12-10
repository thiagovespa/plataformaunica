import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Plataforma Única - ONS",
  description:
    "Sistema de distribuição proporcional e conciliação inteligente de pagamentos do Operador Nacional do Sistema Elétrico",
  generator: "v0.app",
  applicationName: "Plataforma Única ONS",
  authors: [{ name: "ONS - Operador Nacional do Sistema Elétrico" }],
  keywords: [
    "ONS",
    "conciliação",
    "pagamentos",
    "distribuição",
    "energia elétrica",
    "liquidação",
    "sistema financeiro",
  ],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://plataforma-unica-ons.vercel.app",
    siteName: "Plataforma Única ONS",
    title: "Plataforma Única - ONS",
    description:
      "Sistema de distribuição proporcional e conciliação inteligente de pagamentos do Operador Nacional do Sistema Elétrico",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Plataforma Única ONS - Sistema de Conciliação e Distribuição de Pagamentos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plataforma Única - ONS",
    description: "Sistema de distribuição proporcional e conciliação inteligente de pagamentos",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066CC" },
    { media: "(prefers-color-scheme: dark)", color: "#003366" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
