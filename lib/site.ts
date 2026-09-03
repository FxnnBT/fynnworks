// Eén plek voor je eigen gegevens. Pas deze drie regels aan zodra je
// domein en mailbox definitief zijn.
export const SITE = {
  name: "fynnworks",
  /** Zonder slash op het eind. Gebruikt voor canonical-URL's en OG-tags. */
  url: "https://fynnworks.nl",
  /** Adres dat zichtbaar op de site staat. Waar formulieren heen gaan
   *  staat los hiervan in CONTACT_TO (.env). */
  email: "info@fynnworks.nl",
} as const

/**
 * Wat je wettelijk moet tonen (art. 3:15d BW / Dienstenwet) plus de waarden die
 * de algemene voorwaarden invullen. Eén bron: content/legal/*.md vervangt de
 * {{tokens}} hiermee, zodat de voorwaarden en de site nooit uiteenlopen.
 *
 * TODO: invullen vóór livegang. Zolang hier "TODO" staat is de site niet
 * compliant — dat is bewust zichtbaar in plaats van stilletjes leeg.
 */
export const BUSINESS = {
  /** Je eigen naam; fynnworks is de handelsnaam. */
  legalName: "TODO",
  /** Vestigingsadres, geen postbus — dat eist de Dienstenwet. */
  street: "TODO",
  postcode: "TODO",
  city: "TODO",
  kvk: "TODO",
  /** Btw-identificatienummer (NL…B01), niet je omzetbelastingnummer. */
  vat: "TODO",
  phone: "TODO",
  email: SITE.email,
  /** Verhoog de versie zodra je de voorwaarden inhoudelijk wijzigt. */
  termsVersion: "1.0",
  termsDate: "TODO",
  /** Artikel 9.3: uurtarief meerwerk, exclusief btw. */
  hourlyRate: "TODO",
  /** Artikel 14.2: maximum aansprakelijkheid per gebeurtenis. */
  liabilityCap: "TODO",
  /** Datum waarop de privacyverklaring voor het laatst wijzigde. */
  privacyDate: "TODO",
} as const

/**
 * Bij een prijs moet staan of er btw bij komt. Zakelijk mag exclusief, aan
 * consumenten moet je inclusief tonen — vandaar de zin in dict.services.vatNote.
 * TODO: bevestigen. Val je onder de KOR, zet dit dan op "geen btw".
 */
export const VAT_SUFFIX = "excl. btw"
