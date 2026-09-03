import Image from "next/image"
import { ChevronRight, Star } from "lucide-react"
import { isAdmin } from "@/lib/auth"
import { type Brief, type Invite, briefToMarkdown } from "@/lib/brief"
import { getBriefs, getInvites, getProjects, getReviews } from "@/lib/data"
import { SITE } from "@/lib/site"
import { MAX_UPLOAD_BYTES, type Review } from "@/lib/store"
import { CopyButton } from "./copy-button"
import { InviteForm } from "./invite-form"
import { LoginForm } from "./login-form"
import { ProjectForm } from "./project-form"
import {
  approveReview,
  deleteBrief,
  deleteInvite,
  deleteProject,
  deleteReview,
  logout,
} from "./actions"

/**
 * Twee knopstijlen, meer niet. Weggooien krijgt een eigen stijl: hij hoort
 * niet even hard te roepen als "goedkeuren", en moet rood worden zodra je
 * hem aanwijst — anders klik je hem per ongeluk.
 *
 * min-h-11 (44px) op mobiel, kleiner vanaf sm: een duim mikt slechter dan een
 * muis. Op een telefoon staat er dus lucht omheen, op een laptop niet.
 */
const tapClass = "inline-flex min-h-11 items-center justify-center sm:min-h-9"
const buttonClass = `${tapClass} cursor-pointer rounded-full border border-line px-4 text-xs transition-colors duration-200 hover:border-warm hover:text-warm`
const dangerClass = `${tapClass} cursor-pointer rounded-full border border-transparent px-4 text-xs text-muted-foreground transition-colors duration-200 hover:border-destructive/40 hover:text-destructive`

const cardClass = "rounded-2xl border border-line bg-card/40 p-5"

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "warm" | "muted" | "danger"
  children: React.ReactNode
}) {
  const tones = {
    warm: "border-warm/40 bg-warm/10 text-warm",
    muted: "border-line text-muted-foreground",
    danger: "border-destructive/40 text-destructive",
  }
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.6875rem] uppercase tracking-widest ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/** Datums en aantallen: tabular-nums houdt de kolommen recht. */
function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">
      {children}
    </span>
  )
}

const date = (iso: string) => new Date(iso).toLocaleDateString("nl-NL")

function Section({
  id,
  title,
  count,
  lead,
  children,
}: {
  id: string
  title: string
  count: number
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-5">
      <div className="flex items-baseline gap-3 border-b border-line pb-3">
        <h2 className="font-display text-2xl">{title}</h2>
        <Meta>{count}</Meta>
      </div>
      {lead ? (
        <p className="max-w-prose text-sm text-muted-foreground">{lead}</p>
      ) : null}
      {children}
    </section>
  )
}

/**
 * Formulieren zitten dichtgeklapt: ze zijn twee schermen hoog en je gebruikt
 * ze een paar keer per jaar. De lijst waar je wél elke keer voor komt staat
 * daardoor bovenaan. <details> doet dit zonder een regel JavaScript.
 */
function Disclosure({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <details className="group rounded-2xl border border-line bg-card/40">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm transition-colors hover:text-warm [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-4 transition-transform duration-200 group-open:rotate-90"
        />
        {label}
      </summary>
      <div className="border-t border-line p-5">{children}</div>
    </details>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  )
}

function ReviewCard({ review, client }: { review: Review; client?: string }) {
  const waiting = review.status === "pending"
  return (
    <li
      className={`flex flex-col gap-3 rounded-2xl border bg-card/40 p-5 ${
        waiting ? "border-warm/30" : "border-line"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex items-center gap-0.5" aria-label={`${review.rating} sterren`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              aria-hidden
              className={`size-3.5 ${n <= review.rating ? "fill-warm text-warm" : "text-muted-foreground/40"}`}
            />
          ))}
        </span>
        <span className="text-sm">
          {review.name}
          {review.company ? (
            <span className="text-muted-foreground"> — {review.company}</span>
          ) : null}
        </span>
        {/* Het project alleen tonen als het iets toevoegt: bij een eenmanszaak
            is de klantnaam dezelfde als de inzender. Zelfde regel als op de
            site zelf, in components/reviews.tsx. */}
        <Meta>
          {client && client !== review.name ? `${client} · ` : ""}
          {review.lang} · {date(review.createdAt)}
        </Meta>
        <span className="ml-auto flex items-center gap-2">
          {review.suspect ? <Pill tone="danger">spam?</Pill> : null}
          {waiting ? <Pill tone="warm">wacht</Pill> : <Pill>op de site</Pill>}
        </span>
      </div>

      {/* whitespace-pre-line, net als op de site: je moet hier beoordelen wat
          de bezoeker straks ziet, inclusief de alinea-indeling. */}
      <p
        lang={review.lang}
        className="max-w-prose whitespace-pre-line text-sm text-muted-foreground"
      >
        {review.text}
      </p>

      <div className="flex items-center gap-2">
        {waiting ? (
          <form action={approveReview}>
            <input type="hidden" name="id" value={review.id} />
            <button type="submit" className={buttonClass}>
              Goedkeuren
            </button>
          </form>
        ) : null}
        <form action={deleteReview} className="ml-auto">
          <input type="hidden" name="id" value={review.id} />
          <button type="submit" className={dangerClass}>
            Verwijderen
          </button>
        </form>
      </div>
    </li>
  )
}

function InviteRow({ invite }: { invite: Invite }) {
  const url = `${SITE.url}/${invite.lang}/briefing/${invite.token}`
  return (
    <li className={`flex flex-col gap-3 ${cardClass}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-sm">{invite.label}</span>
        <Meta>{invite.lang}</Meta>
        <span className="ml-auto">
          {invite.usedAt ? (
            <Pill>ingevuld {date(invite.usedAt)}</Pill>
          ) : (
            <Pill tone="warm">open</Pill>
          )}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* break-all: een token van 24 tekens breekt anders het hele kaartje
            op een telefoon. w-full op mobiel: als de link naast de knoppen moet
            staan houdt hij daar veertig pixels over en breekt hij op vier
            tekens per regel — een kolom in plaats van een adres. Nu krijgt hij
            een eigen regel en zakken de knoppen eronder. */}
        <code className="w-full min-w-0 break-all rounded-lg border border-line bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground sm:w-auto sm:flex-1">
          {url}
        </code>
        <CopyButton text={url} label="Kopieer link" className={buttonClass} />
        <form action={deleteInvite}>
          <input type="hidden" name="token" value={invite.token} />
          <button type="submit" className={dangerClass}>
            Intrekken
          </button>
        </form>
      </div>
    </li>
  )
}

/**
 * Eén aanvraag, met de briefing als markdown eronder. Die tekst is precies wat
 * er ook gemaild is: selecteerbaar, en met één klik naar het klembord om in
 * een chat te plakken.
 */
function BriefCard({ brief }: { brief: Brief }) {
  const markdown = briefToMarkdown(brief, SITE.url)
  return (
    <li className={`flex flex-col gap-4 ${cardClass}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-sm">{brief.company || brief.name}</span>
        {brief.invite && brief.invite !== brief.company ? (
          <Meta>via {brief.invite}</Meta>
        ) : null}
        <Meta>
          {brief.lang} · {date(brief.createdAt)}
        </Meta>
        {brief.suspect ? (
          <span className="ml-auto">
            <Pill tone="danger">spam?</Pill>
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <a
          href={`mailto:${brief.email}`}
          className="underline underline-offset-3 transition-colors hover:text-warm"
        >
          {brief.email}
        </a>
        {brief.phone ? <span>{brief.phone}</span> : null}
      </div>

      {brief.images.length ? (
        <ul className="flex flex-wrap gap-3">
          {brief.images.map((src) => (
            <li key={src}>
              <a href={src} target="_blank" rel="noreferrer">
                <Image
                  src={src}
                  alt=""
                  width={96}
                  height={96}
                  className="size-24 rounded-lg border border-line object-cover transition-opacity hover:opacity-80"
                />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:min-h-0 [&::-webkit-details-marker]:hidden">
          <ChevronRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-open:rotate-90"
          />
          Briefing lezen
        </summary>
        <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-background/60 p-4 font-mono text-xs text-muted-foreground">
          {markdown}
        </pre>
      </details>

      <div className="flex items-center gap-2">
        <CopyButton
          text={markdown}
          label="Kopieer als prompt"
          className={buttonClass}
        />
        <form action={deleteBrief} className="ml-auto">
          <input type="hidden" name="id" value={brief.id} />
          <button type="submit" className={dangerClass}>
            Verwijderen
          </button>
        </form>
      </div>
    </li>
  )
}

export default async function AdminPage() {
  // Vóór elke lees van de gegevens: anders staan de wachtende reviews in de
  // RSC-payload van het inlogscherm.
  if (!(await isAdmin())) return <LoginForm />

  const [projects, reviews, briefs, invites] = await Promise.all([
    getProjects(),
    getReviews(),
    getBriefs(),
    getInvites(),
  ])
  const clientOf = new Map(projects.map((p) => [p.slug, p.client]))
  const pending = reviews.filter((r) => r.status === "pending").reverse()
  const approved = reviews.filter((r) => r.status === "approved").reverse()
  const openInvites = invites.filter((invite) => !invite.usedAt).length

  // De teller in de balk is dezelfde als die boven de sectie: één bron, dus
  // ze kunnen niet uiteenlopen.
  const sections = [
    { id: "briefings", label: "Briefings", count: briefs.length },
    { id: "links", label: "Links", count: invites.length },
    { id: "reviews", label: "Reviews", count: reviews.length, alert: pending.length },
    { id: "werk", label: "Werk", count: projects.length },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
      <header className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-4xl">Beheer</h1>
          <form action={logout}>
            <button type="submit" className={dangerClass}>
              Uitloggen
            </button>
          </form>
        </div>

        {/* De vier getallen die zeggen of er iets van je gevraagd wordt.
            Wachtende reviews en open links kleuren mee: alleen díe twee
            vragen om een handeling. */}
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {[
            { label: "Briefings", value: briefs.length, warm: false },
            { label: "Open links", value: openInvites, warm: openInvites > 0 },
            { label: "Wacht", value: pending.length, warm: pending.length > 0 },
            { label: "Projecten", value: projects.length, warm: false },
          ].map((stat) => (
            <div key={stat.label} className="bg-background px-5 py-4">
              <dt className="eyebrow">{stat.label}</dt>
              <dd
                className={`font-display text-3xl tabular-nums ${stat.warm ? "text-warm" : ""}`}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

      </header>

      {/* Ankerlinks, geen router: alles staat op één pagina en dit is de hele
          navigatie. Staat bewust buiten <header>: een sticky element blijft
          alleen plakken zolang zijn eigen ouder in beeld is, en die header is
          na een half scherm voorbij. Als kind van de paginacontainer plakt hij
          de hele pagina lang. */}
      <nav
        aria-label="Secties"
        // Op een telefoon passen de vier chips net niet naast elkaar. Ze laten
        // omvallen maakt de plakbalk 121px hoog — een zevende van het scherm,
        // permanent kwijt. Daarom één rij die zijwaarts schuift; de pagina
        // zelf blijft daarmee vrij van horizontaal scrollen. Vanaf sm past
        // alles gewoon en valt het schuiven vanzelf weg.
        className="sticky top-0 z-10 -mx-5 mt-8 flex snap-x gap-2 overflow-x-auto border-b border-line bg-background/90 px-5 py-3 backdrop-blur [scrollbar-width:none] sm:-mx-8 sm:flex-wrap sm:overflow-visible sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border border-line px-3 text-xs transition-colors duration-200 hover:border-warm hover:text-warm sm:min-h-9 sm:px-4"
          >
            {section.label}
            {/* Altijd het totaal, nooit het aantal wachtenden: die staat al in
                de balk erboven, en twee verschillende getallen onder dezelfde
                naam laten je twijfelen aan allebei. Warm = er ligt iets. */}
            <span
              className={`font-mono tabular-nums ${section.alert ? "text-warm" : "text-muted-foreground"}`}
            >
              {section.count}
            </span>
          </a>
        ))}
      </nav>

      <main className="flex flex-col gap-14 pt-12">
        <Section id="briefings" title="Briefings" count={briefs.length}>
          {briefs.length ? (
            <ul className="flex flex-col gap-3">
              {[...briefs].reverse().map((brief) => (
                <BriefCard key={brief.id} brief={brief} />
              ))}
            </ul>
          ) : (
            <Empty>
              Nog niets ingevuld. Maak hieronder een link en stuur die naar je
              klant.
            </Empty>
          )}
        </Section>

        <Section
          id="links"
          title="Briefinglinks"
          count={invites.length}
          lead="De briefing staat nergens op de site. Alleen wie deze link van jou krijgt, kan hem invullen. Trek je de link in, dan geeft het adres een 404."
        >
          <Disclosure label="Nieuwe link aanmaken">
            <InviteForm />
          </Disclosure>
          {invites.length ? (
            <ul className="flex flex-col gap-3">
              {[...invites].reverse().map((invite) => (
                <InviteRow key={invite.token} invite={invite} />
              ))}
            </ul>
          ) : null}
        </Section>

        <Section id="reviews" title="Reviews" count={reviews.length}>
          {reviews.length ? (
            <>
              {pending.length ? (
                <div className="flex flex-col gap-3">
                  <h3 className="eyebrow text-warm">
                    Wacht op goedkeuring ({pending.length})
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {pending.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        client={clientOf.get(review.projectSlug)}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}

              {approved.length ? (
                <div className="flex flex-col gap-3">
                  <h3 className="eyebrow">Op de site ({approved.length})</h3>
                  <ul className="flex flex-col gap-3">
                    {approved.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        client={clientOf.get(review.projectSlug)}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <Empty>Nog geen reviews binnengekomen.</Empty>
          )}
        </Section>

        <Section id="werk" title="Werk" count={projects.length}>
          <Disclosure label="Project toevoegen">
            <ProjectForm maxMb={MAX_UPLOAD_BYTES / (1024 * 1024)} />
          </Disclosure>
          <ul className="flex flex-col gap-3">
            {projects.map((project) => (
              // flex-wrap plus basis-40 op de tekst: op een telefoon zakken de
              // knoppen naar een tweede regel in plaats van de klantnaam tot
              // nul pixels te knijpen. Vanaf sm past alles weer op één regel.
              <li
                key={project.slug}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line bg-card/40 p-4"
              >
                <Image
                  src={project.image}
                  alt=""
                  width={96}
                  height={64}
                  className="h-16 w-24 shrink-0 rounded-lg object-cover"
                />
                <div className="flex min-w-0 flex-1 basis-40 flex-col">
                  <span className="truncate text-sm">{project.client}</span>
                  <span className="truncate font-mono text-xs tabular-nums text-muted-foreground">
                    {project.slug} · {project.year}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {project.featured ? <Pill>uitgelicht</Pill> : null}
                  <form action={deleteProject}>
                    <input type="hidden" name="slug" value={project.slug} />
                    <button type="submit" className={dangerClass}>
                      Verwijderen
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </main>
    </div>
  )
}
