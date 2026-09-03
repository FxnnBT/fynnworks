"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Check, Star, TriangleAlert } from "lucide-react"
import { submitReview } from "@/app/actions"
import Link from "next/link"
import type { Dict, Lang } from "@/content/dictionaries"
import { LEGAL } from "@/lib/legal"
import type { ReviewField, ReviewState } from "@/lib/store"
import { fieldClass } from "@/components/contact-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const STARS = [1, 2, 3, 4, 5]

export function ReviewForm({
  dict,
  lang,
  privacyLabel,
  projects,
}: {
  dict: Dict["reviews"]
  lang: Lang
  privacyLabel: string
  projects: { slug: string; client: string }[]
}) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    submitReview,
    { status: "idle" },
  )
  // De sterren zijn echte radio's, maar wel gestuurd: alleen zo kunnen de
  // sterren links van je keuze meekleuren zonder CSS-acrobatiek. 0 = nog niets
  // gekozen, zodat niemand per ongeluk vijf sterren instuurt.
  const [rating, setRating] = useState(0)

  // Zie contact-form.tsx: performance.now() mag niet tijdens render.
  const mountedAt = useRef(0)
  useEffect(() => {
    mountedAt.current = performance.now()
  }, [])

  const error =
    state.status === "error" ? dict.errors[state.reason] : undefined
  const values = state.status === "error" ? state.values : undefined
  const invalid = state.status === "error" ? (state.fields ?? []) : []
  const isInvalid = (field: ReviewField) => invalid.includes(field)

  useEffect(() => {
    if (state.status !== "error") return
    const first = state.fields?.[0]
    if (first) document.getElementById(first)?.focus()
  }, [state])

  return (
    <form
      action={(formData) => {
        formData.set("elapsed", String(performance.now() - mountedAt.current))
        formAction(formData)
      }}
      className="flex flex-col gap-7"
      suppressHydrationWarning
    >
      <input type="hidden" name="lang" value={lang} />

      <div className="grid gap-7 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="eyebrow">
            {dict.name}
          </Label>
          <Input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            placeholder={dict.namePlaceholder}
            defaultValue={values?.name}
            aria-invalid={isInvalid("name") || undefined}
            aria-describedby={isInvalid("name") ? "name-error" : undefined}
            className={fieldClass}
          />
          {isInvalid("name") ? (
            <p id="name-error" className="text-sm text-destructive">
              {dict.fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="company" className="eyebrow">
            {dict.company}
          </Label>
          <Input
            id="company"
            name="company"
            maxLength={80}
            autoComplete="organization"
            placeholder={dict.companyPlaceholder}
            defaultValue={values?.company}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-2">
          <legend className="eyebrow mb-2">{dict.rating}</legend>
          <div className="flex items-center gap-1">
            {STARS.map((n) => (
              <label
                key={n}
                className="cursor-pointer p-1 text-muted-foreground transition-colors duration-200 hover:text-warm has-[:focus-visible]:outline has-[:focus-visible]:outline-warm"
              >
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  required
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="sr-only"
                />
                <span className="sr-only">
                  {n} {dict.stars}
                </span>
                <Star
                  aria-hidden
                  className={`size-6 ${n <= rating ? "fill-warm text-warm" : ""}`}
                />
              </label>
            ))}
          </div>
          {isInvalid("rating") ? (
            <p className="text-sm text-destructive">{dict.fieldErrors.rating}</p>
          ) : null}
        </fieldset>

        {projects.length > 0 ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="projectSlug" className="eyebrow">
              {dict.project}
            </Label>
            <select
              id="projectSlug"
              name="projectSlug"
              defaultValue=""
              className={`${fieldClass} w-full [&>option]:bg-background [&>option]:text-foreground`}
            >
              <option value="">{dict.projectGeneral}</option>
              {projects.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.client}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="text" className="eyebrow">
          {dict.text}
        </Label>
        <Textarea
          id="text"
          name="text"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder={dict.textPlaceholder}
          defaultValue={values?.text}
          aria-invalid={isInvalid("text") || undefined}
          aria-describedby={isInvalid("text") ? "text-error" : undefined}
          className="resize-y rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-base focus-visible:border-warm focus-visible:ring-0 aria-invalid:border-destructive dark:bg-transparent"
        />
        {isInvalid("text") ? (
          <p id="text-error" className="text-sm text-destructive">
            {dict.fieldErrors.text}
          </p>
        ) : null}
      </div>

      {/* Honeypot, zie contact-form.tsx. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="review-website">Website</label>
        <input id="review-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div aria-live="polite" role="status">
        {state.status === "sent" ? (
          <p className="flex items-center gap-3 border-l-2 border-warm bg-warm/10 px-4 py-3 text-sm text-warm">
            <Check className="size-4 shrink-0" />
            {dict.success}
          </p>
        ) : null}
        {error ? (
          <p className="flex items-center gap-3 border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            {error}
          </p>
        ) : null}
      </div>

      {/* Naam en bedrijf worden gepubliceerd. Dat moet je zeggen vóór het
          insturen, niet erna — dan is de toestemming pas geïnformeerd. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-medium transition-colors duration-300 hover:border-warm hover:text-warm disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? dict.sending : dict.submit}
        </button>
        <p className="text-xs text-muted-foreground">
          {dict.privacyNote}{" "}
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
