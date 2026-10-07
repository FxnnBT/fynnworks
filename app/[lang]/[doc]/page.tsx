import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Metadata } from "next"
import Link from "next/link"
import { marked } from "marked"
import { ArrowLeft } from "lucide-react"
import { LANGS, type Lang, getDictionary, isLang } from "@/content/dictionaries"
import { PageShell } from "@/components/page-shell"
import { SubPage } from "@/components/sub-page"
import { LEGAL, type LegalKey, legalKeyBySlug } from "@/lib/legal"
import { PAGES, pageKeyBySlug } from "@/lib/pages"
import { BUSINESS, SITE } from "@/lib/site"
import { notFound } from "next/navigation"

type Params = { lang: string; doc: string }

// Eén segment, twee soorten pagina's: de losse pagina's uit lib/pages.ts en de
// juridische uit lib/legal.ts. Next staat maar één dynamisch segment per niveau
// toe, en de slugs verschillen per taal, dus vaste mappen gaan niet.
//
// /portfolio leest werk en reviews van schijf; zie de uitleg in ../page.tsx.
// De rest zou statisch kunnen, maar per request renderen kost hier niets.
export const dynamic = "force-dynamic"

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

/** Canonical plus de versie in elke taal. Zonder eigen canonical erft een
 *  subpagina die van de layout (/nl) en ziet Google hem als kopie van de
 *  homepage — dan wordt hij niet geïndexeerd. */
function alternates(lang: Lang, slug: Record<Lang, string>) {
  return {
    canonical: `/${lang}/${slug[lang]}`,
    languages: Object.fromEntries(LANGS.map((l) => [l, `/${l}/${slug[l]}`])),
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang, doc } = await params
  if (!isLang(lang)) return {}
  const dict = getDictionary(lang)

  const page = pageKeyBySlug(lang, doc)
  if (page) {
    const { title, description } = dict.pages[page]
    const links = alternates(lang, PAGES[page].slug)
    // openGraph en twitter vervangen die van de layout in hun geheel (Next
    // voegt metadata ondiep samen), dus alles wat de layout zet staat hier
    // opnieuw. Anders deelt een link naar /prijzen de titel van de homepage.
    // Ook de afbeelding: die van ../opengraph-image.tsx valt mee weg.
    const shared = `${title} | ${SITE.name}`
    const image = {
      url: `/${lang}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: SITE.name,
    }
    return {
      title,
      description,
      alternates: links,
      openGraph: {
        title: shared,
        description,
        url: links.canonical,
        siteName: SITE.name,
        locale: lang === "nl" ? "nl_NL" : "en_US",
        type: "website",
        images: [image],
      },
      twitter: {
        card: "summary_large_image",
        title: shared,
        description,
        images: [image],
      },
    }
  }

  const key = legalKeyBySlug(lang, doc)
  if (!key) return {}
  return {
    title: dict.legal[key],
    alternates: alternates(lang, LEGAL[key].slug),
  }
}

export default async function DocPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { lang, doc } = await params
  if (!isLang(lang)) notFound()
  const dict = getDictionary(lang)

  const page = pageKeyBySlug(lang, doc)
  if (page) {
    return (
      <PageShell dict={dict} lang={lang}>
        <SubPage page={page} dict={dict} lang={lang} />
      </PageShell>
    )
  }

  // Onbekende slug is een 404 en geen lege pagina — anders wordt /nl/[doc] een
  // gat waar elk verzonnen adres netjes een lege kop retourneert.
  const key = legalKeyBySlug(lang, doc)
  if (!key) notFound()

  const html = await legalHtml(key, lang)
  // De voorwaarden bestaan alleen in het Nederlands; op /en zeggen we waarom.
  const notice = key === "terms" ? dict.legal.termsNotice : ""

  return (
    <PageShell dict={dict} lang={lang} className="section-y">
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
    </PageShell>
  )
}
