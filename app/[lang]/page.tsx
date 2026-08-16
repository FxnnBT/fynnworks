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
      <SiteHeader dict={dict} lang={lang} />
      <main>
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
