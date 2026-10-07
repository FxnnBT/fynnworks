import type { Lang } from "@/content/dictionaries"

/**
 * De losse pagina's naast de homepage, met hun URL per taal. Zelfde opzet als
 * LEGAL in lib/legal.ts: bron van waarheid voor de route, de sitemap, het menu
 * en de footer. De teksten staan in content/pages.ts.
 *
 * Elke pagina is een eigen URL die Google kan indexeren en waar een zoekterm
 * als "landingspagina laten maken" op kan landen. De homepage kan maar op één
 * zoekterm tegelijk het sterkst zijn.
 */
export const PAGES = {
  pricing: { slug: { nl: "prijzen", en: "pricing" } },
  work: { slug: { nl: "portfolio", en: "portfolio" } },
  process: { slug: { nl: "hoe-werkt-het", en: "how-it-works" } },
  faq: { slug: { nl: "faq", en: "faq" } },
  about: { slug: { nl: "over-mij", en: "about" } },
  landing: {
    slug: { nl: "landingspagina-laten-maken", en: "landing-page" },
  },
  business: {
    slug: { nl: "bedrijfswebsite-laten-maken", en: "business-website" },
  },
  webshop: { slug: { nl: "webshop-laten-maken", en: "web-shop" } },
} as const

export type PageKey = keyof typeof PAGES

export function pageHref(lang: Lang, key: PageKey): string {
  return `/${lang}/${PAGES[key].slug[lang]}`
}

/** Van URL-segment terug naar pagina. undefined = geen van deze pagina's. */
export function pageKeyBySlug(lang: Lang, slug: string): PageKey | undefined {
  return (Object.keys(PAGES) as PageKey[]).find(
    (key) => PAGES[key].slug[lang] === slug,
  )
}
