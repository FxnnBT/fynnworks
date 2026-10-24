import assert from "node:assert/strict"
import { test } from "node:test"
import {
  MIN_FILL_MS,
  RATE_MAX,
  RATE_WINDOW_MS,
  checkRate,
  contactSchema,
  domainAcceptsMail,
  ipFrom,
  looksLikeSpam,
} from "./contact.ts"

const valid = {
  name: "Fynn Tervoort",
  email: "fynn@example.com",
  message: "Ik wil graag een landingspagina voor mijn bedrijf.",
  website: "",
  elapsed: 8000,
}

test("accepteert een normaal ingevuld formulier", () => {
  assert.equal(contactSchema.safeParse(valid).success, true)
})

test("weigert een te kort bericht", () => {
  assert.equal(
    contactSchema.safeParse({ ...valid, message: "hoi" }).success,
    false,
  )
})

test("weigert een kapot e-mailadres", () => {
  assert.equal(
    contactSchema.safeParse({ ...valid, email: "fynn@" }).success,
    false,
  )
})

test("weigert een ingevulde honeypot", () => {
  assert.equal(
    contactSchema.safeParse({ ...valid, website: "http://spam.example" })
      .success,
    false,
  )
})

test("laat een snelle invulling met autofill door", () => {
  // Deze test gaat eronder zodra iemand MIN_FILL_MS omhoog schroeft. Dat is de
  // bedoeling: naam en e-mail komen uit autofill, alleen het bericht kost tijd.
  assert.equal(contactSchema.safeParse({ ...valid, elapsed: 1600 }).success, true)
})

test("weigert een invulling op botsnelheid", () => {
  assert.equal(contactSchema.safeParse({ ...valid, elapsed: 200 }).success, false)
})

test("weigert een POST zonder invultijd", () => {
  // Wat formData.get("elapsed") teruggeeft als het veld ontbreekt.
  assert.equal(contactSchema.safeParse({ ...valid, elapsed: null }).success, false)
})

test("MIN_FILL_MS blijft onder wat een mens met autofill nodig heeft", () => {
  assert.ok(MIN_FILL_MS <= 1500)
})

test("markeert spam aan links, spamwoorden en vreemd schrift", () => {
  assert.equal(looksLikeSpam("kijk op https://a.example en www.b.example"), true)
  assert.equal(looksLikeSpam("We offer cheap SEO for your website"), true)
  assert.equal(looksLikeSpam("Здравствуйте, предлагаем услуги"), true)
})

test("markeert een normale aanvraag met één link niet", () => {
  assert.equal(
    looksLikeSpam(
      "Fynn Tervoort Onze huidige site staat op https://mijnbedrijf.nl, " +
        "kun je daar eens naar kijken?",
    ),
    false,
  )
})

test("weigert scheldwoorden in naam en e-mail", () => {
  const fails = (patch: Partial<typeof valid>) =>
    !contactSchema.safeParse({ ...valid, ...patch }).success
  assert.ok(fails({ email: "tepel@zuiger.nl" }))
  assert.ok(fails({ email: "tepelzuiger@gmail.com" }))
  assert.ok(fails({ name: "Tepel Zuiger" }))
  assert.ok(fails({ name: "FUCK YOU" }))
})

test("woordfilter laat gewone namen en adressen met zo'n stukje erin door", () => {
  const passes = (patch: Partial<typeof valid>) =>
    contactSchema.safeParse({ ...valid, ...patch }).success
  assert.ok(passes({ email: "info@stofzuigerwinkel.nl" }))
  assert.ok(passes({ email: "catering@deboer.nl" }))
  assert.ok(passes({ name: "Dick de Cock" }))
  assert.ok(passes({ name: "Sanne Lulofs" }))
})

test("scheldwoord in het bericht: alleen een tag, geen weigering", () => {
  const message = "Een site voor onze stichting tegen kanker, graag."
  assert.equal(contactSchema.safeParse({ ...valid, message }).success, true)
  assert.equal(looksLikeSpam(message), true)
})

test("rate-limit-IP is niet door de afzender te kiezen", () => {
  const h = (init: Record<string, string>) => new Headers(init)
  assert.equal(
    ipFrom(h({ "cf-connecting-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1" })),
    "9.9.9.9",
  )
  // Cloudflare/Caddy/nginx plakken het echte IP achteraan.
  assert.equal(ipFrom(h({ "x-forwarded-for": "1.1.1.1, 9.9.9.9" })), "9.9.9.9")
  assert.equal(ipFrom(h({})), "onbekend")
})

test("domeincheck: weigert alleen een definitief nee", async () => {
  const dnsError = (code: string) => () =>
    Promise.reject(Object.assign(new Error(code), { code }))
  const mx = (...exchange: string[]) => () =>
    Promise.resolve(exchange.map((e) => ({ exchange: e })))

  assert.equal(await domainAcceptsMail("a@b.nl", mx("mx.b.nl")), true)
  assert.equal(await domainAcceptsMail("a@gmail.con", dnsError("ENOTFOUND")), false)
  assert.equal(await domainAcceptsMail("a@b.nl", dnsError("ENODATA")), false)
  // RFC 7505 null-MX: c-ares geeft de root terug als lege string.
  assert.equal(await domainAcceptsMail("a@b.nl", mx("")), false)
  // DNS hapert: doorlaten, niet de klant weigeren.
  assert.equal(await domainAcceptsMail("a@b.nl", dnsError("ETIMEOUT")), true)
})

test("domeincheck kijkt naar het deel na de laatste @", async () => {
  let asked = ""
  await domainAcceptsMail('"a@b"@c.nl', async (domain) => {
    asked = domain
    return [{ exchange: "mx.c.nl" }]
  })
  assert.equal(asked, "c.nl")
})

test("laat maximaal RATE_MAX verzendingen per uur toe", () => {
  const store = new Map<string, number[]>()
  const now = Date.now()
  for (let i = 0; i < RATE_MAX; i++) {
    assert.equal(checkRate("1.2.3.4", now, store), true, `poging ${i + 1}`)
  }
  assert.equal(checkRate("1.2.3.4", now, store), false)
})

test("rate limit is per IP", () => {
  const store = new Map<string, number[]>()
  const now = Date.now()
  for (let i = 0; i < RATE_MAX; i++) checkRate("1.2.3.4", now, store)
  assert.equal(checkRate("5.6.7.8", now, store), true)
})

test("rate limit vervalt na het tijdvenster", () => {
  const store = new Map<string, number[]>()
  const now = Date.now()
  for (let i = 0; i < RATE_MAX; i++) checkRate("1.2.3.4", now, store)
  assert.equal(checkRate("1.2.3.4", now + RATE_WINDOW_MS + 1, store), true)
})
