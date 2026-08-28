import { z } from "zod"

/**
 * Autofill vult naam en e-mail in één klik, dus die zeggen niets over de
 * snelheid van een mens. Het bericht wel: een vrije textarea vult geen enkele
 * browser, dus de bezoeker typt of plakt die 10+ tekens altijd zelf. Ruim
 * onder wat dat kost, ruim boven wat een bot nodig heeft.
 */
export const MIN_FILL_MS = 1500

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(200),
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
    // Cyrillisch of CJK in een aanvraag aan een Nederlands bedrijf.
    /[Ѐ-ӿ一-鿿]/.test(text)
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
