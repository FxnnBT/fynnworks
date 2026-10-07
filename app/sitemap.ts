import type { MetadataRoute } from "next"
import { LANGS } from "@/content/dictionaries"
import { LEGAL } from "@/lib/legal"
import { PAGES } from "@/lib/pages"
import { SITE } from "@/lib/site"

// Geen lastModified: die zou bij elke build veranderen zonder dat de inhoud
// wijzigt, en dat is precies het signaal dat je niet wilt afgeven.
export default function sitemap(): MetadataRoute.Sitemap {
  const home = LANGS.map((lang) => ({
    url: `${SITE.url}/${lang}`,
    alternates: {
      languages: Object.fromEntries(
        LANGS.map((l) => [l, `${SITE.url}/${l}`]),
      ),
    },
  }))

  // De losse pagina's en de juridische. Die laatste horen ook vindbaar te
  // zijn: dat is het halve punt van ze publiceren. Slugs verschillen per taal.
  const docs = [...Object.values(PAGES), ...Object.values(LEGAL)]
  const sub = LANGS.flatMap((lang) =>
    docs.map((doc) => ({
      url: `${SITE.url}/${lang}/${doc.slug[lang]}`,
      alternates: {
        languages: Object.fromEntries(
          LANGS.map((l) => [l, `${SITE.url}/${l}/${doc.slug[l]}`]),
        ),
      },
    })),
  )

  return [...home, ...sub]
}
