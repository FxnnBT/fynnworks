import { Plus } from "lucide-react"
import type { Dict } from "@/content/dictionaries"
import { SectionHeading } from "@/components/section-heading"

export function Faq({ dict }: { dict: Dict }) {
  return (
    <section id="faq" className="section-y scroll-mt-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.faq.eyebrow}
          title={dict.faq.title}
          lead={dict.faq.lead}
        />

        {/* <details name="faq"> klapt de vorige vraag zelf dicht — dat is een
            browserfunctie, geen JavaScript. Toetsenbord en schermlezer werken
            daardoor uit zichzelf goed. In oudere browsers blijven meerdere
            vragen open staan; dat is het enige verschil. */}
        <ul className="border-t border-line">
          {dict.faq.items.map((item, index) => (
            <li key={item.question} className="border-b border-line">
              <details name="faq" className="group">
                {/* minmax(0,1fr) in plaats van 1fr: anders krimpt de
                    vraagkolom niet onder het langste woord en steekt een lange
                    vraag op een smal scherm buiten de rij. */}
                <summary className="grid cursor-pointer list-none grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-4 py-7 outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.03] [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden
                    className="mt-1.5 font-mono text-xs text-muted-foreground transition-colors group-open:text-warm"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="font-display text-xl leading-snug sm:text-2xl">
                    {item.question}
                  </h3>

                  <Plus
                    aria-hidden
                    className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45 group-open:text-warm"
                  />
                </summary>

                {/* pl-12 = de 2rem nummerkolom plus de gap-4 ernaast, zodat het
                    antwoord precies onder de vraag begint. */}
                <p className="max-w-2xl pb-8 pl-12 leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
