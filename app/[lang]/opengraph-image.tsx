import { ImageResponse } from "next/og"
import { LANGS, getDictionary, isLang } from "@/content/dictionaries"
import { SITE } from "@/lib/site"

// Next zet deze afbeelding zelf onder og:image én twitter:image, met de juiste
// absolute URL (metadataBase staat in layout.tsx). Handmatige tags zijn dus
// niet nodig — alleen twitter.card, want dat bepaalt groot of klein.
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = SITE.name

// Zonder dit rendert de Pi deze afbeelding bij elke scraper-hit opnieuw, terwijl
// hij nooit verandert. Twee talen, twee PNG's, bij de build gebakken.
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

// Hex in plaats van de oklch-waarden uit globals.css: de renderer achter
// ImageResponse (Satori) rekent oklch niet om. Dit zijn de omgerekende
// equivalenten van --background, --foreground, --muted-foreground en --warm.
const BG = "#0a0a0a"
const FG = "#fafafa"
const MUTED = "#a1a1a1"
const WARM = "#e8c17a"

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  // De layout genereert alleen /nl en /en, maar deze route krijgt de param
  // rauw binnen; onbekend = Nederlands in plaats van een kapotte afbeelding.
  const dict = getDictionary(isLang(lang) ? lang : "nl")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: BG,
          // Dezelfde warme gloed als de hero, sterk vereenvoudigd: de shader
          // uit de site valt hier niet na te maken en hoeft dat ook niet.
          backgroundImage: `radial-gradient(900px 500px at 85% 0%, rgba(232,193,122,0.16), transparent 70%)`,
          color: FG,
          fontSize: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: WARM,
          }}
        >
          {dict.hero.eyebrow}
        </div>

        {/* Satori kent geen pre-line, dus de regels van dict.hero.title
            splitsen we zelf — anders wordt "\n" een spatie. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {dict.hero.title.split("\n").map((line) => (
            <div key={line} style={{ fontSize: 88, lineHeight: 1.05 }}>
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 32,
            fontSize: 26,
            color: MUTED,
          }}
        >
          {/* Alleen het domein: de naam staat er al in, en twee keer
              "fynnworks" naast elkaar leest als een fout. */}
          {SITE.url.replace("https://", "")}
        </div>
      </div>
    ),
    size,
  )
}
