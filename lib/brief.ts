import { z } from "zod"

/**
 * De briefing: één formulier waarin een klant zelf uitschrijft wat hij wil.
 * Wie het niet weet, kiest uit de opties — elke keuzevraag heeft daarom een
 * "weet ik nog niet". Dat is een antwoord, geen ontbrekend veld.
 *
 * De vragen staan hier als data en niet in content/dictionaries.ts: die file
 * is een NL/EN-paar dat volledig moet blijven kloppen, en honderd regels
 * opties in tweevoud maken dat onleesbaar. Hier staan beide talen naast
 * elkaar, en dat is precies waar je ze vergelijkt.
 *
 * Geen relatieve imports en geen node:fs in dit bestand — `node --test`
 * draait het rechtstreeks, en het formulier importeert het in de browser.
 */

type L = { nl: string; en: string }

export type Question = {
  id: string
  label: L
  hint?: L
  /** one = radio, many = checkboxes, text = vrij veld. */
  type: "one" | "many" | "text"
  options?: { value: string; label: L }[]
  required?: boolean
  placeholder?: L
}

const UNSURE = {
  value: "onbekend",
  label: { nl: "Weet ik nog niet", en: "Not sure yet" },
}

export const BRIEF_QUESTIONS: Question[] = [
  {
    id: "kind",
    label: { nl: "Wat voor site zoek je?", en: "What kind of site?" },
    type: "one",
    required: true,
    options: [
      {
        value: "landing",
        label: { nl: "Eén pagina (landingspagina)", en: "One page (landing page)" },
      },
      {
        value: "multi",
        label: { nl: "Meerdere pagina’s", en: "Multiple pages" },
      },
      { value: "shop", label: { nl: "Webshop", en: "Web shop" } },
      {
        value: "custom",
        label: {
          nl: "Maatwerk (inlog, boekingen, koppelingen)",
          en: "Custom build (logins, bookings, integrations)",
        },
      },
      UNSURE,
    ],
  },
  {
    id: "goals",
    label: { nl: "Wat moet de site opleveren?", en: "What should the site do?" },
    hint: { nl: "Meerdere antwoorden mogen.", en: "Pick as many as apply." },
    type: "many",
    required: true,
    options: [
      { value: "leads", label: { nl: "Meer aanvragen", en: "More enquiries" } },
      { value: "sales", label: { nl: "Online verkopen", en: "Sell online" } },
      {
        value: "inform",
        label: { nl: "Uitleggen wat ik doe", en: "Explain what I do" },
      },
      {
        value: "seo",
        label: { nl: "Beter vindbaar in Google", en: "Rank better on Google" },
      },
      {
        value: "trust",
        label: { nl: "Professioneler overkomen", en: "Look more professional" },
      },
      UNSURE,
    ],
  },
  {
    id: "pages",
    label: {
      nl: "Welke pagina’s heb je in gedachten?",
      en: "Which pages do you have in mind?",
    },
    type: "many",
    options: [
      { value: "home", label: { nl: "Home", en: "Home" } },
      { value: "about", label: { nl: "Over mij / ons", en: "About" } },
      {
        value: "services",
        label: { nl: "Diensten of producten", en: "Services or products" },
      },
      { value: "work", label: { nl: "Werk of portfolio", en: "Work or portfolio" } },
      { value: "prices", label: { nl: "Prijzen", en: "Pricing" } },
      { value: "contact", label: { nl: "Contact", en: "Contact" } },
      { value: "blog", label: { nl: "Blog of nieuws", en: "Blog or news" } },
      { value: "shop", label: { nl: "Webshop", en: "Shop" } },
      UNSURE,
    ],
  },
  {
    id: "style",
    label: { nl: "Welke sfeer past bij je?", en: "What feel suits you?" },
    hint: {
      nl: "Meerdere antwoorden mogen. Twijfel je: kies wat je aanspreekt.",
      en: "Pick as many as apply, or just what appeals to you.",
    },
    type: "many",
    options: [
      { value: "sharp", label: { nl: "Strak en zakelijk", en: "Sharp and businesslike" } },
      { value: "warm", label: { nl: "Warm en persoonlijk", en: "Warm and personal" } },
      { value: "bold", label: { nl: "Stoer en industrieel", en: "Bold and industrial" } },
      { value: "luxe", label: { nl: "Luxe en minimaal", en: "Luxurious and minimal" } },
      { value: "playful", label: { nl: "Speels en kleurrijk", en: "Playful and colourful" } },
      UNSURE,
    ],
  },
  {
    id: "content",
    label: { nl: "Heb je teksten en foto’s?", en: "Do you have copy and photos?" },
    type: "one",
    options: [
      { value: "ready", label: { nl: "Ja, alles ligt klaar", en: "Yes, all ready" } },
      { value: "partial", label: { nl: "Deels", en: "Partly" } },
      {
        value: "none",
        label: { nl: "Nee, daar wil ik hulp bij", en: "No, I need help with that" },
      },
      UNSURE,
    ],
  },
  {
    id: "brand",
    label: {
      nl: "Heb je een logo of huisstijl?",
      en: "Do you have a logo or brand style?",
    },
    type: "one",
    options: [
      { value: "full", label: { nl: "Logo én huisstijl", en: "Logo and brand style" } },
      { value: "logo", label: { nl: "Alleen een logo", en: "Just a logo" } },
      { value: "none", label: { nl: "Nog niets", en: "Nothing yet" } },
      UNSURE,
    ],
  },
  {
    id: "domain",
    label: { nl: "Domeinnaam en hosting?", en: "Domain name and hosting?" },
    type: "one",
    options: [
      { value: "both", label: { nl: "Allebei geregeld", en: "Both sorted" } },
      { value: "domain", label: { nl: "Alleen een domeinnaam", en: "Domain only" } },
      { value: "none", label: { nl: "Nog niets", en: "Nothing yet" } },
      UNSURE,
    ],
  },
  {
    id: "budget",
    label: {
      nl: "Welk budget heb je in gedachten?",
      en: "What budget do you have in mind?",
    },
    hint: {
      nl: "Een richting is genoeg. Hier zit je nergens aan vast.",
      en: "A ballpark is enough. Nothing binding.",
    },
    type: "one",
    options: [
      { value: "s", label: { nl: "Tot €500", en: "Up to €500" } },
      { value: "m", label: { nl: "€500 – €1.500", en: "€500 – €1,500" } },
      { value: "l", label: { nl: "€1.500 – €4.000", en: "€1,500 – €4,000" } },
      { value: "xl", label: { nl: "Meer dan €4.000", en: "More than €4,000" } },
      UNSURE,
    ],
  },
  {
    id: "deadline",
    label: { nl: "Wanneer wil je live?", en: "When do you want to go live?" },
    type: "one",
    options: [
      { value: "asap", label: { nl: "Zo snel mogelijk", en: "As soon as possible" } },
      { value: "month", label: { nl: "Binnen een maand", en: "Within a month" } },
      {
        value: "quarter",
        label: { nl: "Over 1 tot 3 maanden", en: "In one to three months" },
      },
      { value: "later", label: { nl: "Geen haast", en: "No rush" } },
      UNSURE,
    ],
  },
  {
    id: "likes",
    label: { nl: "Sites die je mooi vindt", en: "Sites you like" },
    hint: {
      nl: "Plak gerust een paar links. Ook die van concurrenten.",
      en: "Paste a few links. Competitors are useful too.",
    },
    type: "text",
    placeholder: { nl: "https://…", en: "https://…" },
  },
  {
    id: "notes",
    label: { nl: "Vertel het in je eigen woorden", en: "Tell it in your own words" },
    hint: {
      nl: "Wat doe je, voor wie, en wat moet er op de site gebeuren? Hoe meer je kwijt kunt, hoe scherper mijn voorstel.",
      en: "What do you do, for whom, and what should happen on the site? The more you write, the sharper my proposal.",
    },
    type: "text",
    required: true,
    placeholder: {
      nl: "Ik heb een bakkerij in Utrecht en wil dat mensen online taarten kunnen bestellen…",
      en: "I run a bakery in Utrecht and want people to order cakes online…",
    },
  },
]

/**
 * De vaste teksten om de vragen heen. Staan hier en niet in dictionaries.ts
 * om dezelfde reden als de vragen zelf: één pagina, één bestand, beide talen
 * naast elkaar.
 */
export const BRIEF_UI = {
  eyebrow: { nl: "Briefing", en: "Brief" },
  title: { nl: "Vertel wat je wilt", en: "Tell me what you want" },
  lead: {
    nl: "Tien vragen, vijf minuten. Weet je iets nog niet? Kies dan “weet ik nog niet” — dat is een prima antwoord, daar komen we samen uit.",
    en: "Ten questions, five minutes. Not sure about something? Pick “not sure yet” — that is a perfectly good answer, we will work it out together.",
  },
  about: { nl: "Over jou", en: "About you" },
  name: { nl: "Naam", en: "Name" },
  email: { nl: "E-mailadres", en: "Email address" },
  company: { nl: "Bedrijf", en: "Company" },
  phone: { nl: "Telefoon", en: "Phone" },
  optional: { nl: "Mag leeg blijven.", en: "Optional." },
  images: { nl: "Foto’s meesturen", en: "Attach photos" },
  imagesHint: {
    nl: "Logo, foto’s van je zaak, schermafdrukken van je huidige site — maximaal zes. Grote foto’s verkleint je browser zelf.",
    en: "Logo, photos of your business, screenshots of your current site — six at most. Large photos are resized in your browser.",
  },
  imagesChoose: { nl: "Kies bestanden", en: "Choose files" },
  imagesRemove: { nl: "Verwijderen", en: "Remove" },
  submit: { nl: "Verstuur briefing", en: "Send brief" },
  sending: { nl: "Versturen…", en: "Sending…" },
  success: {
    nl: "Binnen. Ik lees het door en kom binnen één werkdag bij je terug.",
    en: "Received. I will read it and get back to you within one working day.",
  },
  required: { nl: "Verplicht", en: "Required" },
  errors: {
    invalid: {
      nl: "Er ontbreekt nog iets. De gemarkeerde vragen hebben een antwoord nodig.",
      en: "Something is still missing. The marked questions need an answer.",
    },
    rate: {
      nl: "Je hebt net al iets verstuurd. Probeer het later nog eens.",
      en: "You just sent something. Please try again later.",
    },
    server: {
      nl: "Opslaan mislukte. Mail me gerust direct.",
      en: "Saving failed. Feel free to email me directly.",
    },
    upload: {
      nl: "Een van de foto’s kwam er niet door.",
      en: "One of the photos did not go through.",
    },
    link: {
      nl: "Deze link is niet meer geldig. Vraag om een nieuwe.",
      en: "This link is no longer valid. Ask for a new one.",
    },
  },
  privacyNote: {
    nl: "Je gegevens gebruik ik alleen om je aanvraag te beantwoorden.",
    en: "I only use your details to answer your request.",
  },
  invited: { nl: "Briefing voor", en: "Brief for" },
} as const

/** Van id naar vraag; gebruikt door de markdown-opmaak. */
const BY_ID = new Map(BRIEF_QUESTIONS.map((question) => [question.id, question]))

export const MAX_IMAGES = 6
export const BRIEF_TEXT_MAX = 2000

export const BRIEF_CONTACT_FIELDS = ["name", "email", "company", "phone"] as const
export type BriefContactField = (typeof BRIEF_CONTACT_FIELDS)[number]

const briefContactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(200),
  company: z.string().trim().max(80),
  phone: z.string().trim().max(40),
})

/** Alle ingevulde waarden, ook de keuzevragen: één vorm voor de echo terug. */
export type BriefValues = Record<string, string[]>

/**
 * Een uitnodiging: één link, voor één klant. Er is geen publieke briefing —
 * wie het adres niet van jou kreeg, komt er niet in. Dat scheelt ook alle
 * spam die een open formulier van deze lengte zou trekken.
 */
export type Invite = {
  /** Het geheim in de URL. Alleen vergeleken met de opgeslagen lijst. */
  token: string
  /** Voor wie de link is. Staat alleen in /admin en boven de briefing. */
  label: string
  lang: "nl" | "en"
  createdAt: string
  /** Wanneer er voor het laatst mee ingestuurd is. */
  usedAt?: string
}

export const inviteSchema = z.object({
  label: z.string().trim().min(1).max(80),
  lang: z.enum(["nl", "en"]),
})

/** Precies wat newToken() maakt; alles daarbuiten is meteen een 404. */
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/

export type Brief = z.infer<typeof briefContactSchema> & {
  id: string
  /** De link waarmee ingestuurd is, en het label dat eraan hing. */
  token: string
  invite: string
  /** Per vraag-id de gekozen waarden; een vrij veld heeft er één. */
  answers: BriefValues
  /** Publieke paden zoals saveUpload() ze teruggeeft. */
  images: string[]
  lang: "nl" | "en"
  /** looksLikeSpam() zei ja. Alleen een markering, nooit een blokkade. */
  suspect: boolean
  createdAt: string
}

export type BriefState =
  | { status: "idle" }
  | { status: "sent" }
  | {
      status: "error"
      reason: "invalid" | "rate" | "server" | "upload" | "link"
      /** React 19 leegt het formulier bij elke submit; zonder dit is alles weg. */
      values: BriefValues
      fields?: string[]
      /** Alleen bij reason "upload": wat er precies misging. */
      detail?: string
    }

/**
 * Haalt de briefing uit de ruwe FormData. Keuzes worden getoetst aan de opties
 * die we zélf gestuurd hebben — wat daar niet in staat valt weg, dus een
 * verzonnen waarde komt de opslag niet in.
 *
 * De tijdsval komt als parameter binnen, net als bij parseReviewForm: dit
 * bestand blijft daarmee vrij van relatieve imports.
 */
export function parseBriefForm(
  formData: FormData,
  minFillMs: number,
): {
  values: BriefValues
  data?: Omit<Brief, "id" | "images" | "suspect" | "createdAt" | "token" | "invite">
  fields?: string[]
} {
  const values: BriefValues = {}
  for (const field of BRIEF_CONTACT_FIELDS) {
    values[field] = [String(formData.get(field) ?? "")]
  }

  const answers: BriefValues = {}
  const missing: string[] = []
  for (const question of BRIEF_QUESTIONS) {
    if (question.type === "text") {
      const text = String(formData.get(question.id) ?? "")
        .trim()
        .slice(0, BRIEF_TEXT_MAX)
      values[question.id] = [text]
      if (text) answers[question.id] = [text]
      if (question.required && text.length < 10) missing.push(question.id)
      continue
    }

    const allowed = new Set(question.options?.map((option) => option.value))
    const picked = formData
      .getAll(question.id)
      .map(String)
      .filter((value) => allowed.has(value))
    // Een radio levert er hooguit één; bij een geknutselde POST snijden we af.
    const chosen = question.type === "one" ? picked.slice(0, 1) : picked
    values[question.id] = chosen
    if (chosen.length) answers[question.id] = chosen
    if (question.required && !chosen.length) missing.push(question.id)
  }

  const parsed = briefContactSchema
    .extend({
      lang: z.enum(["nl", "en"]),
      website: z.string().max(0),
      elapsed: z.coerce.number().min(minFillMs),
    })
    .safeParse({
      name: values.name[0],
      email: values.email[0],
      company: values.company[0],
      phone: values.phone[0],
      lang: formData.get("lang"),
      website: formData.get("website"),
      elapsed: formData.get("elapsed"),
    })

  // De honeypot en de tijdsval blijven uit de veldenlijst: een bot hoeft niet
  // te horen welk veld hem verraadde. Sneuvelt hij alléén daarop, dan komt er
  // een lege lijst terug en krijgt hij de algemene melding.
  const fieldErrors = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors
  const fields = [
    ...BRIEF_CONTACT_FIELDS.filter((field) => fieldErrors[field]),
    ...missing,
  ]
  if (!parsed.success || fields.length) return { values, fields }

  const { name, email, company, phone, lang } = parsed.data
  return { values, data: { name, email, company, phone, answers, lang } }
}

/**
 * Wat de klant zelf intypte, voor de spamheuristiek. "likes" blijft eruit:
 * daar vragen we juist om links naar sites die hij mooi vindt, en
 * looksLikeSpam() rekent twee links al als verdacht. Zonder deze uitzondering
 * draagt bijna elke eerlijke briefing een [spam?] in het onderwerp.
 */
export function briefText(
  brief: Pick<Brief, "name" | "company" | "answers">,
): string {
  const texts = BRIEF_QUESTIONS.filter(
    (question) => question.type === "text" && question.id !== "likes",
  )
    .map((question) => brief.answers[question.id]?.[0] ?? "")
    .join(" ")
  return `${brief.name} ${brief.company} ${texts}`
}

/**
 * De briefing als markdown: leest prettig in de mail én is precies wat je
 * doorplakt naar een AI om er iets mee te bouwen. Labels altijd in het
 * Nederlands — dit stuk leest de eigenaar, niet de klant.
 */
export function briefToMarkdown(brief: Brief, baseUrl: string): string {
  const lines: string[] = [
    `# Aanvraag — ${brief.company || brief.name}`,
    "",
    `- Naam: ${brief.name}`,
    `- E-mail: ${brief.email}`,
    ...(brief.company ? [`- Bedrijf: ${brief.company}`] : []),
    ...(brief.phone ? [`- Telefoon: ${brief.phone}`] : []),
    `- Taal van de klant: ${brief.lang}`,
    `- Ontvangen: ${new Date(brief.createdAt).toLocaleString("nl-NL")}`,
    "",
  ]

  for (const [id, chosen] of Object.entries(brief.answers)) {
    const question = BY_ID.get(id)
    if (!question || !chosen.length) continue
    lines.push(`## ${question.label.nl}`)
    if (question.type === "text") {
      lines.push(chosen[0], "")
      continue
    }
    lines.push(
      chosen
        .map((value) => {
          const label = question.options?.find((option) => option.value === value)
          return `- ${label ? label.label.nl : value}`
        })
        .join("\n"),
      "",
    )
  }

  if (brief.images.length) {
    lines.push(
      "## Meegestuurde beelden",
      brief.images.map((src) => `- ${baseUrl}${src}`).join("\n"),
      "",
    )
  }

  return lines.join("\n")
}
