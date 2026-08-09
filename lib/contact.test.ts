import assert from "node:assert/strict"
import { test } from "node:test"
import { RATE_MAX, RATE_WINDOW_MS, checkRate, contactSchema } from "./contact.ts"

const valid = {
  name: "Fynn Tervoort",
  email: "fynn@example.com",
  message: "Ik wil graag een landingspagina voor mijn bedrijf.",
  website: "",
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
