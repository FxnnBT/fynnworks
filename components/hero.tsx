import { ArrowDownRight } from "lucide-react"
import type { Dict } from "@/content/dictionaries"
import { ShaderBackground } from "@/components/ui/waves-background-2"

export function Hero({ dict }: { dict: Dict }) {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        {/* Statische achtergrond, ligt er altijd onder. De shader tekent
            dekkend, dus normaal zie je hem niet. Draait de shader niet — geen
            WebGL, mislukte compile, verloren context, of minder beweging
            gevraagd — dan blijft dit staan in plaats van een leeg vlak.
            De lichte plek staat rechtsboven: het enige stuk dat de scrim in
            beide layouts vrijlaat. */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_80%_15%,oklch(0.32_0_0),oklch(0.145_0_0)_60%)]" />
        <div className="absolute inset-0 motion-reduce:hidden">
          <ShaderBackground className="h-full w-full" />
        </div>
        {/* Scrim. De shader wordt lokaal tot ~234/255 licht; witte tekst is
            daarop onleesbaar. Op portret staat de tekst onderaan, dus daar
            loopt de scrim van boven naar onder — anders blijft er van de
            golven alleen een strookje rechtsboven over. Twee losse elementen
            i.p.v. sm:-varianten op één div: Tailwind v4 stelt gradients samen
            uit CSS-variabelen, en positie én stops overschrijven op hetzelfde
            element is fragieler dan het gewoon om te wisselen.
            De verloop loopt bewust snel op: iOS krimpt 100svh naar ~665px zodra
            de Safari-balken staan, en omdat de tekst onderaan hangt zit de kop
            dan op ~47% i.p.v. ~70% — dus juist daar moet het al donker zijn. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background sm:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-background via-background/85 to-background/25 sm:block" />
        {/* Laat de shader naar de paginakleur zakken zodat de eerste sectie
            eronder doorloopt in plaats van er hard tegenaan te botsen. */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-32 sm:px-8">
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-warm" />
          {dict.hero.eyebrow}
        </p>

        <h1 className="text-display max-w-[15ch] whitespace-pre-line">
          {dict.hero.title}
        </h1>

        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {dict.hero.lead}
          </p>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-warm px-6 py-3 text-sm font-medium text-warm-foreground transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
            >
              {dict.hero.primary}
              <ArrowDownRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            <a
              href="#work"
              className="rounded-full border border-line px-6 py-3 text-sm text-foreground/80 backdrop-blur-sm transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {dict.hero.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
