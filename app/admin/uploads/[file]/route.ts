import fs from "node:fs/promises"
import { isAdmin } from "@/lib/auth"
import { UPLOAD_NAME, uploadPath } from "@/lib/store"

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
}

/**
 * Wat een klant in de briefing uploadt is van hem, niet van het internet. Deze
 * route staat naast de publieke /uploads en serveert dezelfde soort bestanden
 * uit een andere map, maar alleen aan wie is ingelogd.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  // Een route handler draait buiten de admin-layout om: die controle geldt hier
  // niet en moet dus opnieuw. 404 en geen 403, anders verklapt het antwoord aan
  // een buitenstaander dat het bestand bestaat.
  if (!(await isAdmin())) return new Response(null, { status: 404 })

  const { file } = await params
  // Alleen namen die saveUpload() zelf maakt. Padtraversal komt er dus niet
  // eens aan toe: `..`, slashes en absolute paden halen dit patroon niet.
  if (!UPLOAD_NAME.test(file)) return new Response(null, { status: 404 })

  try {
    const bytes = await fs.readFile(uploadPath(file, "brief"))
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": CONTENT_TYPE[file.split(".")[1]],
        // Privé materiaal: niet in een tussenliggende cache, en niet blijven
        // hangen in de browser nadat de sessie voorbij is.
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new Response(null, { status: 404 })
    }
    throw error
  }
}
