import type { Lang } from "@/content/dictionaries"

/**
 * De juridische documenten en hun URL per taal. De sleutel is intern, de waarde
 * is wat in de adresbalk komt. Bron van waarheid voor de route, de sitemap en
 * de links in de footer en de formulieren — één plek, dus die kunnen niet
 * uiteenlopen.
 *
 * Bewust alleen data: dit bestand wordt ook door client components geïmporteerd
 * (de twee formulieren linken naar de privacyverklaring). Het inlezen van de
 * markdown staat daarom in de pagina zelf, niet hier — anders belandt
 * node:fs in de clientbundle en weigert de build.
 */
export const LEGAL = {
  terms: {
    slug: { nl: "algemene-voorwaarden", en: "terms" },
    // De voorwaarden bestaan alleen in het Nederlands: dat is de versie waar je
    // je aan bindt. Een vertaling zou een tweede tekst zijn die juridisch
    // nergens op slaat, dus /en toont dezelfde tekst met een Engelse inleiding.
    file: { nl: "algemene-voorwaarden.md", en: "algemene-voorwaarden.md" },
  },
  privacy: {
    slug: { nl: "privacy", en: "privacy" },
    file: { nl: "privacy.md", en: "privacy.en.md" },
  },
} as const

export type LegalKey = keyof typeof LEGAL

/** Van URL-segment terug naar document. undefined = onbekende pagina, dus 404. */
export function legalKeyBySlug(lang: Lang, slug: string): LegalKey | undefined {
  return (Object.keys(LEGAL) as LegalKey[]).find(
    (key) => LEGAL[key].slug[lang] === slug,
  )
}
