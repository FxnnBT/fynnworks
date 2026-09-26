import { notFound } from "next/navigation"
import { getDictionary, isLang } from "@/content/dictionaries"
import { Contact } from "@/components/contact"
import { Faq } from "@/components/faq"
import { GoatCounter } from "@/components/goatcounter"
import { Hero } from "@/components/hero"
import { Process } from "@/components/process"
import { Reviews } from "@/components/reviews"
import { Services } from "@/components/services"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Work } from "@/components/work"

// Werk en reviews staan op schijf, niet in de code. De layout genereert
// statische params voor /nl en /en, dus zonder dit zou next build de lijst van
// dat moment inbakken - en dat moment is een handmatige build zonder
// $STATE_DIRECTORY. Per request renderen kost hier niets en scheelt alle
// cache-invalidatie na een wijziging in /admin.
export const dynamic = "force-dynamic"

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLang(lang)) notFound()
  const dict = getDictionary(lang)

  return (
    <>
      {/* Onzichtbaar tot je erheen tabt. Zonder dit loopt een toetsenbord elke
          keer eerst door de hele header voordat het bij de inhoud is. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-4 focus:z-100 focus:rounded-full focus:bg-warm focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-warm-foreground"
      >
        {dict.nav.skip}
      </a>
      <SiteHeader dict={dict} lang={lang} />
      <main id="main">
        <Hero dict={dict} />
        <Work dict={dict} lang={lang} />
        <Reviews dict={dict} lang={lang} />
        <Services dict={dict} />
        <Process dict={dict} />
        <Faq dict={dict} />
        <Contact dict={dict} lang={lang} />
      </main>
      <SiteFooter dict={dict} lang={lang} />
      <GoatCounter />
    </>
  )
}
