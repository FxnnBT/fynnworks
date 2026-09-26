import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import Link from "next/link"
import { marked } from "marked"
import { ArrowLeft } from "lucide-react"
import { LANGS, type Lang, getDictionary, isLang } from "@/content/dictionaries"
import { GoatCounter } from "@/components/goatcounter"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { LEGAL, type LegalKey, legalKeyBySlug } from "@/lib/legal"
import { BUSINESS } from "@/lib/site"
import { notFound } from "next/navigation"

type Params = { lang: string; doc: string }

/**
 * De markdown staat in content/legal/ zodat je hem kunt bijwerken zonder een
 * regel TSX aan te raken. {{tokens}} komen uit BUSINESS: zo staat het adres of
 * KvK-nummer maar op één plek en kunnen de voorwaarden en de footer niet iets
 * verschillends beweren. Onbekende tokens blijven staan — dat valt op bij het
 * nalezen, waar een stille lege string dat niet doet.
 */
async function legalHtml(key: LegalKey, lang: Lang): Promise<string> {
  const file = path.join(
    process.cwd(),
    "content",
    "legal",
    LEGAL[key].file[lang],
  )
  const md = await readFile(file, "utf8")
  const filled = md.replace(
    /\{\{(\w+)\}\}/g,
    (all, token: string) => BUSINESS[token as keyof typeof BUSINESS] ?? all,
  )
  // De inhoud is van onszelf en staat in de repo, geen gebruikersinvoer.
  // breaks: een losse newline is een echte regelafbreking. Dat hebben de
  // adresblokken bovenaan beide documenten nodig; zonder dit lopen naam, adres,
  // KvK en btw-id aan elkaar vast tot één zin. Alinea's staan daarom op één
  // regel in de markdown — breek ze niet handmatig af.
  return marked.parse(filled, { async: false, breaks: true })
}

// Vier pagina's, twee talen, tekst die alleen wijzigt als jij een bestand
// aanpast: prima om bij de build vast te leggen. Anders dan de homepage, die
// projecten en reviews van schijf leest.
export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    Object.values(LEGAL).map((doc) => ({ lang, doc: doc.slug[lang] })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang, doc } = await params
  if (!isLang(lang)) return {}
  const key = legalKeyBySlug(lang, doc)
  if (!key) return {}
  const dict = getDictionary(lang)
  return {
    title: `${dict.legal[key]} — ${dict.meta.title}`,
    alternates: {
      canonical: `/${lang}/${doc}`,
      languages: Object.fromEntries(
        LANGS.map((l) => [l, `/${l}/${LEGAL[key].slug[l]}`]),
      ),
    },
  }
}

export default async function LegalPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { lang, doc } = await params
  if (!isLang(lang)) notFound()
  // Onbekende slug is een 404 en geen lege pagina — anders wordt /nl/[doc] een
  // gat waar elk verzonnen adres netjes een lege kop retourneert.
  const key = legalKeyBySlug(lang, doc)
  if (!key) notFound()

  const dict = getDictionary(lang)
  const html = await legalHtml(key, lang)
  // De voorwaarden bestaan alleen in het Nederlands; op /en zeggen we waarom.
  const notice = key === "terms" ? dict.legal.termsNotice : ""

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
        {/* Smaller dan de rest van de site: lopende tekst leest niet prettig
            over de volle 72rem. */}
        <div className="mx-auto max-w-[68ch] px-5 sm:px-8">
          <Link
            href={`/${lang}`}
            className="mb-12 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {dict.legal.back}
          </Link>

          {notice ? (
            <p className="mb-10 rounded-2xl border border-line bg-card/40 p-5 text-sm text-muted-foreground">
              {notice}
            </p>
          ) : null}

          {/* Onze eigen markdown uit content/legal/, in de repo en niet door
              een bezoeker aan te leveren. Geen sanitizer nodig. */}
          <article
            className="prose-legal"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </main>
      <SiteFooter dict={dict} lang={lang} />
      <GoatCounter />
    </>
  )
}
