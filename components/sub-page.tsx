import { Check } from "lucide-react"
import type { Dict, Lang } from "@/content/dictionaries"
import { Contact } from "@/components/contact"
import { Faq } from "@/components/faq"
import { Process } from "@/components/process"
import { Reviews } from "@/components/reviews"
import { Services } from "@/components/services"
import { Work } from "@/components/work"
import { faqJsonLd } from "@/lib/jsonld"
import type { PageKey } from "@/lib/pages"

type Render = (dict: Dict, lang: Lang) => React.ReactNode

/**
 * Welke secties van de homepage een pagina hergebruikt, en of die vóór of na
 * de eigen tekstblokken komen. Op /prijzen zijn de prijzen de hoofdzaak; op
 * een dienstpagina eerst wat je krijgt en pas daarna hoe het gaat. Een Record
 * zodat een nieuwe pagina in lib/pages.ts hier een typefout geeft tot je hem
 * invult.
 */
const SECTIONS: Record<PageKey, { before?: Render; after?: Render }> = {
  pricing: { before: (dict, lang) => <Services dict={dict} lang={lang} /> },
  work: {
    before: (dict, lang) => (
      <>
        <Work dict={dict} lang={lang} />
        <Reviews dict={dict} lang={lang} />
      </>
    ),
  },
  process: { before: (dict) => <Process dict={dict} /> },
  faq: {
    before: (dict, lang) => (
      <>
        {/* Vaste tekst uit de dictionary, geen bezoekersinvoer. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd(dict, lang)),
          }}
        />
        <Faq dict={dict} />
      </>
    ),
  },
  about: {},
  landing: { after: (dict) => <Process dict={dict} /> },
  business: { after: (dict) => <Process dict={dict} /> },
  webshop: { after: (dict) => <Process dict={dict} /> },
}

export function SubPage({
  page,
  dict,
  lang,
}: {
  page: PageKey
  dict: Dict
  lang: Lang
}) {
  const copy = dict.pages[page]
  const { before, after } = SECTIONS[page]

  return (
    <>
      {/* pt ruim genoeg voor de vaste header, en dezelfde opbouw als de hero:
          eyebrow, kop, uitleg. */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-4 pt-32 sm:px-8 sm:pt-40">
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-warm" />
          {copy.eyebrow}
        </p>
        <h1 className="text-display max-w-[16ch]">{copy.heading}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {copy.intro}
        </p>
      </section>

      {before?.(dict, lang)}

      {copy.blocks.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <ul className="border-t border-line">
            {copy.blocks.map((block) => (
              <li
                key={block.heading}
                className="grid gap-4 border-b border-line py-10 md:grid-cols-12 md:gap-8"
              >
                <h2 className="font-display text-3xl leading-tight md:col-span-4">
                  {block.heading}
                </h2>
                <div className="md:col-span-8">
                  <p className="max-w-2xl leading-relaxed text-muted-foreground">
                    {block.text}
                  </p>
                  {block.points ? (
                    <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                      {block.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="mt-0.5 size-3.5 shrink-0 text-warm" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {after?.(dict, lang)}

      <Contact dict={dict} lang={lang} />
    </>
  )
}
