import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import type { Dict, Lang } from "@/content/dictionaries"
import { getProjects } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"

export async function Work({ dict, lang }: { dict: Dict; lang: Lang }) {
  const projects = await getProjects()

  // Een smalle kaart die alleen op zijn rij overblijft laat een gat vallen.
  // De laatste in dat geval ook breed maken houdt de grid dicht, ongeacht
  // hoeveel projecten er staan.
  const singles = projects.filter((p) => !p.featured)
  const orphanSlug =
    singles.length % 2 === 1 ? singles[singles.length - 1].slug : null

  return (
    <section id="work" className="section-y scroll-mt-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.work.eyebrow}
          title={dict.work.title}
          lead={dict.work.lead}
        />

        {/* Bento: uitgelichte projecten nemen twee kolommen, de rest één. */}
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const Card = project.href ? "a" : "div"
            const wide = project.featured || project.slug === orphanSlug
            return (
              <Card
                key={project.slug}
                {...(project.href
                  ? {
                      href: project.href,
                      target: "_blank",
                      rel: "noreferrer noopener",
                    }
                  : {})}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card/40 transition-colors duration-300 hover:border-foreground/20 ${
                  wide ? "sm:col-span-2" : ""
                }`}
              >
                <div
                  className={`relative overflow-hidden ${
                    // Breed is breder, niet hoger: 16:10 over de volle breedte
                    // werd een muur van bijna 900px.
                    wide ? "aspect-4/3 sm:aspect-21/9" : "aspect-4/3"
                  }`}
                >
                  <Image
                    src={project.image}
                    alt={`${project.client} — ${project.title[lang]}`}
                    width={wide ? 1600 : 1200}
                    height={wide ? 1000 : 750}
                    // Zonder muis is er geen scroll-onthulling: grijs zou daar
                    // permanent grijs blijven, dus op touch meteen in kleur —
                    // en dan ook zonder de brightness-correctie hieronder.
                    //
                    // De screenshots zijn zelf donker (gemiddelde luminantie 33
                    // en 43 van 255): het zijn nou eenmaal donkere sites. Grijs
                    // op een bijna-zwarte pagina liet ze daardoor in het niets
                    // vallen. brightness tilt ze uit de achtergrond zonder de
                    // donkere opzet van die sites te verloochenen; kleur blijft
                    // het hover-moment.
                    className="h-full w-full object-cover grayscale brightness-150 transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100 [@media(hover:none)]:grayscale-0 [@media(hover:none)]:brightness-100"
                  />
                  {/* Alleen de onderrand hoeft in de kaart te zakken. Liep de
                      donkere wash eerder tot halverwege, dan lag het werk zelf
                      in het donker — en dat is nou net het bewijsmateriaal. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                  {project.status ? (
                    <span className="absolute right-4 top-4 rounded-full border border-warm/40 bg-background/70 px-3 py-1 text-xs text-warm backdrop-blur-sm">
                      {project.status[lang]}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {project.client}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {project.year}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl leading-tight sm:text-3xl">
                    {project.title[lang]}
                  </h3>
                  <p className="max-w-prose text-sm text-muted-foreground">
                    {project.summary[lang]}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line px-3 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.href ? (
                      <span className="ml-auto inline-flex items-center gap-1 text-sm text-warm">
                        {dict.work.visit}
                        <ArrowUpRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    ) : null}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
