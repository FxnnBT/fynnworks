import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import { notFound } from "next/navigation"
import { LANGS, getDictionary, isLang } from "@/content/dictionaries"
import { SITE } from "@/lib/site"
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

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLang(lang)) return {}
  const dict = getDictionary(lang)
  return {
    metadataBase: new URL(SITE.url),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(LANGS.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${lang}`,
      siteName: SITE.name,
      locale: lang === "nl" ? "nl_NL" : "en_US",
      type: "website",
    },
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  return (
    <html
      lang={lang}
      // Bewust alleen donker: de shader-hero is bijna-zwart, een lichte
      // variant zou een tweede ontwerp zijn.
      className={`dark ${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
      // Browserextensies plakken attributen op <html> (bv. data-qb-installed)
      // en dat leest React als een hydration-mismatch. Dit onderdrukt alleen
      // dit element; echte mismatches dieper in de boom blijven zichtbaar.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
