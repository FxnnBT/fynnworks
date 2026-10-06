import type { Dict, Lang } from "@/content/dictionaries"
// Relatief en mét extensie, zodat `node --test lib/*.test.ts` dit bestand
// rechtstreeks kan draaien: die resolver kent de @/-alias niet.
import { BUSINESS, SITE } from "./site.ts"

/**
 * BUSINESS staat vol "TODO" tot je het invult. Die placeholders mogen nooit in
 * de structured data belanden: een adres met "TODO" erin is slechter dan geen
 * adres — Google leest het als feit. Alles uit BUSINESS gaat hier doorheen.
 * JSON.stringify laat undefined-velden zelf weg.
 */
const real = (value: string) => (value === "TODO" ? undefined : value)

function postalAddress() {
  const streetAddress = real(BUSINESS.street)
  const addressLocality = real(BUSINESS.city)
  // Halve adressen zijn niets waard; alles of niets.
  if (!streetAddress || !addressLocality) return undefined
  return {
    "@type": "PostalAddress",
    streetAddress,
    postalCode: real(BUSINESS.postcode),
    addressLocality,
    addressCountry: "NL",
  }
}

function kvkIdentifier() {
  const value = real(BUSINESS.kvk)
  if (!value) return undefined
  return { "@type": "PropertyValue", name: "KvK", value }
}

/** Prijzen volgen dict.services.vatSuffix: nu inclusief btw. Ga je exclusief
 *  tonen of val je onder de KOR, pas dan ook valueAddedTaxIncluded aan. */
function offerCatalog(dict: Dict) {
  return {
    "@type": "OfferCatalog",
    name: dict.services.title,
    itemListElement: dict.services.items.map((item) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: item.name,
        description: item.description,
      },
      // "op aanvraag" heeft geen bedrag: dan liever geen prijsveld dan een
      // verzonnen nul.
      priceSpecification:
        item.minPrice === null
          ? undefined
          : {
              "@type": "PriceSpecification",
              priceCurrency: "EUR",
              minPrice: item.minPrice,
              valueAddedTaxIncluded: true,
            },
    })),
  }
}

/**
 * De vragen staan al in content/dictionaries.ts en in de HTML. Dit herhaalt ze
 * machineleesbaar: Google toont er sinds 2023 geen sterretjes meer bij, maar
 * het is wel precies wat ChatGPT, Claude en Perplexity oppikken als ze "wat
 * kost een website bij fynnworks" moeten beantwoorden.
 */
function faqPage(dict: Dict, lang: Lang) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE.url}/${lang}#faq`,
    inLanguage: lang,
    mainEntity: dict.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}

/** Eén @graph met twee knopen die naar elkaar kunnen verwijzen, in plaats van
 *  losse script-tags die elk hun eigen fynnworks beschrijven. */
export function jsonLd(dict: Dict, lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE.url}/#business`,
        name: SITE.name,
        legalName: real(BUSINESS.legalName),
        description: dict.meta.description,
        url: `${SITE.url}/${lang}`,
        email: SITE.email,
        telephone: real(BUSINESS.phone),
        vatID: real(BUSINESS.vat),
        identifier: kvkIdentifier(),
        address: postalAddress(),
        logo: `${SITE.url}/icon.png`,
        image: `${SITE.url}/icon.png`,
        areaServed: "NL",
        knowsLanguage: ["nl", "en"],
        serviceType: "Webdesign en webdevelopment",
        // Lege lijst weglaten: "sameAs": [] zegt niets en ziet er kapot uit.
        sameAs: SITE.profiles.length ? [...SITE.profiles] : undefined,
        hasOfferCatalog: offerCatalog(dict),
      },
      faqPage(dict, lang),
    ],
  }
}
