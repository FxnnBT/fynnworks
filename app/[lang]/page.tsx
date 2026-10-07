import { notFound } from "next/navigation"
import { getDictionary, isLang } from "@/content/dictionaries"
import { Contact } from "@/components/contact"
import { Faq } from "@/components/faq"
import { Hero } from "@/components/hero"
import { PageShell } from "@/components/page-shell"
import { Process } from "@/components/process"
import { Reviews } from "@/components/reviews"
import { Services } from "@/components/services"
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
    <PageShell dict={dict} lang={lang}>
      <Hero dict={dict} />
      <Work dict={dict} lang={lang} />
      <Reviews dict={dict} lang={lang} />
      <Services dict={dict} lang={lang} />
      <Process dict={dict} />
      <Faq dict={dict} />
      <Contact dict={dict} lang={lang} />
    </PageShell>
  )
}
