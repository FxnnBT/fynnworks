import assert from "node:assert/strict"
import { test } from "node:test"
import {
  type Brief,
  briefText,
  briefToMarkdown,
  inviteSchema,
  parseBriefForm,
  TOKEN_PATTERN,
} from "./brief.ts"

const MIN = 1500

/** Een volledig ingevuld formulier; per test pas je er één ding aan. */
function form(overrides: Record<string, string | string[]> = {}): FormData {
  const base: Record<string, string | string[]> = {
    name: "Jan Jansen",
    email: "jan@bakkerij.nl",
    company: "Bakkerij Jansen",
    phone: "",
    lang: "nl",
    token: "abc",
    website: "",
    elapsed: "9000",
    kind: "multi",
    goals: ["leads", "seo"],
    notes: "Ik wil dat mensen online taarten kunnen bestellen.",
  }
  const data = new FormData()
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    for (const one of Array.isArray(value) ? value : [value]) {
      data.append(key, one)
    }
  }
  return data
}

test("neemt een volledig ingevulde briefing aan", () => {
  const { data, fields } = parseBriefForm(form(), MIN)
  assert.equal(fields, undefined)
  assert.equal(data?.name, "Jan Jansen")
  assert.deepEqual(data?.answers.kind, ["multi"])
  assert.deepEqual(data?.answers.goals, ["leads", "seo"])
})

test("meldt de verplichte vragen die leeg bleven", () => {
  const { data, fields } = parseBriefForm(form({ kind: "", notes: "" }), MIN)
  assert.equal(data, undefined)
  assert.deepEqual(fields, ["kind", "notes"])
})

test("gooit keuzes weg die niet in de opties staan", () => {
  const { data } = parseBriefForm(
    form({ kind: "verzonnen", goals: ["leads", "ookverzonnen"] }),
    MIN,
  )
  // kind is verplicht en had alleen een verzonnen waarde: dus geweigerd.
  assert.equal(data, undefined)

  const second = parseBriefForm(form({ goals: ["leads", "ookverzonnen"] }), MIN)
  assert.deepEqual(second.data?.answers.goals, ["leads"])
})

test("een radio levert er hooguit een op", () => {
  const { data } = parseBriefForm(form({ kind: ["multi", "shop"] }), MIN)
  assert.deepEqual(data?.answers.kind, ["multi"])
})

test("honeypot en tijdsval weigeren zonder te verklappen welk veld", () => {
  const honey = parseBriefForm(form({ website: "http://spam" }), MIN)
  assert.equal(honey.data, undefined)
  assert.deepEqual(honey.fields, [])

  const fast = parseBriefForm(form({ elapsed: "200" }), MIN)
  assert.equal(fast.data, undefined)
  assert.deepEqual(fast.fields, [])
})

test("de ingevulde waarden komen altijd terug, ook bij een fout", () => {
  const { values } = parseBriefForm(form({ email: "geenadres" }), MIN)
  assert.deepEqual(values.email, ["geenadres"])
  assert.deepEqual(values.goals, ["leads", "seo"])
})

test("markdown bevat de labels, niet de codes", () => {
  const { data } = parseBriefForm(form(), MIN)
  assert.ok(data)
  const brief: Brief = {
    ...data,
    id: "1",
    token: "t",
    invite: "Bakkerij Jansen",
    images: ["/uploads/abc.jpg"],
    suspect: false,
    createdAt: new Date().toISOString(),
  }
  const md = briefToMarkdown(brief, "https://fynnworks.nl")

  assert.match(md, /# Aanvraag — Bakkerij Jansen/)
  assert.match(md, /## Wat voor site zoek je\?/)
  assert.match(md, /- Meerdere pagina/)
  assert.match(md, /- Meer aanvragen/)
  assert.ok(!md.includes("leads"), "codes horen niet in de markdown")
  assert.match(md, /https:\/\/fynnworks\.nl\/uploads\/abc\.jpg/)
})

test("links naar mooie sites maken een briefing niet verdacht", () => {
  const { data } = parseBriefForm(
    form({ likes: "https://een.nl en https://twee.nl vind ik mooi" }),
    MIN,
  )
  assert.ok(data)
  assert.ok(!briefText(data).includes("https://"))
})

test("uitnodiging vraagt om een label en een bekende taal", () => {
  assert.equal(inviteSchema.safeParse({ label: "", lang: "nl" }).success, false)
  assert.equal(
    inviteSchema.safeParse({ label: "Bakker", lang: "de" }).success,
    false,
  )
  assert.equal(
    inviteSchema.safeParse({ label: " Bakker ", lang: "en" }).data?.label,
    "Bakker",
  )
})

test("tokenpatroon laat geen padtrucs door", () => {
  assert.ok(TOKEN_PATTERN.test("aBc-def_ghi1234567890"))
  assert.ok(!TOKEN_PATTERN.test("../../etc/passwd"))
  assert.ok(!TOKEN_PATTERN.test("kort"))
})
