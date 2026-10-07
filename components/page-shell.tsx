import type { Dict, Lang } from "@/content/dictionaries"
import { GoatCounter } from "@/components/goatcounter"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

/** Wat elke pagina om zijn inhoud heen heeft: skip-link, header, footer. */
export function PageShell({
  dict,
  lang,
  className,
  children,
}: {
  dict: Dict
  lang: Lang
  className?: string
  children: React.ReactNode
}) {
  return (
    <>
      {/* Onzichtbaar tot je erheen tabt. Zonder dit loopt een toetsenbord elke
          keer eerst door de hele header voordat het bij de inhoud is. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-4 focus:z-100 focus:rounded-full focus:bg-warm focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-warm-foreground"
      >
        {dict.nav.skip}
      </a>
      <SiteHeader dict={dict} lang={lang} />
      <main id="main" className={className}>
        {children}
      </main>
      <SiteFooter dict={dict} lang={lang} />
      <GoatCounter />
    </>
  )
}
