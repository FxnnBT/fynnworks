import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDictionary, isLang } from "@/content/dictionaries"
import { BriefForm } from "@/components/brief-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { BRIEF_UI, TOKEN_PATTERN } from "@/lib/brief"
import { findInvite } from "@/lib/data"
import { MAX_UPLOAD_BYTES } from "@/lib/store"

type Params = { lang: string; token: string }

// De links staan op schijf en worden in /admin aangemaakt: bij de build weten
// we ze niet, en een gecachete versie zou een net ingetrokken link nog een tijd
// laten werken.
export const dynamic = "force-dynamic"

// Geen publieke briefingpagina: dit adres krijg je van mij of je krijgt het
// niet. Vandaar geen link ernaartoe, niet in de sitemap, en dit erbovenop.
// De X-Robots-Tag in next.config.ts zegt hetzelfde nog eens in de header.
export const metadata: Metadata = {
  title: "Briefing",
  robots: { index: false, follow: false },
  // Klikt de klant hierna door naar de rest van de site, dan zou het adres
  // mét token als verwijzer meegaan, en GoatCounter bewaart verwijzers.
  referrer: "no-referrer",
}

export default async function BriefingPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { lang, token } = await params
  if (!isLang(lang)) notFound()

  // Onbekende of ingetrokken link is een 404 en geen leeg formulier: anders
  // wordt dit een open endpoint met een extra klik ervoor.
  const invite = TOKEN_PATTERN.test(token) ? await findInvite(token) : undefined
  if (!invite || invite.lang !== lang) notFound()

  const dict = getDictionary(lang)

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-4 focus:z-100 focus:rounded-full focus:bg-warm focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-warm-foreground"
      >
        {dict.nav.skip}
      </a>
      <SiteHeader dict={dict} lang={lang} />
      <main id="main" className="section-y">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-warm" />
            {BRIEF_UI.invited[lang]} {invite.label}
          </p>
          <h1 className="text-section">{BRIEF_UI.title[lang]}</h1>
          <p className="mt-6 max-w-prose text-muted-foreground">
            {BRIEF_UI.lead[lang]}
          </p>

          <div className="mt-16">
            {/* maxMb als getal en niet als import in de client: lib/store
                trekt node:fs mee de bundel in. Zie ProjectForm. */}
            <BriefForm
              lang={lang}
              token={invite.token}
              privacyLabel={dict.legal.privacy}
              maxMb={MAX_UPLOAD_BYTES / (1024 * 1024)}
            />
          </div>
        </div>
      </main>
      <SiteFooter dict={dict} lang={lang} />
    </>
  )
}
