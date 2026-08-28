import type { MetadataRoute } from "next"
import { SITE } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    // Demo's zijn klantwerk en placeholders — die horen niet naast de echte
    // site in de zoekresultaten. Caddy zet er ook een X-Robots-Tag op.
    rules: { userAgent: "*", allow: "/", disallow: "/demo/" },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
