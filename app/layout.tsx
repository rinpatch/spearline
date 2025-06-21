import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ScrollToTop from "./scroll-to-top"

export const metadata: Metadata = {
  title: "Spearline - Piercing Bias. Truth in the Line.",
  description: "AI-powered bias transparency for Malaysian news"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  )
}
