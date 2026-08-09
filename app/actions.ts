"use server"

import { headers } from "next/headers"
import nodemailer from "nodemailer"
import { checkRate, contactSchema } from "@/lib/contact"
import { SITE } from "@/lib/site"

export type ContactState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; reason: "invalid" | "rate" | "server" }

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Ontbrekende omgevingsvariabele: ${name}`)
  return value
}

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website"),
  })
  if (!parsed.success) return { status: "error", reason: "invalid" }

  // Caddy/nginx zetten x-forwarded-for; direct verkeer heeft 'm niet.
  const forwarded = (await headers()).get("x-forwarded-for") ?? ""
  const ip = forwarded.split(",")[0]?.trim() || "onbekend"
  if (!checkRate(ip)) return { status: "error", reason: "rate" }

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
      subject: `Nieuwe aanvraag van ${name}`,
      text: `Van: ${name} <${email}>\nIP: ${ip}\n\n${message}\n`,
    })
    return { status: "sent" }
  } catch (error) {
    // Details blijven op de server; de bezoeker krijgt een nette melding.
    console.error("[contact] versturen mislukt:", error)
    return { status: "error", reason: "server" }
  }
}
