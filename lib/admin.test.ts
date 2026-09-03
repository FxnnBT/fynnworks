import assert from "node:assert/strict"
import { test } from "node:test"
import {
  ADMIN_MAX_AGE_S,
  createToken,
  matchesPassword,
  verifyToken,
} from "./admin.ts"

const SECRET = "een-lang-genoeg-wachtwoord"
const NOW = 1_700_000_000_000

test("een vers token verifieert", () => {
  assert.equal(verifyToken(createToken(SECRET, NOW), SECRET, NOW), true)
})

test("een verlopen token faalt", () => {
  const token = createToken(SECRET, NOW)
  const later = NOW + ADMIN_MAX_AGE_S * 1000 + 1
  assert.equal(verifyToken(token, SECRET, later), false)
})

test("een aangepaste handtekening faalt", () => {
  const [exp, mac] = createToken(SECRET, NOW).split(".")
  const flipped = mac.startsWith("a") ? `b${mac.slice(1)}` : `a${mac.slice(1)}`
  assert.equal(verifyToken(`${exp}.${flipped}`, SECRET, NOW), false)
})

test("een opgerekte vervaldatum faalt", () => {
  const [exp, mac] = createToken(SECRET, NOW).split(".")
  const stretched = String(Number(exp) + 1_000_000)
  assert.equal(verifyToken(`${stretched}.${mac}`, SECRET, NOW), false)
})

test("een token van een ander wachtwoord faalt", () => {
  const token = createToken("ander-wachtwoord", NOW)
  assert.equal(verifyToken(token, SECRET, NOW), false)
})

test("onzin en leegte falen", () => {
  for (const token of [undefined, "", "geen-punt", ".", "abc.def"]) {
    assert.equal(verifyToken(token, SECRET, NOW), false)
  }
})

test("zonder wachtwoord verifieert niets", () => {
  assert.equal(verifyToken(createToken(SECRET, NOW), "", NOW), false)
})

test("wachtwoordvergelijking", () => {
  assert.equal(matchesPassword(SECRET, SECRET), true)
  assert.equal(matchesPassword("fout", SECRET), false)
  assert.equal(matchesPassword("", SECRET), false)
  // Ongelijke lengtes mogen niet gooien maar gewoon false geven.
  assert.equal(matchesPassword(`${SECRET}x`, SECRET), false)
})
