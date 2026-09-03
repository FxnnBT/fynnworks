"use client"

import { useActionState, useEffect, useRef } from "react"
import { ArrowRight, Check, TriangleAlert } from "lucide-react"
import { sendContact } from "@/app/actions"
import type { ContactField, ContactState } from "@/lib/contact"
import Link from "next/link"
import type { Dict, Lang } from "@/content/dictionaries"
import { LEGAL } from "@/lib/legal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Ook gebruikt door het reviewformulier: één onderstreepte veldstijl voor de
// hele site.
export const fieldClass =
  "h-12 rounded-none border-0 border-b border-line bg-transparent px-0 text-base focus-visible:border-warm focus-visible:ring-0 aria-invalid:border-destructive dark:bg-transparent"

export function ContactForm({
  dict,
  lang,
  privacyLabel,
}: {
  dict: Dict["contact"]
  lang: Lang
  privacyLabel: string
}) {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    sendContact,
    { status: "idle" },
  )

  // performance.now()-verschil, geen absolute tijdstempel: een scheve klok bij
  // de bezoeker doet er zo niet toe. Het blijft een ref, dus de form-reset bij
  // een mislukte poging zet 'm niet terug — een tweede klik komt altijd door.
  // Zetten gebeurt in een effect: performance.now() tijdens render is onzuiver
  // en de React-compiler weigert het. Blijft de 0 staan, dan is het verschil
  // juist heel groot en komt de inzending door — de veilige kant op.
  const mountedAt = useRef(0)
  useEffect(() => {
    mountedAt.current = performance.now()
  }, [])

  const error =
    state.status === "error" ? dict.errors[state.reason] : undefined
  const values = state.status === "error" ? state.values : undefined
  const invalid = state.status === "error" ? (state.fields ?? []) : []
  const isInvalid = (field: ContactField) => invalid.includes(field)

  // De browser vangt required/minLength/type zelf af en focust dan ook zelf. Dit
  // is voor wat hij doorlaat maar de server weigert — dan staat de melding
  // onderaan en zou de focus nergens heen gaan. state is elke submit een nieuw
  // object, dus dit vuurt per poging opnieuw.
  useEffect(() => {
    if (state.status !== "error") return
    const first = state.fields?.[0]
    if (first) document.getElementById(first)?.focus()
  }, [state])

  return (
    // Chrome's autofill zet een `__gcruniqueid` op formulieren voordat React
    // hydrateert; dat leest React als een mismatch. Onderdrukt alleen dit
    // element — mismatches in de velden eronder blijven zichtbaar.
    <form
      // De invultijd gaat hier mee in plaats van via een verborgen veld: dan
      // staat er niets in de DOM dat een bot kan herkennen en meesturen.
      action={(formData) => {
        formData.set("elapsed", String(performance.now() - mountedAt.current))
        formAction(formData)
      }}
      className="flex flex-col gap-7"
      noValidate={false}
      suppressHydrationWarning
    >
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
          <Label htmlFor="email" className="eyebrow">
            {dict.email}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            placeholder={dict.emailPlaceholder}
            defaultValue={values?.email}
            aria-invalid={isInvalid("email") || undefined}
            aria-describedby={isInvalid("email") ? "email-error" : undefined}
            className={fieldClass}
          />
          {isInvalid("email") ? (
            <p id="email-error" className="text-sm text-destructive">
              {dict.fieldErrors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message" className="eyebrow">
          {dict.message}
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          placeholder={dict.messagePlaceholder}
          defaultValue={values?.message}
          aria-invalid={isInvalid("message") || undefined}
          aria-describedby={isInvalid("message") ? "message-error" : undefined}
          className="resize-y rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-base focus-visible:border-warm focus-visible:ring-0 aria-invalid:border-destructive dark:bg-transparent"
        />
        {isInvalid("message") ? (
          <p id="message-error" className="text-sm text-destructive">
            {dict.fieldErrors.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot: buiten beeld, niet focusbaar, genegeerd door screenreaders.
          Bots vullen 'm wel in en worden serverside geweigerd. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Blijft altijd in de DOM staan: aria-live kondigt alleen wijzigingen
          aan binnen een element dat er al was toen de pagina laadde. */}
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

      {/* AVG art. 13: informeren op het moment dat je de gegevens vraagt.
          Vandaar hier, naast de knop, en niet alleen onderaan de pagina. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center gap-2 rounded-full bg-warm px-7 py-3.5 text-sm font-medium text-warm-foreground transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 active:translate-y-0 active:duration-75 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? dict.sending : dict.submit}
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
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
