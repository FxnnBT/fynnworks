import fs from "node:fs/promises"
import { UPLOAD_NAME, uploadPath } from "@/lib/store"

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
}

/**
 * Geüploade afbeeldingen staan in de datamap en niet in public/: Next leest
 * public/ alleen bij het opstarten in, dus een verse upload zou 404 geven tot
 * een herstart (zie README, "Demo's").
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params
  // Alleen namen die saveUpload() zelf maakt. Padtraversal komt er dus niet
  // eens aan toe: `..`, slashes en absolute paden halen dit patroon niet.
  if (!UPLOAD_NAME.test(file)) return new Response(null, { status: 404 })

  try {
    const bytes = await fs.readFile(uploadPath(file))
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": CONTENT_TYPE[file.split(".")[1]],
        // De naam is de hash van de inhoud, dus dit bestand verandert nooit.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new Response(null, { status: 404 })
    }
    throw error
  }
}
