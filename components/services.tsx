import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import type { Dict, Lang } from "@/content/dictionaries"
import { SectionHeading } from "@/components/section-heading"
import { pageHref } from "@/lib/pages"

export function Services({ dict, lang }: { dict: Dict; lang: Lang }) {
  return (
    <section id="services" className="section-y scroll-mt-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.services.eyebrow}
          title={dict.services.title}
          lead={dict.services.vatNote}
        />

        {/* Rijen in plaats van drie gelijke kaarten: het prijsverschil is de
            hiërarchie, niet een even groot vakje per dienst. */}
        <ul className="border-t border-line">
          {dict.services.items.map((item, index) => (
            <li
              key={item.name}
              // Geen hover-oplichting: de rij is geen link, dus dat beloofde
              // een klik die er niet is. Met de tap-activeert-hover-variant
              // bleef die oplichting op touch bovendien staan.
              className="grid gap-6 border-b border-line py-10 md:grid-cols-12 md:gap-8"
            >
              <div className="md:col-span-1">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="md:col-span-4">
                <h3 className="font-display text-3xl leading-none">
                  {item.name}
                </h3>
                <p className="mt-3 font-mono text-sm text-warm">
                  {item.price}
                  {/* Alleen achter een echt bedrag: "op aanvraag incl. btw"
                      slaat nergens op, en de wet vraagt de vermelding ook
                      alleen daar waar een prijs staat. */}
                  {/\d/.test(item.price) ? (
                    <span className="text-muted-foreground">
                      {" "}
                      {dict.services.vatSuffix}
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="md:col-span-4">
                <p className="text-muted-foreground">{item.description}</p>
                {/* Gewone tekstlink, niet de hele rij: de linktekst is de
                    zoekterm ("landingspagina laten maken"), en dat is wat
                    Google van een interne link meeneemt. */}
                <Link
                  href={pageHref(lang, item.page)}
                  className="group mt-4 inline-flex items-center gap-1.5 text-sm text-warm"
                >
                  {dict.pages[item.page].label}
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              <ul className="flex flex-col gap-2 md:col-span-3">
                {item.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-warm" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
