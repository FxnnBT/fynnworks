import type { MetadataRoute } from "next"
import { SITE } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    // Demo's zijn klantwerk en placeholders — die horen niet naast de echte
    // site in de zoekresultaten. Caddy zet er ook een X-Robots-Tag op.
    // De briefinglinks zijn persoonlijk: nergens naartoe gelinkt, en hier ook
    // gevraagd om ze met rust te laten. Zie de X-Robots-Tag in next.config.ts.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/demo/", "/admin", "/nl/briefing/", "/en/briefing/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
