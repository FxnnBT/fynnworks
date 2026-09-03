"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, TriangleAlert, X } from "lucide-react"
import { submitBrief } from "@/app/actions"
import type { Lang } from "@/content/dictionaries"
import {
  BRIEF_QUESTIONS,
  BRIEF_TEXT_MAX,
  BRIEF_UI,
  MAX_IMAGES,
  type BriefState,
  type BriefValues,
  type Question,
} from "@/lib/brief"
import { LEGAL } from "@/lib/legal"
import { fieldClass } from "@/components/contact-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/** Langste zijde na verkleinen. Ruim genoeg om op te beoordelen. */
const MAX_EDGE = 1600

type Picked = { file: File; url: string }

/**
 * Verkleint een foto in de browser voordat hij verstuurd wordt. Een telefoon
 * levert er zo vier van 5 MB aan, en de Pi verkleint niets: zonder dit loopt
 * de server action tegen zijn bodySizeLimit en krijgt de bezoeker een kaal
 * foutscherm. Canvas doet dit al jaren zonder library.
 *
 * Lukt het niet (HEIC bijvoorbeeld, dat createImageBitmap niet kent), dan gaat
 * het origineel mee en weigert saveUpload het serverseitig met een nette
 * melding. Dat is de echte grens; dit is alleen de vriendelijke.
 */
async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    )
    if (!blob) return file
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
    })
  } catch {
    return file
  }
}

function Chips({
  question,
  lang,
  chosen,
  invalid,
}: {
  question: Question
  lang: Lang
  chosen: string[]
  invalid: boolean
}) {
  // Radio's krijgen `required` mee: die controle doet de browser zelf goed.
  // Bij checkboxes zou required per vakje gelden — "vink ze allemaal aan" — dus
  // die vraag toetst alleen de server.
  const type = question.type === "one" ? "radio" : "checkbox"
  return (
    <div className="flex flex-wrap gap-2">
      {question.options?.map((option) => (
        <label
          key={option.value}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm transition-colors duration-200 hover:border-warm/60 has-[:checked]:border-warm has-[:checked]:bg-warm/10 has-[:checked]:text-warm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-warm"
        >
          <input
            type={type}
            name={question.id}
            value={option.value}
            required={type === "radio" && question.required}
            defaultChecked={chosen.includes(option.value)}
            aria-invalid={invalid || undefined}
            className="sr-only"
          />
          {option.label[lang]}
        </label>
      ))}
    </div>
  )
}

export function BriefForm({
  lang,
  token,
  privacyLabel,
  maxMb,
}: {
  lang: Lang
  /** De link waarmee deze bezoeker binnenkwam; de action controleert 'm. */
  token: string
  privacyLabel: string
  /** Uit lib/store, via de pagina: die module importeert node:fs. */
  maxMb: number
}) {
  const [state, formAction, pending] = useActionState<BriefState, FormData>(
    submitBrief,
    { status: "idle" },
  )
  const [images, setImages] = useState<Picked[]>([])
  const [busy, setBusy] = useState(false)

  // Zie contact-form.tsx: performance.now() mag niet tijdens render.
  const mountedAt = useRef(0)
  useEffect(() => {
    mountedAt.current = performance.now()
  }, [])

  const values: BriefValues = state.status === "error" ? state.values : {}
  const invalid = state.status === "error" ? (state.fields ?? []) : []
  const answer = (id: string) => values[id] ?? []
  const text = (id: string) => answer(id)[0] ?? ""

  // Wat de browser doorlaat maar de server weigert: springen naar het eerste
  // veld dat er iets van vindt, anders staat de melding onderaan en gebeurt er
  // ogenschijnlijk niets.
  useEffect(() => {
    if (state.status !== "error") return
    const first = state.fields?.[0]
    if (!first) return
    // Bij een keuzevraag draagt de fieldset het id en valt er niets te
    // focussen; dan is scrollen naar de vraag het beste wat we kunnen doen.
    const target = document.getElementById(first)
    target?.scrollIntoView({ block: "center", behavior: "smooth" })
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      target.focus()
    }
  }, [state])

  async function addFiles(list: FileList | null) {
    if (!list?.length) return
    setBusy(true)
    const room = MAX_IMAGES - images.length
    const shrunk = await Promise.all([...list].slice(0, room).map(shrink))
    setImages((current) => [
      ...current,
      ...shrunk.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ])
    setBusy(false)
  }

  function removeImage(url: string) {
    URL.revokeObjectURL(url)
    setImages((current) => current.filter((image) => image.url !== url))
  }

  if (state.status === "sent") {
    return (
      <div
        aria-live="polite"
        role="status"
        className="flex items-center gap-3 border-l-2 border-warm bg-warm/10 px-5 py-4 text-warm"
      >
        <Check className="size-5 shrink-0" />
        {BRIEF_UI.success[lang]}
      </div>
    )
  }

  return (
    <form
      action={(formData) => {
        // De verkleinde bestanden gaan hier mee in plaats van via de
        // file-input: die bevat nog de originelen van 5 MB.
        formData.delete("images")
        for (const image of images) formData.append("images", image.file)
        formData.set("elapsed", String(performance.now() - mountedAt.current))
        formAction(formData)
      }}
      className="flex flex-col gap-10 sm:gap-14"
      suppressHydrationWarning
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="token" value={token} />

      <fieldset className="flex flex-col gap-7">
        <legend className="eyebrow mb-5">{BRIEF_UI.about[lang]}</legend>
        <div className="grid gap-6 sm:gap-7 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="eyebrow">
              {BRIEF_UI.name[lang]}
            </Label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              defaultValue={text("name")}
              aria-invalid={invalid.includes("name") || undefined}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="eyebrow">
              {BRIEF_UI.email[lang]}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              defaultValue={text("email")}
              aria-invalid={invalid.includes("email") || undefined}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company" className="eyebrow">
              {BRIEF_UI.company[lang]}
            </Label>
            <Input
              id="company"
              name="company"
              maxLength={80}
              autoComplete="organization"
              defaultValue={text("company")}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="eyebrow">
              {BRIEF_UI.phone[lang]}
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              maxLength={40}
              autoComplete="tel"
              defaultValue={text("phone")}
              className={fieldClass}
            />
            <p className="text-xs text-muted-foreground">
              {BRIEF_UI.optional[lang]}
            </p>
          </div>
        </div>
      </fieldset>

      {BRIEF_QUESTIONS.map((question) => {
        const isInvalid = invalid.includes(question.id)
        return (
          <fieldset
            key={question.id}
            id={question.type === "text" ? `${question.id}-block` : question.id}
            className="flex flex-col gap-4 border-t border-line pt-8 sm:pt-10"
          >
            <legend className="sr-only">{question.label[lang]}</legend>
            <div className="flex flex-col gap-1.5">
              <p className="font-display text-2xl">
                {question.label[lang]}
                {question.required ? (
                  <span className="ml-2 align-middle font-sans text-xs uppercase tracking-widest text-muted-foreground">
                    {BRIEF_UI.required[lang]}
                  </span>
                ) : null}
              </p>
              {question.hint ? (
                <p className="max-w-prose text-sm text-muted-foreground">
                  {question.hint[lang]}
                </p>
              ) : null}
            </div>

            {question.type === "text" ? (
              <Textarea
                id={question.id}
                name={question.id}
                rows={question.required ? 6 : 3}
                maxLength={BRIEF_TEXT_MAX}
                placeholder={question.placeholder?.[lang]}
                defaultValue={text(question.id)}
                aria-invalid={isInvalid || undefined}
                className="resize-y rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-base focus-visible:border-warm focus-visible:ring-0 aria-invalid:border-destructive dark:bg-transparent"
              />
            ) : (
              <Chips
                question={question}
                lang={lang}
                chosen={answer(question.id)}
                invalid={isInvalid}
              />
            )}
          </fieldset>
        )
      })}

      <fieldset className="flex flex-col gap-4 border-t border-line pt-8 sm:pt-10">
        <legend className="sr-only">{BRIEF_UI.images[lang]}</legend>
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-2xl">{BRIEF_UI.images[lang]}</p>
          <p className="max-w-prose text-sm text-muted-foreground">
            {BRIEF_UI.imagesHint[lang]}
          </p>
        </div>

        {images.length ? (
          <ul className="flex flex-wrap gap-3">
            {images.map((image) => (
              <li key={image.url} className="relative">
                {/* Een blob-URL uit deze browser, geen remote bron: next/image
                    zou hier alleen maar in de weg zitten. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.file.name}
                  className="size-24 rounded-xl border border-line object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(image.url)}
                  className="absolute -right-2 -top-2 rounded-full border border-line bg-background p-1.5 transition-colors hover:border-destructive hover:text-destructive"
                >
                  <X aria-hidden className="size-3.5" />
                  <span className="sr-only">
                    {BRIEF_UI.imagesRemove[lang]} — {image.file.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {images.length < MAX_IMAGES ? (
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => {
              void addFiles(event.target.files)
              // Leegmaken: anders kun je hetzelfde bestand niet opnieuw kiezen
              // nadat je het verwijderd hebt.
              event.target.value = ""
            }}
            className="max-w-xs text-sm file:mr-4 file:rounded-full file:border-0 file:bg-warm file:px-4 file:py-2 file:text-sm file:text-warm-foreground"
          />
        ) : null}
        <p className="text-xs text-muted-foreground">
          {images.length}/{MAX_IMAGES} · max {maxMb} MB
        </p>
      </fieldset>

      {/* Honeypot, zie contact-form.tsx. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="brief-website">Website</label>
        <input id="brief-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div aria-live="polite" role="status">
        {state.status === "error" ? (
          <p className="flex items-center gap-3 border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            {BRIEF_UI.errors[state.reason][lang]}
            {state.detail ? ` ${state.detail}` : ""}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          disabled={pending || busy}
          className="group inline-flex items-center gap-2 rounded-full bg-warm px-7 py-3.5 text-sm font-medium text-warm-foreground transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? BRIEF_UI.sending[lang] : BRIEF_UI.submit[lang]}
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
        </button>
        <p className="text-xs text-muted-foreground">
          {BRIEF_UI.privacyNote[lang]}{" "}
          <Link
            href={`/${lang}/${LEGAL.privacy.slug[lang]}`}
            className="underline underline-offset-3 transition-colors hover:text-foreground"
          >
            {privacyLabel}
          </Link>
        </p>
      </div>
    </form>
  )
}
