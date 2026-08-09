"use client"

import { useActionState } from "react"
import { ArrowRight, Check, TriangleAlert } from "lucide-react"
import { type ContactState, sendContact } from "@/app/actions"
import type { Dict } from "@/content/dictionaries"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const fieldClass =
  "h-12 rounded-none border-0 border-b border-line bg-transparent px-0 text-base focus-visible:border-warm focus-visible:ring-0 dark:bg-transparent"

export function ContactForm({ dict }: { dict: Dict["contact"] }) {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    sendContact,
    { status: "idle" },
  )

  const error =
    state.status === "error" ? dict.errors[state.reason] : undefined

  return (
    <form action={formAction} className="flex flex-col gap-7" noValidate={false}>
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
            className={fieldClass}
          />
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
            className={fieldClass}
          />
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
          className="resize-y rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-base focus-visible:border-warm focus-visible:ring-0 dark:bg-transparent"
        />
      </div>

      {/* Honeypot: buiten beeld, niet focusbaar, genegeerd door screenreaders.
          Bots vullen 'm wel in en worden serverside geweigerd. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center gap-2 rounded-full bg-warm px-7 py-3.5 text-sm font-medium text-warm-foreground transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? dict.sending : dict.submit}
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
        </button>

        <p aria-live="polite" className="text-sm">
          {state.status === "sent" ? (
            <span className="inline-flex items-center gap-2 text-warm">
              <Check className="size-4" />
              {dict.success}
            </span>
          ) : null}
          {error ? (
            <span className="inline-flex items-center gap-2 text-destructive">
              <TriangleAlert className="size-4" />
              {error}
            </span>
          ) : null}
        </p>
      </div>
    </form>
  )
}
