/**
 * Bezoekersstatistieken via GoatCounter, zelf gehost op de Pi. Script en teller
 * komen van onze eigen origin (rewrites in next.config.ts), dus de browser
 * praat met niemand anders. Geen cookies, geen localStorage.
 *
 * Alleen in productie: in `next dev` draait er geen GoatCounter en zou elke
 * pagina een proxyfout in de terminal zetten. count.js slaat localhost zelf
 * ook al over.
 *
 * Bewust niet in de layout: die dekt ook /briefing/<token>, en dat token hoort
 * niet in de statistieken.
 *
 * ponytail: telt alleen volledige paginaladingen, niet de client-side
 * navigatie van <Link> (footer → privacy). Landingen, verwijzers en landen
 * kloppen wel. Moet elke pagina mee, tel dan in een client component op
 * usePathname() met no_onload aan.
 */
export function GoatCounter() {
  if (process.env.NODE_ENV !== "production") return null
  return <script data-goatcounter="/count" async src="/count.js" />
}
