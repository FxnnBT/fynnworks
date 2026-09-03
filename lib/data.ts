import { projects as seed } from "@/content/projects"
import type { Brief, Invite } from "@/lib/brief"
import {
  type Project,
  type Review,
  readJson,
  writeJson,
} from "@/lib/store"

const PROJECTS = "projects.json"
const REVIEWS = "reviews.json"
const BRIEFS = "briefs.json"
const INVITES = "invites.json"

/**
 * Bij de allereerste lees wordt content/projects.ts de startinhoud van de
 * store. Daarna is de store de bron: dat scheelt een tweedeling tussen
 * "projecten uit code" die je niet kunt weggooien en "toegevoegde projecten"
 * die je wel kunt weggooien.
 */
export async function getProjects(): Promise<Project[]> {
  const stored = await readJson<Project[] | null>(PROJECTS, null)
  if (stored) return stored
  await writeJson(PROJECTS, seed)
  return seed
}

export async function saveProjects(list: Project[]): Promise<void> {
  await writeJson(PROJECTS, list)
}

export async function getReviews(): Promise<Review[]> {
  return readJson<Review[]>(REVIEWS, [])
}

export async function saveReviews(list: Review[]): Promise<void> {
  await writeJson(REVIEWS, list)
}

export async function getBriefs(): Promise<Brief[]> {
  return readJson<Brief[]>(BRIEFS, [])
}

export async function saveBriefs(list: Brief[]): Promise<void> {
  await writeJson(BRIEFS, list)
}

export async function getInvites(): Promise<Invite[]> {
  return readJson<Invite[]>(INVITES, [])
}

export async function saveInvites(list: Invite[]): Promise<void> {
  await writeJson(INVITES, list)
}

/** undefined = onbekende of ingetrokken link, en dat is een 404. */
export async function findInvite(token: string): Promise<Invite | undefined> {
  return (await getInvites()).find((invite) => invite.token === token)
}
