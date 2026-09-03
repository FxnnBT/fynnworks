import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import "../globals.css"

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Beheer — fynnworks",
  robots: { index: false, follow: false },
}

/**
 * Dit is een tweede root layout: app/[lang]/layout.tsx zet de <html> voor de
 * site neer, maar /admin ligt daarbuiten en heeft dus een eigen. Alleen
 * Nederlands, geen header en geen footer — dit is geen pagina voor bezoekers.
 *
 * De inlogcontrole staat bewust in page.tsx en niet hier: een layout krijgt
 * children als al gerenderd element binnen, dus een gate hier houdt de pagina
 * wel uit beeld maar niet uit de RSC-payload — de wachtende reviews zouden dan
 * gewoon in de broncode van het inlogscherm staan.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="nl"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  )
}
