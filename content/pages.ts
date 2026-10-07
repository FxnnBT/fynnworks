import type { PageKey } from "@/lib/pages"
import { BUSINESS } from "@/lib/site"

/**
 * Teksten voor de losse pagina's uit lib/pages.ts. Apart van
 * dictionaries.ts omdat dat bestand anders onleesbaar lang wordt; de
 * dictionary haalt ze hier op als dict.pages.
 *
 * title en description zijn wat Google in de zoekresultaten toont. Houd title
 * onder de ~50 tekens (" | fynnworks" komt er automatisch achter) en
 * description rond de 150: daarna knipt Google af.
 */
export type PageCopy = {
  /** Korte linktekst in menu, footer en bij de diensten. */
  label: string
  title: string
  description: string
  eyebrow: string
  /** De h1 van de pagina. */
  heading: string
  intro: string
  /** Extra tekstblokken onder de intro. points wordt een vinkjeslijst. */
  blocks: { heading: string; text: string; points?: string[] }[]
}

const nl: Record<PageKey, PageCopy> = {
  pricing: {
    label: "Prijzen",
    title: "Prijzen: website laten maken vanaf €550",
    description:
      "Wat kost een website? Landingspagina vanaf €550, bedrijfswebsite vanaf €1.450, webshop en maatwerk op aanvraag. Alles incl. btw, met een vaste prijs vooraf.",
    eyebrow: "Prijzen",
    heading: "Wat kost een website?",
    intro:
      "Vaste prijzen, vooraf afgesproken. Na een kennismakingsgesprek van een half uur weet je precies wat je betaalt: geen uurtje-factuurtje, geen verrassing achteraf. Alle bedragen zijn inclusief btw.",
    blocks: [
      {
        heading: "Wat zit er altijd bij?",
        text: "Een ontwerp op maat dat je ziet voordat ik ga bouwen, twee feedbackrondes, een site die werkt op telefoon, tablet en desktop, en een goede basis om gevonden te worden in Google. Domein, hosting en e-mail zet ik voor je op.",
      },
      {
        heading: "Meerwerk en onderhoud",
        text: `Wil je na oplevering iets extra's, dan reken ik per uur af: € ${BUSINESS.hourlyRateInclVat} incl. btw, voor zakelijke klanten € ${BUSINESS.hourlyRate} excl. btw. Je krijgt vooraf een inschatting en ik begin pas als je akkoord geeft.`,
      },
      {
        heading: "Van wie is de site?",
        text: "Van jou. Domein, code en beeldmateriaal zijn jouw eigendom. Je zit niet vast aan een abonnement en kunt er op elk moment mee naar iemand anders.",
      },
    ],
  },
  work: {
    label: "Portfolio",
    title: "Portfolio: websites voor ondernemers",
    description:
      "Websites en webshops die ik voor ondernemers ontwierp en bouwde. Bekijk het werk, klik door naar de live sites en lees wat klanten ervan vonden.",
    eyebrow: "Portfolio",
    heading: "Gemaakt voor ondernemers",
    intro:
      "Elk project hieronder heb ik zelf ontworpen en gebouwd, van het eerste gesprek tot de oplevering. Klik door naar de live site en bekijk hem op je eigen telefoon.",
    blocks: [],
  },
  process: {
    label: "Hoe werkt het",
    title: "Hoe werkt het? Van gesprek tot live website",
    description:
      "Zo laat je bij fynnworks een website maken: een kort gesprek, een vaste prijs, eerst het ontwerp en dan de bouw. Een landingspagina staat binnen twee weken live.",
    eyebrow: "Hoe werkt het",
    heading: "Van eerste gesprek tot live site",
    intro:
      "Vier stappen, zonder verrassingen. Je weet vooraf wat het kost, ziet het ontwerp voordat er code geschreven wordt en hebt de hele tijd één aanspreekpunt: mij.",
    blocks: [
      {
        heading: "Wat ik van je nodig heb",
        text: "Je teksten, foto's en logo, of een idee van waar je naartoe wilt. Heb je nog geen teksten, dan denk ik mee. Hoe sneller ik het materiaal heb, hoe sneller je site live staat.",
      },
      {
        heading: "Hoe lang duurt het?",
        text: "Een landingspagina staat binnen twee weken live, een site van vijf tot tien pagina's meestal binnen vier tot zes weken. Maatwerk plannen we samen.",
      },
      {
        heading: "Na oplevering",
        text: "Je krijgt een handleiding waarin staat waar elke tekst vandaan komt, zodat je kleine wijzigingen zelf doet. Liever dat ik het doe? Dan reken ik per uur af, met vooraf een inschatting.",
      },
    ],
  },
  faq: {
    label: "Veelgestelde vragen",
    title: "Veelgestelde vragen over een website laten maken",
    description:
      "Wat kost een website, hoe lang duurt het, kun je zelf teksten aanpassen en van wie is de site? Antwoorden op wat ondernemers het vaakst vragen.",
    eyebrow: "FAQ",
    heading: "Veelgestelde vragen",
    intro:
      "Wat ondernemers me het vaakst vragen voordat ze een website laten maken. Staat jouw vraag er niet bij? Stel hem gerust onderaan de pagina.",
    blocks: [],
  },
  about: {
    label: "Over mij",
    title: "Over mij: Fynn Tervoort, webbouwer uit Bussum",
    description:
      "fynnworks is Fynn Tervoort, student en webbouwer uit Bussum. Ik ontwerp en bouw websites voor ZZP en MKB, zonder bureautarief en zonder tussenpersoon.",
    eyebrow: "Over mij",
    heading: "Hoi, ik ben Fynn.",
    intro:
      "Ik bouw websites naast mijn studie, vanuit Bussum. Ontwerp, bouw en oplevering doe ik zelf: je praat met degene die het werk maakt, niet met een accountmanager.",
    blocks: [
      {
        heading: "Waarom geen bureautarief?",
        text: "Een bureau rekent ook voor kantoor, accountmanagers en projectleiders. Ik niet. Dat scheelt je geld, niet de kwaliteit: je ziet het ontwerp voordat er één regel code staat, en pas als jij tevreden bent ga ik bouwen.",
      },
      {
        heading: "Hoe ik werk",
        text: "Snel en zonder omwegen. Ik antwoord meestal binnen één werkdag, je krijgt vooraf een vaste prijs en je hebt van begin tot eind één aanspreekpunt.",
      },
    ],
  },
  landing: {
    label: "Landingspagina laten maken",
    title: "Landingspagina laten maken vanaf €550",
    description:
      "Landingspagina laten maken vanaf €550 incl. btw. Eén pagina met een ontwerp op maat en een contactformulier, vindbaar in Google en binnen twee weken live.",
    eyebrow: "Landingspagina",
    heading: "Landingspagina laten maken",
    intro:
      "Eén pagina die één ding doet: bezoekers omzetten in aanvragen. Vanaf €550 inclusief btw, binnen twee weken live, en je praat direct met degene die hem bouwt.",
    blocks: [
      {
        heading: "Wat je krijgt",
        text: "Alles wat een landingspagina nodig heeft om te werken, zonder losse rekeningen achteraf.",
        points: [
          "Ontwerp op maat, geen template",
          "Contactformulier",
          "Vindbaar in Google",
          "Getest op telefoon, tablet en desktop",
          "Twee feedbackrondes op het ontwerp",
          "Domein, hosting en e-mail ingericht",
        ],
      },
      {
        heading: "Voor wie?",
        text: "Voor ZZP'ers en ondernemers met één duidelijk aanbod: een dienst, een product, een campagne of een evenement. Ook een goede eerste stap: begin met één sterke pagina en breid later uit naar een complete site.",
      },
      {
        heading: "Wat kost het?",
        text: "Vanaf €550 inclusief btw. Na het kennismakingsgesprek krijg je een vaste prijs. De pagina is daarna van jou: domein, code en beeldmateriaal zijn jouw eigendom.",
      },
    ],
  },
  business: {
    label: "Bedrijfswebsite laten maken",
    title: "Bedrijfswebsite laten maken vanaf €1.450",
    description:
      "Bedrijfswebsite laten maken vanaf €1.450 incl. btw. Vijf tot tien pagina's met een duidelijk verhaal, hulp bij je teksten en een site die je zelf kunt aanpassen.",
    eyebrow: "Bedrijfswebsite",
    heading: "Bedrijfswebsite laten maken",
    intro:
      "Meerdere pagina's, een duidelijk verhaal en een structuur waar je jaren mee vooruit kunt. Vanaf €1.450 inclusief btw, meestal binnen vier tot zes weken live.",
    blocks: [
      {
        heading: "Wat je krijgt",
        text: "Een complete site voor je bedrijf, van homepage tot contactpagina.",
        points: [
          "Vijf tot tien pagina's, ontwerp op maat",
          "Meedenken over je teksten",
          "Zelf aanpasbaar, met handleiding",
          "Vindbaar in Google",
          "Getest op telefoon, tablet en desktop",
          "Domein, hosting en e-mail ingericht",
        ],
      },
      {
        heading: "Voor wie?",
        text: "Voor ondernemers die meer te vertellen hebben dan op één pagina past: meerdere diensten, een team, cases of een verhaal dat vertrouwen moet wekken. Heb je al een site? Dan bouw ik meestal opnieuw en nemen we je teksten, beelden en Google-posities mee.",
      },
      {
        heading: "Wat kost het?",
        text: "Vanaf €1.450 inclusief btw, afhankelijk van het aantal pagina's en wat erop moet. Na het kennismakingsgesprek krijg je een vaste prijs.",
      },
    ],
  },
  webshop: {
    label: "Webshop laten maken",
    title: "Webshop of maatwerk laten maken",
    description:
      "Webshop, boekingssysteem of portaal met inlog laten maken. Gebouwd op maat, met koppelingen naar de systemen die je al gebruikt en een vaste prijs vooraf.",
    eyebrow: "Webshop & maatwerk",
    heading: "Webshop laten maken",
    intro:
      "Voor alles wat verder gaat dan een brochure: een webshop, een boekingssysteem of een portaal met inlog. Na een kennismakingsgesprek krijg je een vaste prijs voor precies wat jij nodig hebt.",
    blocks: [
      {
        heading: "Wat kan er?",
        text: "Maatwerk betekent: gebouwd rond hoe jouw bedrijf werkt, niet andersom.",
        points: [
          "Webshop",
          "Boekings- of reserveringssysteem",
          "Portaal met inlog en rollen",
          "Koppelingen met systemen en API's",
          "Hosting en onderhoud",
        ],
      },
      {
        heading: "Wat kost het?",
        text: "Op aanvraag. Maatwerk verschilt te veel per project voor een vanafprijs die iets zegt. Vertel me wat je wilt, dan krijg je na een gesprek een vaste prijs: geen uurtje-factuurtje.",
      },
      {
        heading: "Hoe lang duurt het?",
        text: "Dat plannen we samen, afhankelijk van de omvang. Je ziet eerst een ontwerp van de belangrijkste pagina's voordat ik ga bouwen.",
      },
    ],
  },
}

const en: Record<PageKey, PageCopy> = {
  pricing: {
    label: "Pricing",
    title: "Pricing: a website built from €550",
    description:
      "What does a website cost? Landing page from €550, business website from €1,450, web shops and custom builds on request. All incl. VAT, fixed price up front.",
    eyebrow: "Pricing",
    heading: "What does a website cost?",
    intro:
      "Fixed prices, agreed up front. After a half-hour intro call you know exactly what you pay: no hourly billing, no surprises at the end. All amounts include VAT.",
    blocks: [
      {
        heading: "What is always included?",
        text: "A custom design you see before I start building, two rounds of feedback, a site that works on phone, tablet and desktop, and a solid basis for being found on Google. I set up domain, hosting and email for you.",
      },
      {
        heading: "Extra work and upkeep",
        text: `Want something extra after handover? That is billed by the hour: € ${BUSINESS.hourlyRateInclVat} incl. VAT, or € ${BUSINESS.hourlyRate} excl. VAT for businesses. You get an estimate up front and I only start once you approve it.`,
      },
      {
        heading: "Who owns the site?",
        text: "You do. Domain, code and imagery are yours. There is no subscription tying you in, and you can take all of it to someone else at any time.",
      },
    ],
  },
  work: {
    label: "Portfolio",
    title: "Portfolio: websites for small businesses",
    description:
      "Websites and web shops I designed and built for small businesses. See the work, click through to the live sites and read what clients thought.",
    eyebrow: "Portfolio",
    heading: "Built for small businesses",
    intro:
      "I designed and built every project below myself, from the first call to handover. Click through to the live site and try it on your own phone.",
    blocks: [],
  },
  process: {
    label: "How it works",
    title: "How it works: from first call to live site",
    description:
      "How getting a website built with fynnworks works: a short call, a fixed price, the design first and then the build. A landing page is live within two weeks.",
    eyebrow: "How it works",
    heading: "From first call to live site",
    intro:
      "Four steps, no surprises. You know the cost up front, see the design before any code is written, and have one point of contact throughout: me.",
    blocks: [
      {
        heading: "What I need from you",
        text: "Your copy, photos and logo, or an idea of where you want to go. No copy yet? I will help you think it through. The sooner I have the material, the sooner your site is live.",
      },
      {
        heading: "How long does it take?",
        text: "A landing page is live within two weeks, a five to ten page site usually within four to six. Custom builds we plan together.",
      },
      {
        heading: "After handover",
        text: "You get a guide showing where every piece of text lives, so you can make small changes yourself. Rather I did them? Then I bill by the hour, with an estimate up front.",
      },
    ],
  },
  faq: {
    label: "FAQ",
    title: "FAQ: getting a website built",
    description:
      "What does a website cost, how long does it take, can you edit the text yourself and who owns the site? Answers to what business owners ask most.",
    eyebrow: "FAQ",
    heading: "Frequently asked questions",
    intro:
      "What business owners ask me most before getting a website built. Question not covered? Feel free to ask it at the bottom of the page.",
    blocks: [],
  },
  about: {
    label: "About",
    title: "About: Fynn Tervoort, web builder from Bussum",
    description:
      "fynnworks is Fynn Tervoort, a student and web builder from Bussum, the Netherlands. I design and build websites for small businesses, without the agency rate.",
    eyebrow: "About",
    heading: "Hi, I'm Fynn.",
    intro:
      "I build websites alongside my studies, from Bussum in the Netherlands. Design, build and handover I do myself: you talk to the person doing the work, not an account manager.",
    blocks: [
      {
        heading: "Why no agency rate?",
        text: "An agency also bills for an office, account managers and project leads. I don't. That saves you money, not quality: you see the design before a single line of code exists, and I only start building once you are happy with it.",
      },
      {
        heading: "How I work",
        text: "Fast and direct. I usually reply within a working day, you get a fixed price up front, and you have one point of contact from start to finish.",
      },
    ],
  },
  landing: {
    label: "Landing page design",
    title: "Landing page built from €550",
    description:
      "Get a landing page built from €550 incl. VAT. One page with a custom design and a contact form, findable on Google and live within two weeks.",
    eyebrow: "Landing page",
    heading: "Get a landing page built",
    intro:
      "One page doing one job: turning visitors into enquiries. From €550 including VAT, live within two weeks, and you talk directly to the person building it.",
    blocks: [
      {
        heading: "What you get",
        text: "Everything a landing page needs to work, without separate bills afterwards.",
        points: [
          "Custom design, no template",
          "Contact form",
          "Findable on Google",
          "Tested on phone, tablet and desktop",
          "Two rounds of design feedback",
          "Domain, hosting and email set up",
        ],
      },
      {
        heading: "Who is it for?",
        text: "For freelancers and business owners with one clear offer: a service, a product, a campaign or an event. Also a good first step: start with one strong page and grow into a full site later.",
      },
      {
        heading: "What does it cost?",
        text: "From €550 including VAT. After the intro call you get a fixed price. The page is yours afterwards: domain, code and imagery are your property.",
      },
    ],
  },
  business: {
    label: "Business website design",
    title: "Business website built from €1,450",
    description:
      "Get a business website built from €1,450 incl. VAT. Five to ten pages with a clear story, help with your copy and a site you can edit yourself.",
    eyebrow: "Business website",
    heading: "Get a business website built",
    intro:
      "Multiple pages, a clear story and a structure that lasts you years. From €1,450 including VAT, usually live within four to six weeks.",
    blocks: [
      {
        heading: "What you get",
        text: "A complete site for your business, from home page to contact page.",
        points: [
          "Five to ten pages, custom design",
          "Help with your copy",
          "Editable by you, with a guide",
          "Findable on Google",
          "Tested on phone, tablet and desktop",
          "Domain, hosting and email set up",
        ],
      },
      {
        heading: "Who is it for?",
        text: "For business owners with more to say than fits on one page: several services, a team, case studies or a story that has to build trust. Already have a site? I usually rebuild, and your copy, images and Google rankings come along.",
      },
      {
        heading: "What does it cost?",
        text: "From €1,450 including VAT, depending on the number of pages and what goes on them. After the intro call you get a fixed price.",
      },
    ],
  },
  webshop: {
    label: "Web shop design",
    title: "Web shop or custom build",
    description:
      "Get a web shop, booking system or portal with logins built. Custom-made, connected to the systems you already use, with a fixed price up front.",
    eyebrow: "Web shop & custom",
    heading: "Get a web shop built",
    intro:
      "For anything beyond a brochure: a web shop, a booking system or a portal with logins. After an intro call you get a fixed price for exactly what you need.",
    blocks: [
      {
        heading: "What is possible?",
        text: "Custom means: built around how your business works, not the other way round.",
        points: [
          "Web shop",
          "Booking or reservation system",
          "Portal with logins and roles",
          "Integrations with systems and APIs",
          "Hosting and upkeep",
        ],
      },
      {
        heading: "What does it cost?",
        text: "On request. Custom work varies too much per project for a starting price that means anything. Tell me what you want, and after a call you get a fixed price: no hourly billing.",
      },
      {
        heading: "How long does it take?",
        text: "We plan that together, depending on the scope. You first see a design of the key pages before I start building.",
      },
    ],
  },
}

export const pageCopy = { nl, en }
