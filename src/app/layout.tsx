import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "../lib/utils"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"

import "react-loading-skeleton/dist/skeleton.css"
import { Toaster } from "@/components/ui/toaster"

import "simplebar-react/dist/simplebar.min.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Dokubot at your service!",
  description: "Create a Robot out of your PDF Documents!",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <Providers>
        <body
          className={cn(
            "min-h-screen font-sans antialiased grainy",
            `${geistSans.variable} ${geistMono.variable} antialiased`
          )}
        >
          <Toaster />
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  )
}
