import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { after, before, test } from "node:test"
import {
  MAX_UPLOAD_BYTES,
  UPLOAD_NAME,
  dataDir,
  parseReviewForm,
  projectSchema,
  readJson,
  reviewSchema,
  saveUpload,
  uploadPath,
  writeJson,
} from "./store.ts"

let dir = ""

before(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "fynnworks-store-"))
  process.env.STATE_DIRECTORY = dir
})

after(async () => {
  delete process.env.STATE_DIRECTORY
  await fs.rm(dir, { recursive: true, force: true })
})

test("dataDir volgt STATE_DIRECTORY", () => {
  assert.equal(dataDir(), dir)
})

test("een ontbrekend bestand geeft de fallback", async () => {
  assert.deepEqual(await readJson("bestaat-niet.json", []), [])
})

test("schrijven en teruglezen", async () => {
  await writeJson("dingen.json", [{ a: 1 }])
  assert.deepEqual(await readJson("dingen.json", null), [{ a: 1 }])
})

test("schrijven laat geen tijdelijk bestand achter", async () => {
  await writeJson("dingen.json", [{ a: 2 }])
  const rest = (await fs.readdir(dir)).filter((f) => f.endsWith(".tmp"))
  assert.deepEqual(rest, [])
})

test("kapotte JSON wordt niet als leegte weggemoffeld", async () => {
  await fs.writeFile(path.join(dir, "stuk.json"), "{niet eens json")
  await assert.rejects(() => readJson("stuk.json", []))
})

const project = {
  slug: "beldi-amsterdam",
  client: "Beldi Amsterdam",
  year: "2026",
  title: { nl: "Webshop", en: "Web shop" },
  summary: { nl: "Tajines en muntthee.", en: "Tagines and mint tea." },
  tags: ["Webshop"],
  href: "https://beldiamsterdam.com",
  image: "/work/beldi-amsterdam.jpg",
}

test("projectschema accepteert een volledig project", () => {
  assert.equal(projectSchema.safeParse(project).success, true)
})

test("projectschema weigert rare slugs, jaren en links", () => {
  for (const bad of [
    { slug: "../../etc/passwd" },
    { slug: "Met Hoofdletters" },
    { slug: "" },
    { year: "vorig jaar" },
    { href: "javascript:alert(1)" },
    { title: { nl: "Alleen Nederlands" } },
  ]) {
    assert.equal(
      projectSchema.safeParse({ ...project, ...bad }).success,
      false,
      `had moeten falen: ${JSON.stringify(bad)}`,
    )
  }
})

const review = {
  name: "Marcel Hensema",
  company: "",
  rating: "5",
  text: "Snel geleverd en het ziet er precies uit zoals besproken.",
  projectSlug: "",
  lang: "nl",
}

test("reviewschema accepteert een normale review", () => {
  const parsed = reviewSchema.safeParse(review)
  assert.equal(parsed.success, true)
  // Uit een formulier komt alles als tekst; de rating moet een getal worden.
  assert.equal(parsed.success && parsed.data.rating, 5)
})

test("reviewschema weigert lege tekst, rating 6 en een vreemde taal", () => {
  for (const bad of [
    { text: "" },
    { text: "kort" },
    { rating: "6" },
    { rating: "0" },
    { rating: "4.5" },
    { lang: "de" },
    { name: "F" },
  ]) {
    assert.equal(
      reviewSchema.safeParse({ ...review, ...bad }).success,
      false,
      `had moeten falen: ${JSON.stringify(bad)}`,
    )
  }
})

// 1x1 PNG, klein genoeg om in een test te zetten.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
)

test("upload krijgt een hashnaam die het patroon haalt", async () => {
  const url = await saveUpload(new File([PNG], "x.png", { type: "image/png" }))
  const name = url.replace("/uploads/", "")
  assert.match(name, UPLOAD_NAME)
  assert.equal(url.startsWith("/uploads/"), true)
  // Zelfde inhoud, zelfde naam: geen dubbele bestanden.
  const again = await saveUpload(
    new File([PNG], "anders.png", { type: "image/png" }),
  )
  assert.equal(again, url)
  assert.deepEqual(await fs.readFile(path.join(dir, "uploads", name)), PNG)
})

test("briefing-upload gaat naar de privémap, niet de publieke", async () => {
  const url = await saveUpload(
    new File([PNG], "x.png", { type: "image/png" }),
    "brief",
  )
  const name = url.replace("/admin/uploads/", "")
  assert.match(name, UPLOAD_NAME)
  assert.equal(url.startsWith("/admin/uploads/"), true)
  // Andere map dan de publieke, en een URL die langs de login moet. Dezelfde
  // inhoud levert in beide klassen dezelfde bestandsnaam op — dat botst niet,
  // juist omdat de mappen gescheiden zijn.
  assert.deepEqual(await fs.readFile(path.join(dir, "brief-uploads", name)), PNG)
  assert.notEqual(uploadPath(name, "brief"), uploadPath(name))
})

test("upload weigert een verkeerd type en te grote bestanden", async () => {
  await assert.rejects(() =>
    saveUpload(new File(["<svg/>"], "x.svg", { type: "image/svg+xml" })),
  )
  const big = new File([Buffer.alloc(MAX_UPLOAD_BYTES + 1)], "x.png", {
    type: "image/png",
  })
  await assert.rejects(() => saveUpload(big))
})

test("uploadpatroon laat geen padtraversal door", () => {
  for (const bad of [
    "../../etc/passwd",
    "a".repeat(16) + ".svg",
    "/abs.png",
    "aaaaaaaaaaaaaaa.png",
    "AAAAAAAAAAAAAAAA.png",
    "aaaaaaaaaaaaaaaa.png/../x",
  ]) {
    assert.equal(UPLOAD_NAME.test(bad), false, `had moeten falen: ${bad}`)
  }
})

/** Zoals het reviewformulier het opstuurt: alles als tekst. */
function reviewForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData()
  const fields = {
    name: "Marcel Hensema",
    company: "Theater",
    rating: "5",
    text: "Snel geleverd en precies zoals besproken, ik ben er blij mee.",
    projectSlug: "marcel-hensema",
    lang: "nl",
    website: "",
    elapsed: "9000",
    ...overrides,
  }
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

test("een normaal ingevuld reviewformulier komt er doorheen", () => {
  const parsed = parseReviewForm(reviewForm(), 1500)
  assert.equal("data" in parsed, true)
  assert.equal("data" in parsed && parsed.data.rating, 5)
  assert.equal("data" in parsed && parsed.data.projectSlug, "marcel-hensema")
})

test("een lege projectkeuze is geldig en betekent algemeen", () => {
  const parsed = parseReviewForm(reviewForm({ projectSlug: "" }), 1500)
  assert.equal("data" in parsed && parsed.data.projectSlug, "")
})

test("de honeypot en de tijdsval verraden zichzelf niet", () => {
  const traps: Record<string, string>[] = [
    { website: "http://spam.example" },
    { elapsed: "200" },
  ]
  for (const bad of traps) {
    const parsed = parseReviewForm(reviewForm(bad), 1500)
    assert.equal("data" in parsed, false)
    // Geen enkel zichtbaar veld aangewezen: de bezoeker krijgt de algemene
    // melding en een bot leert niets.
    assert.deepEqual("fields" in parsed && parsed.fields, [])
  }
})

test("een ontbrekende tijdsval telt als te snel", () => {
  const form = reviewForm()
  form.delete("elapsed")
  assert.equal("data" in parseReviewForm(form, 1500), false)
})

test("een fout veld wordt aangewezen en de invoer komt terug", () => {
  const parsed = parseReviewForm(reviewForm({ text: "kort" }), 1500)
  assert.deepEqual("fields" in parsed && parsed.fields, ["text"])
  assert.equal(parsed.values.text, "kort")
  assert.equal(parsed.values.name, "Marcel Hensema")
})
