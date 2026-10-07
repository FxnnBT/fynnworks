import assert from "node:assert/strict"
import { test } from "node:test"
import type { Dict } from "../content/dictionaries.ts"
import { faqJsonLd, jsonLd } from "./jsonld.ts"

// Alleen de velden die jsonLd() aanraakt; de echte dictionary importeren kan
// niet, want die gaat via de @/-alias die node --test niet kent.
const dict = {
  meta: { description: "Websites voor ondernemers." },
  services: {
    title: "Wat ik voor je bouw",
    items: [
      { name: "Landingspagina", description: "Eén pagina.", minPrice: 550 },
      { name: "Maatwerk", description: "Op maat.", minPrice: null },
    ],
  },
  faq: { items: [{ question: "Wat kost het?", answer: "Vanaf €550." }] },
} as unknown as Dict

test("laat geen TODO-placeholder uit BUSINESS in de structured data lekken", () => {
  assert.ok(!JSON.stringify(jsonLd(dict, "nl")).includes("TODO"))
})

test("zet elke vraag uit de dictionary in de FAQPage, met de URL van /faq", () => {
  // Via de JSON heen, want dat is ook wat er daadwerkelijk in de pagina komt.
  const faq = JSON.parse(JSON.stringify(faqJsonLd(dict, "nl")))
  assert.equal(faq.url, "https://fynnworks.nl/nl/faq")
  assert.deepEqual(faq.mainEntity, [
    {
      "@type": "Question",
      name: "Wat kost het?",
      acceptedAnswer: { "@type": "Answer", text: "Vanaf €550." },
    },
  ])
})

test("laat de prijs weg bij een dienst op aanvraag", () => {
  const offers = JSON.parse(JSON.stringify(jsonLd(dict, "nl")))
    .hasOfferCatalog.itemListElement
  assert.equal(offers[0].priceSpecification.minPrice, 550)
  assert.equal("priceSpecification" in offers[1], false)
})
