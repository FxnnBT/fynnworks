"use client"

import { useActionState, useState } from "react"
import { Check, TriangleAlert } from "lucide-react"
import type { ProjectFormState } from "@/lib/admin"
import { fieldClass } from "@/components/contact-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addProject } from "./actions"

function Field({
  name,
  label,
  hint,
  values,
  ...rest
}: {
  name: string
  label: string
  hint?: string
  values?: Record<string, string>
} & React.ComponentProps<typeof Input>) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name} className="eyebrow">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        defaultValue={values?.[name]}
        className={fieldClass}
        {...rest}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

/**
 * maxMb komt als prop binnen en niet uit lib/store: dat bestand importeert
 * node:fs, en een waarde-import zou die hele module de browserbundel in
 * trekken (Turbopack weigert dat, terecht).
 */
export function ProjectForm({ maxMb }: { maxMb: number }) {
  const [state, formAction, pending] = useActionState<
    ProjectFormState,
    FormData
  >(addProject, {})
  const values = state.values

  // Te grote bestanden tegenhouden voordat ze verstuurd worden. Een body die
  // over de serverActions-limiet in next.config.ts gaat wordt geweigerd nog
  // voordat addProject draait: de browser krijgt dan een "Failed to fetch" en
  // Next vervangt de hele pagina door zijn eigen foutscherm. De controle in
  // saveUpload() blijft staan, dat is de echte grens.
  const [tooBig, setTooBig] = useState("")

  return (
    <form action={formAction} className="flex flex-col gap-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <Field
          name="slug"
          label="Slug"
          required
          pattern="[a-z0-9]([a-z0-9-]{0,58}[a-z0-9])?"
          hint="Kleine letters, cijfers en streepjes. Bijvoorbeeld: beldi-amsterdam"
          values={values}
        />
        <Field name="client" label="Klant" required maxLength={80} values={values} />
        <Field
          name="year"
          label="Jaar"
          required
          pattern="\d{4}"
          inputMode="numeric"
          values={values}
        />
        <Field
          name="href"
          label="Link"
          type="url"
          placeholder="https://…"
          hint="Mag leeg blijven."
          values={values}
        />
        <Field name="titleNl" label="Titel (NL)" required maxLength={120} values={values} />
        <Field name="titleEn" label="Titel (EN)" required maxLength={120} values={values} />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        {(["summaryNl", "summaryEn"] as const).map((name) => (
          <div key={name} className="flex flex-col gap-2">
            <Label htmlFor={name} className="eyebrow">
              {name === "summaryNl" ? "Samenvatting (NL)" : "Samenvatting (EN)"}
            </Label>
            <Textarea
              id={name}
              name={name}
              required
              rows={4}
              maxLength={600}
              defaultValue={values?.[name]}
              className="resize-y rounded-none border-0 border-b border-line bg-transparent px-0 py-3 dark:bg-transparent"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field
          name="tags"
          label="Tags"
          hint="Komma's ertussen, maximaal acht."
          values={values}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="image" className="eyebrow">
            Afbeelding
          </Label>
          <input
            id="image"
            name="image"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,image/avif"
            aria-invalid={tooBig ? true : undefined}
            onChange={(event) => {
              const file = event.target.files?.[0]
              setTooBig(
                file && file.size > maxMb * 1024 * 1024
                  ? `Dit bestand is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Kies er een van maximaal ${maxMb} MB.`
                  : "",
              )
            }}
            className="border-b border-line py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-warm file:px-4 file:py-2 file:text-sm file:text-warm-foreground"
          />
          <p className={`text-xs ${tooBig ? "text-destructive" : "text-muted-foreground"}`}>
            {tooBig ||
              `Zelf op maat aanleveren: max ~1600px breed en ${maxMb} MB. Deze Pi verkleint niets.`}
          </p>
        </div>
        <Field
          name="statusNl"
          label="Status (NL)"
          maxLength={40}
          hint="Label op de kaart, bv. “In aanbouw”. Leeg = geen label."
          values={values}
        />
        <Field
          name="statusEn"
          label="Status (EN)"
          maxLength={40}
          hint="Alleen samen met de Nederlandse status."
          values={values}
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={values?.featured === "on"}
          className="size-4 accent-warm"
        />
        Uitgelicht — vult twee kolommen in de bento-grid
      </label>

      <div aria-live="polite" role="status">
        {state.error ? (
          <p className="flex items-center gap-3 border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            {state.error}
          </p>
        ) : null}
        {state.done ? (
          <p className="flex items-center gap-3 border-l-2 border-warm bg-warm/10 px-4 py-3 text-sm text-warm">
            <Check className="size-4 shrink-0" />
            Toegevoegd.
          </p>
        ) : null}
      </div>

      <div>
        <button
          type="submit"
          disabled={pending || tooBig !== ""}
          className="rounded-full bg-warm px-7 py-3.5 text-sm font-medium text-warm-foreground disabled:opacity-60"
        >
          {pending ? "Opslaan…" : "Project toevoegen"}
        </button>
      </div>
    </form>
  )
}
