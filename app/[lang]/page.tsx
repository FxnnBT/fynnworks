import { notFound } from "next/navigation"
import { getDictionary, isLang } from "@/content/dictionaries"
import { Contact } from "@/components/contact"
import { Faq } from "@/components/faq"
import { Hero } from "@/components/hero"
import { Process } from "@/components/process"
import { Services } from "@/components/services"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Work } from "@/components/work"

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
        <Services dict={dict} />
        <Process dict={dict} />
        <Faq dict={dict} />
        <Contact dict={dict} />
      </main>
      <SiteFooter dict={dict} />
    </>
  )
}
