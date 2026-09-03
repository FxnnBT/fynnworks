import { cookies } from "next/headers"
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin"

/**
 * Leeg als de variabele niet gezet is. Dat laat elke controle falen zonder de
 * pagina met een 500 om te trekken — het inlogformulier meldt dan zelf dat de
 * server geen wachtwoord kent.
 */
export function adminSecret(): string {
  return process.env.ADMIN_PASSWORD ?? ""
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  return verifyToken(token, adminSecret())
}

/**
 * Elke server action is een publiek POST-endpoint: dat de pagina het formulier
 * alleen aan ingelogden toont is geen beveiliging. Vandaar deze regel bovenaan
 * elke admin-action, náást de controle in de layout.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Niet ingelogd.")
}
