"use client"

import { ThemeProvider } from "./theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import Navbar from "./Navbar"
import Footer from "./Footer"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </LanguageProvider>
    </ThemeProvider>
  )
}
