import { createHmac, timingSafeEqual } from "node:crypto"

export const ADMIN_COOKIE = "fw_admin"
export const ADMIN_MAX_AGE_S = 30 * 24 * 60 * 60

/**
 * Geen sessieopslag: het cookie draagt zijn eigen vervaldatum plus een
 * handtekening daarover, gezet met het wachtwoord als sleutel. Wachtwoord
 * wijzigen maakt daarmee elk uitstaand cookie in één klap ongeldig.
 *
 * Dit bestand houdt zich bewust bij rekenen — geen next/headers, geen
 * relatieve imports — zodat `node --test` het rechtstreeks kan draaien.
 */
function sign(exp: number, secret: string): string {
  return createHmac("sha256", secret).update(String(exp)).digest("hex")
}

export function createToken(secret: string, now: number = Date.now()): string {
  const exp = now + ADMIN_MAX_AGE_S * 1000
  return `${exp}.${sign(exp, secret)}`
}

export function verifyToken(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): boolean {
  if (!token || !secret) return false
  const [rawExp, mac] = token.split(".")
  const exp = Number(rawExp)
  if (!rawExp || !mac || !Number.isFinite(exp) || exp <= now) return false

  const expected = Buffer.from(sign(exp, secret))
  const given = Buffer.from(mac)
  // timingSafeEqual gooit bij ongelijke lengtes, vandaar de check ervoor.
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** Wachtwoordvergelijking zonder lengte- of tijdslek. */
export function matchesPassword(given: string, secret: string): boolean {
  const a = createHmac("sha256", secret).update(given).digest()
  const b = createHmac("sha256", secret).update(secret).digest()
  return timingSafeEqual(a, b)
}

export type LoginState =
  | { status: "idle" }
  | { status: "error"; reason: "wrong" | "rate" | "unset" }

/** Wat het projectformulier terugkrijgt; values echoot de invoer terug. */
export type ProjectFormState = {
  done?: boolean
  error?: string
  values?: Record<string, string>
}
