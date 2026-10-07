import assert from "node:assert/strict"
import { test } from "node:test"
import { LEGAL } from "./legal.ts"
import { PAGES, pageKeyBySlug } from "./pages.ts"

// Pagina's en juridische documenten delen het segment /[lang]/[doc]. Dezelfde
// slug in beide zou de juridische pagina onbereikbaar maken, zonder foutmelding.
test("geen slug komt twee keer voor binnen een taal", () => {
  for (const lang of ["nl", "en"] as const) {
    const slugs = [...Object.values(PAGES), ...Object.values(LEGAL)].map(
      (doc) => doc.slug[lang],
    )
    assert.equal(new Set(slugs).size, slugs.length, lang)
  }
})

test("vindt een pagina terug op zijn slug, en alleen in de eigen taal", () => {
  assert.equal(pageKeyBySlug("nl", "prijzen"), "pricing")
  assert.equal(pageKeyBySlug("en", "pricing"), "pricing")
  assert.equal(pageKeyBySlug("en", "prijzen"), undefined)
})
