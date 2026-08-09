import Link from "next/link"
import type { Dict, Lang } from "@/content/dictionaries"
import { SITE } from "@/lib/site"

export function SiteHeader({ dict, lang }: { dict: Dict; lang: Lang }) {
  const other: Lang = lang === "nl" ? "en" : "nl"
  const links = [
    { href: "#work", label: dict.nav.work },
    { href: "#services", label: dict.nav.services },
    { href: "#process", label: dict.nav.process },
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

        <nav
          aria-label={dict.nav.work}
          className="ml-auto hidden items-center gap-7 sm:flex"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-warm transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <Link
          href={`/${other}`}
          aria-label={dict.langSwitch.label}
          className="ml-auto font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-warm sm:ml-0"
        >
          {other}
        </Link>

        {/* Blijft ook op mobiel staan: de ankerlinks mogen weg op een klein
            scherm, de enige call-to-action niet. */}
        <a
          href="#contact"
          className="rounded-full bg-warm px-4 py-1.5 text-sm font-medium whitespace-nowrap text-warm-foreground transition-transform duration-200 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
        >
          {dict.nav.cta}
        </a>
      </div>
    </header>
  )
}
