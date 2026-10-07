import Link from "next/link"
import type { Dict, Lang } from "@/content/dictionaries"
import { MobileNav } from "@/components/mobile-nav"
import { pageHref } from "@/lib/pages"
import { SITE } from "@/lib/site"

export function SiteHeader({ dict, lang }: { dict: Dict; lang: Lang }) {
  const other: Lang = lang === "nl" ? "en" : "nl"
  // Echte pagina's in plaats van #ankers: die werken ook vanaf een subpagina,
  // en elke link vanuit het menu vertelt Google dat die pagina ertoe doet.
  const links = [
    { href: pageHref(lang, "work"), label: dict.nav.work },
    { href: pageHref(lang, "pricing"), label: dict.nav.pricing },
    { href: pageHref(lang, "process"), label: dict.nav.process },
    { href: pageHref(lang, "faq"), label: dict.nav.faq },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link
          href={`/${lang}`}
          className="font-display text-xl leading-none tracking-tight transition-opacity hover:opacity-70"
        >
          {SITE.name}
        </Link>

        <nav aria-label={dict.nav.label} className="ml-auto flex items-center">
          {/* Op mobiel klapt dezelfde lijst uit een <details>; de menulinks
              verdwijnen daar niet meer helemaal. */}
          <MobileNav links={links} label={dict.nav.menu} />

          <ul className="hidden items-center gap-7 sm:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-warm transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* De after:-laag rekt het tikvlak naar 44px zonder dat het element zelf
            groeit — anders zou de pil een stuk plomper worden en de balk van
            56px vullen. Onzichtbaar, vangt de tik, verschuift niets. */}
        <Link
          href={`/${other}`}
          aria-label={dict.langSwitch.other}
          className="relative font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-warm after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
        >
          {other}
        </Link>

        {/* Blijft ook op mobiel staan: de menulinks mogen weg op een klein
            scherm, de enige call-to-action niet. Naar het formulier op de
            homepage, zodat hij ook werkt op een pagina zonder formulier. */}
        <a
          href={`/${lang}#contact`}
          className="relative rounded-full bg-warm px-4 py-1.5 text-sm font-medium whitespace-nowrap text-warm-foreground transition-transform duration-200 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 active:translate-y-0 active:duration-75 after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"
        >
          {dict.nav.cta}
        </a>
      </div>
    </header>
  )
}
