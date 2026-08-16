import type { MetadataRoute } from "next"
import { LANGS } from "@/content/dictionaries"
import { SITE } from "@/lib/site"

// Geen lastModified: die zou bij elke build veranderen zonder dat de inhoud
// wijzigt, en dat is precies het signaal dat je niet wilt afgeven.
export default function sitemap(): MetadataRoute.Sitemap {
  return LANGS.map((lang) => ({
    url: `${SITE.url}/${lang}`,
    alternates: {
      languages: Object.fromEntries(
        LANGS.map((l) => [l, `${SITE.url}/${l}`]),
      ),
    },
  }))
}
