import { Resolver } from "node:dns/promises"
import { z } from "zod"

/**
 * Autofill vult naam en e-mail in één klik, dus die zeggen niets over de
 * snelheid van een mens. Het bericht wel: een vrije textarea vult geen enkele
 * browser, dus de bezoeker typt of plakt die 10+ tekens altijd zelf. Ruim
 * onder wat dat kost, ruim boven wat een bot nodig heeft.
 */
export const MIN_FILL_MS = 1500

// ponytail: vaste lijst, alleen hele woorden — zo blijven catering@,
// stofzuigerwinkel.nl en iemand die Dick heet buiten schot. "t3pel" glipt
// erdoor; komt zoiets echt binnen, zet het er dan bij.
const RUDE_WORDS =
  /\b(kut|lul|tepel\w*|zuigers?|neuk\w*|hoer(en)?|kanker|tyfus\w*|tering|klere|klootzak|eikel|sukkel|mongool|flikker|slet|piemel|fuck\w*|shit|cunt|pussy|bitch|asshole|penis|porn|tits|boobs)\b/i

const isClean = (value: string) => !RUDE_WORDS.test(value)

export const contactSchema = z.object({
  // Weigeren, niet stil laten vallen: wie hier onterecht op strandt ziet de
  // melding bij het veld en kan het aanpassen.
  name: z.string().trim().min(2).max(80).refine(isClean),
  email: z.email().max(200).refine(isClean),
  message: z.string().trim().min(10).max(4000),
  // Honeypot: onzichtbaar veld dat bots invullen en mensen nooit zien.
  website: z.string().max(0),
  // Milliseconden tussen hydratatie en verzenden, clientseitig gemeten. Bij
  // een directe POST ontbreekt het veld, en dan valt het onder de drempel.
  elapsed: z.coerce.number().min(MIN_FILL_MS),
})

export type ContactInput = z.infer<typeof contactSchema>

/**
 * Velden die we aan de bezoeker terug mogen melden — de honeypot en de
 * tijdsval horen daar niet bij: wie daarop sneuvelt hoeft niet te horen
 * waarom. Staat hier en niet in app/actions.ts: een "use server"-bestand mag
 * alleen async functies exporteren, geen constanten.
 */
export const CONTACT_FIELDS = ["name", "email", "message"] as const
export type ContactField = (typeof CONTACT_FIELDS)[number]
export type ContactValues = Record<ContactField, string>

export type ContactState =
  | { status: "idle" }
  | { status: "sent" }
  | {
      status: "error"
      reason: "invalid" | "rate" | "server"
      // React 19 reset het formulier bij élke submit — startHostTransition roept
      // requestFormReset aan vóór de action draait. Zonder deze echo is alles wat
      // de bezoeker typte weg zodra het versturen mislukt.
      values: ContactValues
      // Alleen gevuld bij reason "invalid".
      fields?: ContactField[]
    }

const SPAM_WORDS =
  /\b(seo|backlinks?|guest post|crypto|bitcoin|forex|casino|viagra|payday loan|lead generation|web ?design services)\b/i

/**
 * Grove heuristiek: alleen om het onderwerp te markeren, nooit om te
 * blokkeren. Een echte aanvraag die hierin trapt komt gewoon aan, met een
 * tag ervoor — een die hier stilletjes op sneuvelt zou je nooit zien.
 */
export function looksLikeSpam(text: string): boolean {
  const links = text.match(/https?:\/\/|www\./gi)?.length ?? 0
  return (
    links >= 2 ||
    SPAM_WORDS.test(text) ||
    RUDE_WORDS.test(text) ||
    // Cyrillisch of CJK in een aanvraag aan een Nederlands bedrijf.
    /[Ѐ-ӿ一-鿿]/.test(text)
  )
}

// Standaard probeert c-ares tot ~20 s; zolang wil niemand naar "Versturen…"
// kijken.
const resolver = new Resolver({ timeout: 3000, tries: 2 })

/**
 * Kan het domein achter het adres mail ontvangen? Vangt tikfouten als
 * "gmail.con" en verzonnen adressen. Of de mailbox zelf bestaat (SMTP RCPT TO)
 * checken we bewust niet: poort 25 is thuis vaak dicht, catch-alls zeggen
 * altijd ja en je IP belandt er op blocklists mee.
 *
 * Alleen een definitief nee weigert: domein bestaat niet, heeft geen MX
 * (een A-record als terugval negeren we; echte zakelijke mail zonder MX bestaat
 * vrijwel niet) of zegt expliciet geen mail te willen (RFC 7505 null-MX). Een
 * DNS-hapering laat de aanvraag door — liever één tikfout in de inbox dan een
 * echte klant kwijt.
 */
export async function domainAcceptsMail(
  email: string,
  resolveMx: (domain: string) => Promise<{ exchange: string }[]> = (domain) =>
    resolver.resolveMx(domain),
): Promise<boolean> {
  const domain = email.slice(email.lastIndexOf("@") + 1)
  try {
    const records = await resolveMx(domain)
    return records.some((r) => r.exchange !== "" && r.exchange !== ".")
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    return code !== "ENOTFOUND" && code !== "ENODATA"
  }
}

/**
 * Het IP voor de rate limits. Cloudflare zet cf-connecting-ip zelf en
 * overschrijft wat de bezoeker meestuurt. x-forwarded-for vullen proxies van
 * achteren aan, dus alleen het láátste item komt van onze eigen proxy — het
 * eerste kan de afzender zelf verzinnen, en daarmee elke limiet omzeilen.
 */
export function ipFrom(headers: Pick<Headers, "get">): string {
  return (
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "onbekend"
  )
}

export const RATE_WINDOW_MS = 60 * 60 * 1000
export const RATE_MAX = 5

// ponytail: in-memory Map, 5 per uur per IP. Prima bij één Next-proces op één
// Pi; leegt bij herstart. Bij meerdere instances of strengere eisen → SQLite.
const defaultStore = new Map<string, number[]>()

/** true = mag versturen. Registreert de poging meteen. */
export function checkRate(
  ip: string,
  now: number = Date.now(),
  store: Map<string, number[]> = defaultStore,
): boolean {
  const recent = (store.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX) {
    store.set(ip, recent)
    return false
  }
  recent.push(now)
  store.set(ip, recent)
  return true
}
