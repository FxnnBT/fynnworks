"use server"

import { randomBytes } from "node:crypto"
import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE_S,
  type LoginState,
  type ProjectFormState,
  createToken,
  matchesPassword,
} from "@/lib/admin"
import { adminSecret, requireAdmin } from "@/lib/auth"
import { inviteSchema } from "@/lib/brief"
import { checkRate } from "@/lib/contact"
import {
  getBriefs,
  getInvites,
  getProjects,
  getReviews,
  saveBriefs,
  saveInvites,
  saveProjects,
  saveReviews,
} from "@/lib/data"
import { projectSchema, saveUpload } from "@/lib/store"

// Eigen venster, los van het contactformulier: 5 pogingen per uur per IP.
const loginRate = new Map<string, number[]>()

async function clientIp(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for") ?? ""
  return forwarded.split(",")[0]?.trim() || "onbekend"
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const secret = adminSecret()
  if (!secret) return { status: "error", reason: "unset" }
  if (!checkRate(await clientIp(), Date.now(), loginRate)) {
    return { status: "error", reason: "rate" }
  }
  if (!matchesPassword(String(formData.get("password") ?? ""), secret)) {
    return { status: "error", reason: "wrong" }
  }

  ;(await cookies()).set(ADMIN_COOKIE, createToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MAX_AGE_S,
  })
  return { status: "idle" }
}

export async function logout(): Promise<void> {
  ;(await cookies()).delete(ADMIN_COOKIE)
}

// ---------------------------------------------------------------- projecten

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim()
}

export async function addProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin()

  // Alles behalve het bestand, zodat een afgekeurd formulier niet leeg
  // terugkomt: React 19 leegt het bij elke submit.
  const values = Object.fromEntries(
    [...formData.entries()]
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, String(value)]),
  )

  const statusNl = text(formData, "statusNl")
  const statusEn = text(formData, "statusEn")
  const href = text(formData, "href")

  // Eerst alles behalve de afbeelding: anders staat er bij elke typefout een
  // wees in de uploadmap.
  const parsed = projectSchema.omit({ image: true }).safeParse({
    slug: text(formData, "slug"),
    client: text(formData, "client"),
    year: text(formData, "year"),
    title: { nl: text(formData, "titleNl"), en: text(formData, "titleEn") },
    summary: {
      nl: text(formData, "summaryNl"),
      en: text(formData, "summaryEn"),
    },
    tags: text(formData, "tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    href: href || undefined,
    featured: formData.get("featured") === "on",
    status: statusNl && statusEn ? { nl: statusNl, en: statusEn } : undefined,
  })
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return {
      error: `Controleer het veld "${first.path.join(".")}": ${first.message}`,
      values,
    }
  }

  const projects = await getProjects()
  if (projects.some((p) => p.slug === parsed.data.slug)) {
    return { error: "Er bestaat al een project met deze slug.", values }
  }

  const file = formData.get("image")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Kies een afbeelding.", values }
  }

  try {
    const image = await saveUpload(file)
    await saveProjects([...projects, { ...parsed.data, image }])
  } catch (error) {
    console.error("[admin] project opslaan mislukt:", error)
    const message =
      error instanceof Error ? error.message : "Opslaan mislukte."
    return { error: message, values }
  }

  revalidatePath("/admin")
  return { done: true }
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireAdmin()
  const slug = text(formData, "slug")
  const projects = await getProjects()
  await saveProjects(projects.filter((p) => p.slug !== slug))
  // De afbeelding blijft staan: hij heet naar zijn eigen hash, dus een ander
  // project kan hetzelfde bestand gebruiken.
  revalidatePath("/admin")
}

// ------------------------------------------------------------------ reviews

export async function approveReview(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = text(formData, "id")
  const reviews = await getReviews()
  await saveReviews(
    reviews.map((review) =>
      review.id === id ? { ...review, status: "approved" as const } : review,
    ),
  )
  revalidatePath("/admin")
}

export async function deleteReview(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = text(formData, "id")
  const reviews = await getReviews()
  await saveReviews(reviews.filter((review) => review.id !== id))
  revalidatePath("/admin")
}

// ----------------------------------------------------------------- briefings

/**
 * Maakt één briefinglink voor één klant. Er is geen publieke briefingpagina:
 * dit adres is het enige toegangsbewijs, dus het token moet uit een echte
 * random bron komen en niet uit iets voorspelbaars als een teller of een naam.
 */
export async function addInvite(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin()

  const label = text(formData, "label")
  const parsed = inviteSchema.safeParse({ label, lang: formData.get("lang") })
  if (!parsed.success) {
    return { error: "Vul een naam in en kies een taal.", values: { label } }
  }

  await saveInvites([
    ...(await getInvites()),
    {
      ...parsed.data,
      // 18 bytes base64url = 24 tekens, ruim buiten raadbereik.
      token: randomBytes(18).toString("base64url"),
      createdAt: new Date().toISOString(),
    },
  ])
  revalidatePath("/admin")
  return { done: true }
}

/** Trekt de link in: het adres geeft daarna een 404. */
export async function deleteInvite(formData: FormData): Promise<void> {
  await requireAdmin()
  const token = text(formData, "token")
  const invites = await getInvites()
  await saveInvites(invites.filter((invite) => invite.token !== token))
  revalidatePath("/admin")
}

export async function deleteBrief(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = text(formData, "id")
  const briefs = await getBriefs()
  await saveBriefs(briefs.filter((brief) => brief.id !== id))
  // De meegestuurde beelden blijven staan: die heten naar hun eigen hash en
  // kunnen door een ander project gebruikt worden. Zie deleteProject.
  revalidatePath("/admin")
}
