"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

/**
 * Kopieert de briefing naar het klembord, klaar om in een chat te plakken.
 * navigator.clipboard bestaat alleen in een secure context (https of
 * localhost); lukt het niet, dan blijft de tekst eronder gewoon te selecteren
 * en zegt de knop dat het niet gelukt is.
 */
export function CopyButton({
  text,
  label,
  className,
}: {
  text: string
  label: string
  className?: string
}) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle")

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setState("done")
        } catch {
          setState("failed")
        }
        setTimeout(() => setState("idle"), 2500)
      }}
    >
      <span className="inline-flex items-center gap-2">
        {state === "done" ? (
          <Check aria-hidden className="size-3.5" />
        ) : (
          <Copy aria-hidden className="size-3.5" />
        )}
        {state === "done"
          ? "Gekopieerd"
          : state === "failed"
            ? "Kopiëren lukte niet"
            : label}
      </span>
    </button>
  )
}
