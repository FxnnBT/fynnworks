import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import { z } from "zod"

/**
 * Waar de schrijfbare gegevens staan. Op de Pi draait de service met
 * `ProtectSystem=strict`: alleen `.next` is daar schrijfbaar, en dat wordt bij
 * elke build overschreven. `StateDirectory=fynnworks` in de unit laat systemd
 * `/var/lib/fynnworks` aanmaken — buiten het pad van de tar-transfer, dus een
 * deploy raakt het niet — en zet meteen $STATE_DIRECTORY. Lokaal is het ./data.
 *
 * Als functie en niet als constante: bij `next build` staat de variabele er
 * nog niet, en een module-constante zou die afwezigheid vastleggen.
 */
export function dataDir(): string {
  return process.env.STATE_DIRECTORY ?? path.join(process.cwd(), "data")
}

/*
 * turbopackIgnore staat bij elk pad hieronder: de datamap komt uit een
 * omgevingsvariabele, en zonder die markering besluit Turbopack dat het het
 * hele project maar moet meetracen "voor de zekerheid".
 */
export async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(/*turbopackIgnore: true*/ dataDir(), name), "utf8")
    return JSON.parse(raw) as T
  } catch (error) {
    // Alleen "bestaat nog niet" is normaal. Een kapotte JSON of een
    // rechtenprobleem moet je zien, niet stilletjes als lege lijst terugkrijgen.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback
    throw error
  }
}

/** Schrijft naar een tijdelijk bestand en hernoemt: nooit een halve lijst. */
export async function writeJson(name: string, value: unknown): Promise<void> {
  const dir = dataDir()
  await fs.mkdir(dir, { recursive: true })
  const file = path.join(/*turbopackIgnore: true*/ dir, name)
  const tmp = `${file}.${process.pid}.tmp`
  await fs.writeFile(tmp, JSON.stringify(value, null, 2))
  await fs.rename(tmp, file)
}

// ---------------------------------------------------------------- projecten

const localized = (max: number) =>
  z.object({
    nl: z.string().trim().min(1).max(max),
    en: z.string().trim().min(1).max(max),
  })

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/),
  client: z.string().trim().min(1).max(80),
  year: z.string().trim().regex(/^\d{4}$/),
  title: localized(120),
  summary: localized(600),
  tags: z.array(z.string().trim().min(1).max(40)).max(8),
  // Alleen http(s): een kale z.url() slikt ook javascript:, en deze waarde
  // belandt rechtstreeks in de href van de projectkaart.
  href: z.url({ protocol: /^https?$/ }).max(200).optional(),
  image: z.string().trim().min(1).max(200),
  /** Grote kaart in de bento-grid: vult twee kolommen. */
  featured: z.boolean().optional(),
  /** Label op de kaart, bv. voor werk dat nog loopt. */
  status: localized(40).optional(),
})

export type Project = z.infer<typeof projectSchema>

// ------------------------------------------------------------------ reviews

/**
 * De honeypot en de tijdsval zitten hier bewust niet in: die horen bij de
 * antispam in lib/contact.ts en worden er in app/actions.ts aan vastgeplakt.
 * Zo blijft dit bestand vrij van relatieve imports — `node --test` draait de
 * .ts-bestanden rechtstreeks en eist dan volledige specifiers.
 */
export const reviewSchema = z.object({
  name: z.string().trim().min(2).max(80),
  company: z.string().trim().max(80),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(2000),
  /** Leeg = algemene review, niet aan één project gekoppeld. */
  projectSlug: z.string().trim().max(60),
  lang: z.enum(["nl", "en"]),
})

export type ReviewInput = z.infer<typeof reviewSchema>

/**
 * Velden die we aan de bezoeker terug mogen melden, en de staat die het
 * formulier terugkrijgt. Zelfde vorm als ContactState in lib/contact.ts:
 * React 19 leegt het formulier bij elke submit, dus de ingevulde waarden
 * moeten mee terug of de bezoeker mag alles opnieuw typen.
 */
export const REVIEW_FIELDS = ["name", "company", "rating", "text"] as const
export type ReviewField = (typeof REVIEW_FIELDS)[number]
export type ReviewValues = Record<ReviewField, string>

export type ReviewState =
  | { status: "idle" }
  | { status: "sent" }
  | {
      status: "error"
      reason: "invalid" | "rate" | "server"
      values: ReviewValues
      fields?: ReviewField[]
    }

export type Review = ReviewInput & {
  id: string
  status: "pending" | "approved"
  /** looksLikeSpam() zei ja. Alleen een markering, nooit een blokkade. */
  suspect: boolean
  createdAt: string
}

/**
 * Haalt een review uit de ruwe FormData. De honeypot en de tijdsval komen als
 * parameter binnen in plaats van uit lib/contact.ts: dit bestand blijft zo
 * vrij van relatieve imports, en `node --test` kan het rechtstreeks draaien.
 *
 * values komt altijd terug, ook bij een fout — React 19 leegt het formulier
 * bij elke submit, dus zonder die echo mag de bezoeker alles opnieuw typen.
 */
export function parseReviewForm(
  formData: FormData,
  minFillMs: number,
):
  | { values: ReviewValues; data: ReviewInput }
  | { values: ReviewValues; fields: ReviewField[] } {
  const values = Object.fromEntries(
    REVIEW_FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as ReviewValues

  const parsed = reviewSchema
    .extend({
      website: z.string().max(0),
      elapsed: z.coerce.number().min(minFillMs),
    })
    .safeParse({
      ...values,
      projectSlug: formData.get("projectSlug") ?? "",
      lang: formData.get("lang"),
      website: formData.get("website"),
      elapsed: formData.get("elapsed"),
    })
  if (parsed.success) return { values, data: parsed.data }

  // De honeypot en de tijdsval blijven eruit: een bot hoeft niet te horen welk
  // veld hem verraadde. Blijft er niets over, dan was het een van die twee.
  const fieldErrors = z.flattenError(parsed.error).fieldErrors
  return {
    values,
    fields: REVIEW_FIELDS.filter((field) => fieldErrors[field]),
  }
}

// ------------------------------------------------------------------ uploads

const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
}

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

/**
 * Precies wat saveUpload() genereert. Een naam die hier niet doorheen komt
 * wordt nooit aan het bestandssysteem doorgegeven, dus padtraversal (`..`,
 * absolute paden, backslashes) kan niet.
 */
export const UPLOAD_NAME = /^[a-f0-9]{16}\.(jpg|png|webp|avif)$/

/**
 * Twee vertrouwensklassen, twee mappen. Projectafbeeldingen staan publiek op de
 * site; wat een klant in de briefing uploadt is privé. Dat onderscheid zit in
 * het pad en niet in een aparte lijst, zodat "mag dit bestand naar buiten?" niet
 * van losse boekhouding afhangt die uit de pas kan lopen.
 */
export type UploadKind = "public" | "brief"

const UPLOAD_DIR: Record<UploadKind, string> = {
  public: "uploads",
  brief: "brief-uploads",
}

/** De privémap wordt geserveerd door een route die eerst op de login controleert. */
const UPLOAD_URL: Record<UploadKind, string> = {
  public: "/uploads",
  brief: "/admin/uploads",
}

export function uploadPath(name: string, kind: UploadKind = "public"): string {
  return path.join(/*turbopackIgnore: true*/ dataDir(), UPLOAD_DIR[kind], name)
}

/** Slaat een afbeelding op onder zijn eigen hash en geeft het pad waarop hij te halen is. */
export async function saveUpload(
  file: File,
  kind: UploadKind = "public",
): Promise<string> {
  const ext = IMAGE_EXT[file.type]
  if (!ext) throw new Error("Alleen JPG, PNG, WebP of AVIF.")
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Afbeelding is groter dan 3 MB.")

  const bytes = Buffer.from(await file.arrayBuffer())
  // Inhoudshash als naam: twee keer dezelfde afbeelding uploaden levert één
  // bestand op, en de naam verandert nooit zolang de inhoud dat niet doet.
  const name = `${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}.${ext}`
  await fs.mkdir(path.join(/*turbopackIgnore: true*/ dataDir(), UPLOAD_DIR[kind]), {
    recursive: true,
  })
  await fs.writeFile(uploadPath(name, kind), bytes)
  return `${UPLOAD_URL[kind]}/${name}`
}
