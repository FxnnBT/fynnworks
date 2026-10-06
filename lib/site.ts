// Eén plek voor je eigen gegevens. Pas deze drie regels aan zodra je
// domein en mailbox definitief zijn.
export const SITE = {
  name: "fynnworks",
  /** Zonder slash op het eind. Gebruikt voor canonical-URL's en OG-tags. */
  url: "https://fynnworks.nl",
  /** Adres dat zichtbaar op de site staat. Waar formulieren heen gaan
   *  staat los hiervan in CONTACT_TO (.env). */
  email: "info@fynnworks.nl",
  /** Profielen elders die dezelfde fynnworks zijn: LinkedIn, GitHub, een
   *  Google-bedrijfsprofiel. Vult sameAs in de structured data, waarmee Google
   *  en LLM's de site aan die accounts koppelen. Leeg laten mag — een
   *  verkeerde URL is schadelijker dan geen. */
  profiles: [
    "https://www.linkedin.com/in/fynn-tervoort-7243a8386",
    "https://github.com/FxnnBT",
  ] as readonly string[],
} as const

/** In centen, want btw-rekenen in floats gaat mis (32,50 x 1,21 gaf 39,32).
 *  Het tarief incl. btw is het ronde getal; excl. wordt daaruit afgeleid. */
const HOURLY_RATE_INCL_VAT_CENTS = 4000
const VAT_PERCENT = 21
const eur = (cents: number) => (cents / 100).toFixed(2).replace(".", ",")

/**
 * Wat je wettelijk moet tonen (art. 3:15d BW / Dienstenwet) plus de waarden die
 * de algemene voorwaarden invullen. Eén bron: content/legal/*.md vervangt de
 * {{tokens}} hiermee, zodat de voorwaarden en de site nooit uiteenlopen.
 *
 * TODO: invullen vóór livegang. Zolang hier "TODO" staat is de site niet
 * compliant — dat is bewust zichtbaar in plaats van stilletjes leeg.
 */
export const BUSINESS = {
  /** Naam waaronder je in het Handelsregister staat. */
  legalName: "fynnworks",
  /** Vestigingsadres, geen postbus — dat eist de Dienstenwet. */
  street: "Torenlaan 5",
  postcode: "1402 AT",
  city: "Bussum",
  kvk: "42179737",
  /** Btw-identificatienummer (NL…B01), niet je omzetbelastingnummer. */
  vat: "NL005556819B59",
  phone: "TODO",
  email: SITE.email,
  /** Verhoog de versie zodra je de voorwaarden inhoudelijk wijzigt. */
  termsVersion: "1.2",
  termsDate: "TODO",
  /** Artikel 9.3: uurtarief meerwerk en werk na oplevering, excl. btw. */
  hourlyRate: eur(
    Math.round((HOURLY_RATE_INCL_VAT_CENTS * 100) / (100 + VAT_PERCENT)),
  ),
  /** Hetzelfde tarief inclusief btw: dat is wat een Consument betaalt en wat
   *  je hem volgens de wet moet tonen. Val je onder de KOR: VAT_PERCENT op 0. */
  hourlyRateInclVat: eur(HOURLY_RATE_INCL_VAT_CENTS),
  /** Artikel 14.2: maximum aansprakelijkheid per gebeurtenis. */
  liabilityCap: "TODO",
  /** Datum waarop de privacyverklaring voor het laatst wijzigde. */
  privacyDate: "TODO",
} as const
