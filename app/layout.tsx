import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SonnerProvider } from "@/components/sonner-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sales Management System",
  description: "A comprehensive sales management system for agents, sales reps, and suppliers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <SonnerProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
