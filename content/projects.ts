import type { Lang } from "./dictionaries"

export type Project = {
  slug: string
  client: string
  year: string
  title: Record<Lang, string>
  summary: Record<Lang, string>
  tags: string[]
  href?: string
  image: string
  /** Grote kaart in de bento-grid: vult twee kolommen. */
  featured?: boolean
  /** Zet een label op de kaart, bv. voor werk dat nog loopt. */
  status?: Record<Lang, string>
}

// Screenshots staan in /public/work/. Vervang ze gerust door mooiere: ik heb
// ze in het browservenster gemaakt, dus het is de bovenkant van de pagina.
export const projects: Project[] = [
  {
    slug: "marcel-hensema",
    client: "Marcel Hensema",
    year: "2025",
    title: {
      nl: "Site voor een theatermaker",
      en: "Site for a theatre maker",
    },
    summary: {
      nl: "Portfolio en speellijst voor een solo-theatermaker. Filmische hero, een speellijst die zichzelf bijwerkt en recensies uit de Volkskrant en Theaterkrant op de voorgrond.",
      en: "Portfolio and tour dates for a solo theatre performer. Cinematic hero, a self-updating schedule, and press quotes from de Volkskrant and Theaterkrant up front.",
    },
    tags: ["Portfolio", "Speellijst", "Bedrijfssite"],
    href: "https://marcelhensema.nl",
    image: "/work/marcel-hensema.jpg",
    featured: true,
  },
  {
    slug: "beldi-amsterdam",
    client: "Beldi Amsterdam",
    year: "2026",
    title: {
      nl: "Webshop voor Marokkaanse waren",
      en: "Web shop for Moroccan goods",
    },
    summary: {
      nl: "Webshop voor tajines, muntthee, olijfzeep en textiel uit Marokko. De winkel is in aanbouw; er staat nu een wachtpagina die alvast mailadressen verzamelt voor de opening.",
      en: "Web shop for tagines, mint tea, olive soap and textiles from Morocco. The shop is in the works; a holding page is already collecting email addresses for launch day.",
    },
    tags: ["Webshop", "Maatwerk"],
    href: "https://beldiamsterdam.com",
    image: "/work/beldi-amsterdam.jpg",
    status: { nl: "In aanbouw", en: "In progress" },
  },
]
