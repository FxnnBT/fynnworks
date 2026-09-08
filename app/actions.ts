"use server"

import { randomUUID } from "node:crypto"
import { headers } from "next/headers"
import nodemailer from "nodemailer"
import { z } from "zod"
import {
  CONTACT_FIELDS,
  MIN_FILL_MS,
  type ContactState,
  type ContactValues,
  checkRate,
  contactSchema,
  looksLikeSpam,
} from "@/lib/contact"
import {
  MAX_IMAGES,
  TOKEN_PATTERN,
  type BriefState,
  briefText,
  briefToMarkdown,
  parseBriefForm,
} from "@/lib/brief"
import {
  findInvite,
  getBriefs,
  getInvites,
  getProjects,
  getReviews,
  saveBriefs,
  saveInvites,
  saveReviews,
} from "@/lib/data"
import { type ReviewState, parseReviewForm, saveUpload } from "@/lib/store"
import { SITE } from "@/lib/site"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Ontbrekende omgevingsvariabele: ${name}`)
  return value
}

/** Eén mailer voor het contactformulier en de briefing. */
async function mail(
  subject: string,
  text: string,
  replyTo?: string,
): Promise<void> {
  const transport = nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: { user: requireEnv("SMTP_USER"), pass: requireEnv("SMTP_PASS") },
  })
  await transport.sendMail({
    // Afzender moet je eigen mailbox zijn, anders weigert SPF/DMARC 'm.
    from: `"${SITE.name} website" <${requireEnv("SMTP_USER")}>`,
    to: requireEnv("CONTACT_TO"),
    replyTo,
    subject,
    text,
  })
}

/** Caddy/nginx zetten x-forwarded-for; direct verkeer heeft 'm niet. */
async function clientIp(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for") ?? ""
  return forwarded.split(",")[0]?.trim() || "onbekend"
}

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Uit de ruwe FormData, niet uit parsed.data: bij een parsefout bestaat die
  // niet, en juist dán moeten we de invoer kunnen teruggeven.
  const values = Object.fromEntries(
    CONTACT_FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as ContactValues

  const parsed = contactSchema.safeParse({
    ...values,
    website: formData.get("website"),
    elapsed: formData.get("elapsed"),
  })
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors
    // De honeypot en de tijdsval filteren we eruit: een bot hoeft niet te
    // horen welk veld hem verraadde. Blijft er niets over, dan was het een van
    // die twee — dan krijgt de afzender de algemene melding en verder niets.
    const fields = CONTACT_FIELDS.filter((field) => fieldErrors[field])
    return { status: "error", reason: "invalid", values, fields }
  }

  const ip = await clientIp()
  if (!checkRate(ip)) return { status: "error", reason: "rate", values }

  const { name, email, message } = parsed.data
  try {
    await mail(
      // Wel versturen, alleen taggen — één mailboxregel op "[spam?]" ruimt op,
      // en een verkeerd beoordeelde aanvraag blijft vindbaar.
      `${looksLikeSpam(`${name} ${message}`) ? "[spam?] " : ""}Nieuwe aanvraag van ${name}`,
      `Van: ${name} <${email}>\nIP: ${ip}\n\n${message}\n`,
      `"${name}" <${email}>`,
    )
    return { status: "sent" }
  } catch (error) {
    // Details blijven op de server; de bezoeker krijgt een nette melding.
    console.error("[contact] versturen mislukt:", error)
    return { status: "error", reason: "server", values }
  }
}

// Eigen venster voor reviews: wie net een aanvraag stuurde mag daarna nog een
// review achterlaten. Zelfde ponytail-ceiling als in lib/contact.ts.
const reviewRate = new Map<string, number[]>()

export async function submitReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const parsed = parseReviewForm(formData, MIN_FILL_MS)
  const { values } = parsed
  if (!("data" in parsed)) {
    return { status: "error", reason: "invalid", values, fields: parsed.fields }
  }

  if (!checkRate(await clientIp(), Date.now(), reviewRate)) {
    return { status: "error", reason: "rate", values }
  }

  const { name, company, rating, text, lang, projectSlug } = parsed.data
  try {
    // Een slug uit het formulier is invoer als elke andere: alleen bewaren als
    // hij naar een project wijst dat echt bestaat.
    const known = (await getProjects()).some((p) => p.slug === projectSlug)
    const reviews = await getReviews()
    await saveReviews([
      ...reviews,
      {
        id: randomUUID(),
        name,
        company,
        rating,
        text,
        lang,
        projectSlug: known ? projectSlug : "",
        // Niets komt zonder goedkeuring op de site.
        status: "pending",
        // Alleen markeren, nooit weigeren — zoals de contactmail [spam?] krijgt.
        suspect: looksLikeSpam(`${name} ${company} ${text}`),
        createdAt: new Date().toISOString(),
      },
    ])
    return { status: "sent" }
  } catch (error) {
    console.error("[review] opslaan mislukt:", error)
    return { status: "error", reason: "server", values }
  }
}

// ----------------------------------------------------------------- briefing

// Eigen venster, los van contact en reviews: een briefing invullen is geen
// reden om daarna geen vraag meer te mogen stellen.
const briefRate = new Map<string, number[]>()

/**
 * De uitgebreide aanvraag. Anders dan het contactformulier gaat deze eerst
 * naar schijf en pas daarna op de mail: de mail is een seintje, de opslag is
 * de bron. Mislukt het versturen, dan staat de aanvraag nog gewoon in /admin
 * en is er niets weg.
 */
export async function submitBrief(
  _prev: BriefState,
  formData: FormData,
): Promise<BriefState> {
  const { values, data, fields } = parseBriefForm(formData, MIN_FILL_MS)
  if (!data) return { status: "error", reason: "invalid", values, fields }

  // Een server action is een publiek POST-endpoint: dat de pagina alleen via
  // jouw link te vinden is, is geen controle. Vandaar hier opnieuw.
  const token = String(formData.get("token") ?? "")
  const invite = TOKEN_PATTERN.test(token) ? await findInvite(token) : undefined
  if (!invite) return { status: "error", reason: "link", values }

  if (!checkRate(await clientIp(), Date.now(), briefRate)) {
    return { status: "error", reason: "rate", values }
  }

  // Lege file-inputs sturen een File van 0 bytes mee; die slaan we over.
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, MAX_IMAGES)

  const images: string[] = []
  try {
    for (const file of files) images.push(await saveUpload(file, "brief"))
  } catch (error) {
    // saveUpload weigert een verkeerd formaat of een te groot bestand. Dat is
    // iets wat de bezoeker zelf kan oplossen, dus die melding mag hij zien.
    console.error("[brief] upload mislukt:", error)
    return {
      status: "error",
      reason: "upload",
      values,
      detail: error instanceof Error ? error.message : undefined,
    }
  }

  const brief = {
    ...data,
    id: randomUUID(),
    token: invite.token,
    invite: invite.label,
    // De taal van de link wint van het verborgen veld: die heb jij gekozen.
    lang: invite.lang,
    images,
    // Alleen markeren, nooit weigeren — zoals de contactmail [spam?] krijgt.
    suspect: looksLikeSpam(briefText(data)),
    createdAt: new Date().toISOString(),
  }

  try {
    await saveBriefs([...(await getBriefs()), brief])
    // Pas ná het opslaan: anders staat een link als gebruikt gemarkeerd
    // terwijl de briefing nergens terechtkwam.
    await saveInvites(
      (await getInvites()).map((entry) =>
        entry.token === invite.token
          ? { ...entry, usedAt: brief.createdAt }
          : entry,
      ),
    )
  } catch (error) {
    console.error("[brief] opslaan mislukt:", error)
    return { status: "error", reason: "server", values }
  }

  try {
    await mail(
      `${brief.suspect ? "[spam?] " : ""}Briefing van ${brief.invite || brief.company || brief.name}`,
      briefToMarkdown(brief, SITE.url),
      `"${brief.name}" <${brief.email}>`,
    )
  } catch (error) {
    // De aanvraag staat al op schijf; hier alleen loggen, niet falen.
    console.error("[brief] mail mislukt:", error)
  }

  return { status: "sent" }
}
