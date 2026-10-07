import Link from "next/link"
import type { Dict, Lang } from "@/content/dictionaries"
import { LEGAL } from "@/lib/legal"
import { PAGES, type PageKey, pageHref } from "@/lib/pages"
import { BUSINESS, SITE } from "@/lib/site"

export function SiteFooter({ dict, lang }: { dict: Dict; lang: Lang }) {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 text-sm text-muted-foreground sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg text-foreground">{SITE.name}</p>
          <p>{dict.footer.tagline}</p>
          <p className="font-mono text-xs">
            © {new Date().getFullYear()} {SITE.name}. {dict.footer.rights}
          </p>
        </div>

        {/* Elke pagina vanaf elke pagina bereikbaar. Google volgt links; een
            pagina waar niets naartoe linkt, komt hooguit via de sitemap
            binnen en weegt dan licht. */}
        <nav aria-label={dict.footer.pages}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {(Object.keys(PAGES) as PageKey[]).map((key) => (
              <li key={key}>
                <Link
                  href={pageHref(lang, key)}
                  className="transition-colors hover:text-foreground"
                >
                  {dict.pages[key].label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Art. 3:15d BW en de Dienstenwet: vestigingsadres, KvK-nummer en
            btw-identificatienummer moeten op de site zelf staan, niet pas op de
            factuur. Alle waarden komen uit BUSINESS in lib/site.ts. */}
        <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-end sm:justify-between">
          <address className="font-mono text-xs not-italic leading-relaxed">
            {BUSINESS.legalName}
            <br />
            {BUSINESS.street}, {BUSINESS.postcode} {BUSINESS.city}
            <br />
            {dict.footer.kvk} {BUSINESS.kvk} · {dict.footer.vat} {BUSINESS.vat}
            <br />
            <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
              {SITE.email}
            </a>
          </address>

          <nav className="flex gap-6" aria-label={dict.footer.privacy}>
            <Link
              href={`/${lang}/${LEGAL.privacy.slug[lang]}`}
              className="transition-colors hover:text-foreground"
            >
              {dict.footer.privacy}
            </Link>
            <Link
              href={`/${lang}/${LEGAL.terms.slug[lang]}`}
              className="transition-colors hover:text-foreground"
            >
              {dict.footer.terms}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
