import { Plus, Star } from "lucide-react"
import type { Dict, Lang } from "@/content/dictionaries"
import { getProjects, getReviews } from "@/lib/data"
import { ReviewForm } from "@/components/review-form"
import { SectionHeading } from "@/components/section-heading"

export async function Reviews({ dict, lang }: { dict: Dict; lang: Lang }) {
  const [projects, all] = await Promise.all([getProjects(), getReviews()])
  // Alleen wat is goedgekeurd, nieuwste bovenaan.
  const reviews = all
    .filter((review) => review.status === "approved")
    .reverse()
  const clientOf = new Map(projects.map((p) => [p.slug, p.client]))

  return (
    <section id="reviews" className="section-y scroll-mt-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.reviews.eyebrow}
          title={dict.reviews.title}
          lead={dict.reviews.lead}
        />

        {reviews.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-card/40 p-6 transition-colors duration-300 hover:border-foreground/20"
              >
                <div
                  className="flex items-center gap-0.5"
                  aria-label={`${review.rating} ${dict.reviews.stars}`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      aria-hidden
                      className={`size-4 ${
                        n <= review.rating
                          ? "fill-warm text-warm"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>

                {/* Reviews staan in de taal waarin ze zijn ingestuurd; lang
                    zegt de schermlezer welke stem hij opzet.

                    whitespace-pre-line: een textarea levert echte regeleindes,
                    en HTML plakt die standaard aan elkaar. Zonder dit wordt een
                    review van vijf alinea's één blok tekst. pre-line houdt de
                    witregels en laat de regels verder gewoon aflopen — pre zou
                    ze op de ingetypte breedte vastzetten. */}
                <p
                  lang={review.lang}
                  className="max-w-prose flex-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
                >
                  {review.text}
                </p>

                <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
                  <span className="text-sm">
                    {review.name}
                    {review.company ? (
                      <span className="text-muted-foreground">
                        {" — "}
                        {review.company}
                      </span>
                    ) : null}
                  </span>
                  {/* Het project waar de review bij hoort. Weggelaten als dat
                      dezelfde naam is als de inzender — bij een eenmanszaak
                      staat er anders twee keer hetzelfde in één regel. */}
                  {clientOf.get(review.projectSlug) !== review.name ? (
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {clientOf.get(review.projectSlug) ?? dict.reviews.general}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{dict.reviews.empty}</p>
        )}

        {/* Verplicht sinds 2022 (art. 6:193b/e BW): wie reviews toont moet
            vermelden of en hoe hij nagaat dat ze van echte klanten komen. */}
        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          {dict.reviews.verified}
        </p>

        {/* Zelfde <details>-truc als bij de FAQ: dichtgeklapt tot iemand er om
            vraagt, zonder JavaScript en zonder het formulier te verstoppen
            voor een schermlezer. */}
        <details className="group mt-10 border-t border-line">
          <summary className="flex cursor-pointer list-none items-center gap-3 py-7 outline-none transition-colors hover:text-warm focus-visible:text-warm [&::-webkit-details-marker]:hidden">
            <Plus
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45 group-open:text-warm"
            />
            <span className="font-display text-xl sm:text-2xl">
              {dict.reviews.open}
            </span>
          </summary>
          <div className="max-w-2xl pb-4">
            <ReviewForm
              dict={dict.reviews}
              lang={lang}
              privacyLabel={dict.legal.privacy}
              projects={projects.map((p) => ({
                slug: p.slug,
                client: p.client,
              }))}
            />
          </div>
        </details>
      </div>
    </section>
  )
}
