import assert from "node:assert/strict"
import { test } from "node:test"
import {
  MIN_FILL_MS,
  RATE_MAX,
  RATE_WINDOW_MS,
  checkRate,
  contactSchema,
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
