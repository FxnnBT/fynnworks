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
