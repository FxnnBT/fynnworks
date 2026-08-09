import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(200),
  message: z.string().trim().min(10).max(4000),
  // Honeypot: onzichtbaar veld dat bots invullen en mensen nooit zien.
  website: z.string().max(0),
})

export type ContactInput = z.infer<typeof contactSchema>

export const RATE_WINDOW_MS = 60 * 60 * 1000
export const RATE_MAX = 5

// ponytail: in-memory Map, 5 per uur per IP. Prima bij één Next-proces op één
// Pi; leegt bij herstart. Bij meerdere instances of strengere eisen → SQLite.
const defaultStore = new Map<string, number[]>()

/** true = mag versturen. Registreert de poging meteen. */
export function checkRate(
  ip: string,
  now: number = Date.now(),
  store: Map<string, number[]> = defaultStore,
): boolean {
  const recent = (store.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX) {
    store.set(ip, recent)
    return false
  }
  recent.push(now)
  store.set(ip, recent)
  return true
}
