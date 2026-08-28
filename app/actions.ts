"use server"

import { headers } from "next/headers"
import nodemailer from "nodemailer"
import { z } from "zod"
import {
  CONTACT_FIELDS,
  type ContactState,
  type ContactValues,
  checkRate,
  contactSchema,
  looksLikeSpam,
} from "@/lib/contact"
import { SITE } from "@/lib/site"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Ontbrekende omgevingsvariabele: ${name}`)
  return value
}

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Uit de ruwe FormData, niet uit parsed.data: bij een parsefout bestaat die
  // niet, en juist dán moeten we de invoer kunnen teruggeven.
  const values = Object.fromEntries(
    CONTACT_FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as ContactValues

  const parsed = contactSchema.safeParse({
    ...values,
    website: formData.get("website"),
    elapsed: formData.get("elapsed"),
  })
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors
    // De honeypot en de tijdsval filteren we eruit: een bot hoeft niet te
    // horen welk veld hem verraadde. Blijft er niets over, dan was het een van
    // die twee — dan krijgt de afzender de algemene melding en verder niets.
    const fields = CONTACT_FIELDS.filter((field) => fieldErrors[field])
    return { status: "error", reason: "invalid", values, fields }
  }

  // Caddy/nginx zetten x-forwarded-for; direct verkeer heeft 'm niet.
  const forwarded = (await headers()).get("x-forwarded-for") ?? ""
  const ip = forwarded.split(",")[0]?.trim() || "onbekend"
  if (!checkRate(ip)) return { status: "error", reason: "rate", values }

  const { name, email, message } = parsed.data
  try {
    const transport = nodemailer.createTransport({
      host: requireEnv("SMTP_HOST"),
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: { user: requireEnv("SMTP_USER"), pass: requireEnv("SMTP_PASS") },
    })
    await transport.sendMail({
      // Afzender moet je eigen mailbox zijn, anders weigert SPF/DMARC 'm.
      from: `"${SITE.name} website" <${requireEnv("SMTP_USER")}>`,
      to: requireEnv("CONTACT_TO"),
      replyTo: `"${name}" <${email}>`,
      // Wel versturen, alleen taggen — één mailboxregel op "[spam?]" ruimt op,
      // en een verkeerd beoordeelde aanvraag blijft vindbaar.
      subject: `${looksLikeSpam(`${name} ${message}`) ? "[spam?] " : ""}Nieuwe aanvraag van ${name}`,
      text: `Van: ${name} <${email}>\nIP: ${ip}\n\n${message}\n`,
    })
    return { status: "sent" }
  } catch (error) {
    // Details blijven op de server; de bezoeker krijgt een nette melding.
    console.error("[contact] versturen mislukt:", error)
    return { status: "error", reason: "server", values }
  }
}
