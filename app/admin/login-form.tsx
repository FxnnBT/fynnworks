"use client"

import { useActionState } from "react"
import { TriangleAlert } from "lucide-react"
import type { LoginState } from "@/lib/admin"
import { fieldClass } from "@/components/contact-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "./actions"

const MESSAGES: Record<"wrong" | "rate" | "unset", string> = {
  wrong: "Onjuist wachtwoord.",
  rate: "Te veel pogingen. Probeer het over een uur nog eens.",
  unset: "Er staat geen ADMIN_PASSWORD op de server.",
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    { status: "idle" },
  )

  return (
    <main className="flex flex-1 items-center justify-center px-5">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-7">
        <h1 className="font-display text-3xl">Beheer</h1>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="eyebrow">
            Wachtwoord
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className={fieldClass}
          />
        </div>

        <div aria-live="polite" role="status">
          {state.status === "error" ? (
            <p className="flex items-center gap-3 border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <TriangleAlert className="size-4 shrink-0" />
              {MESSAGES[state.reason]}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-warm px-7 py-3.5 text-sm font-medium text-warm-foreground disabled:opacity-60"
        >
          {pending ? "Inloggen…" : "Inloggen"}
        </button>
      </form>
    </main>
  )
}
