"use client"

import { useActionState } from "react"
import { TriangleAlert } from "lucide-react"
import type { ProjectFormState } from "@/lib/admin"
import { fieldClass } from "@/components/contact-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addInvite } from "./actions"

/** Naam erin, link eruit. De nieuwe link verschijnt in de lijst erboven. */
export function InviteForm() {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(
    addInvite,
    {},
  )

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
        <div className="flex flex-col gap-2">
          <Label htmlFor="label" className="eyebrow">
            Voor wie
          </Label>
          <Input
            id="label"
            name="label"
            required
            maxLength={80}
            placeholder="Bakkerij Jansen"
            defaultValue={state.values?.label}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lang" className="eyebrow">
            Taal
          </Label>
          <select
            id="lang"
            name="lang"
            defaultValue="nl"
            className={`${fieldClass} w-full [&>option]:bg-background [&>option]:text-foreground`}
          >
            <option value="nl">Nederlands</option>
            <option value="en">English</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-warm px-6 py-3 text-sm font-medium text-warm-foreground disabled:opacity-60"
        >
          {pending ? "Aanmaken…" : "Link aanmaken"}
        </button>
      </div>

      <div aria-live="polite" role="status">
        {state.error ? (
          <p className="flex items-center gap-3 border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
