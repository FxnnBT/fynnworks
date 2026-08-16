export const LANGS = ["nl", "en"] as const
export type Lang = (typeof LANGS)[number]

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value)
}

const nl = {
  meta: {
    title: "fynnworks — websites die verkopen",
    description:
      "Ik ontwerp en bouw snelle, eigenzinnige websites voor ondernemers. Van landingspagina tot volledige bedrijfssite.",
  },
  nav: {
    work: "Werk",
    services: "Diensten",
    process: "Werkwijze",
    faq: "Vragen",
    contact: "Contact",
    cta: "Start een project",
  },
  hero: {
    eyebrow: "Webdesign & development",
    title: "Websites die\nwerk opleveren.",
    lead:
      "Geen template die iedereen al heeft. Ik ontwerp en bouw sites die snel laden, goed vindbaar zijn en er uitzien alsof je er om geeft.",
    primary: "Start een project",
    secondary: "Bekijk werk",
  },
  services: {
    eyebrow: "Diensten",
    title: "Wat ik voor je bouw",
    items: [
      {
        name: "Landingspagina",
        price: "vanaf €450",
        description:
          "Eén pagina die één ding doet: bezoekers omzetten in aanvragen. Binnen twee weken live.",
        points: ["Ontwerp op maat", "Contactformulier", "Vindbaar in Google"],
      },
      {
        name: "Multi-page site",
        price: "vanaf €1.200",
        description:
          "Meerdere pagina's, een duidelijk verhaal en een structuur waar je jaren mee vooruit kunt.",
        points: ["5–10 pagina's", "Teksten meedenken", "Zelf aanpasbaar"],
      },
      {
        name: "Maatwerk",
        price: "op aanvraag",
        description:
          "Webshop, boekingssysteem, portaal met inlog. Alles wat verder gaat dan een brochure.",
        points: ["Koppelingen & API's", "Inlog en rollen", "Onderhoud & hosting"],
      },
    ],
  },
  work: {
    eyebrow: "Werk",
    title: "Eerder gemaakt",
    lead: "Een greep uit recente projecten.",
    visit: "Bekijk site",
  },
  process: {
    eyebrow: "Werkwijze",
    title: "Zo gaat het",
    steps: [
      {
        name: "Gesprek",
        description:
          "We bellen een half uur. Ik wil weten wie je klanten zijn en wat de site voor je moet doen. Daarna krijg je een vaste prijs.",
      },
      {
        name: "Ontwerp",
        description:
          "Je krijgt een ontwerp van de belangrijkste pagina's te zien voordat er één regel code geschreven wordt. Twee rondes feedback zitten erbij.",
      },
      {
        name: "Bouw",
        description:
          "Ik bouw de site, vul hem met je teksten en beelden, en test hem op telefoon, tablet en desktop.",
      },
      {
        name: "Live",
        description:
          "Domein, hosting en e-mail regel ik. Daarna kun je zelf verder, of laat je het onderhoud aan mij over.",
      },
    ],
  },
  faq: {
    eyebrow: "Vragen",
    title: "Wat mensen meestal vragen",
    lead: "Staat je vraag er niet bij? Stel hem hieronder.",
    items: [
      {
        question: "Wat gaat dit kosten?",
        answer:
          "De richtprijzen staan hierboven bij Diensten. Na het kennismakingsgesprek krijg je een vaste prijs — geen uurtje-factuurtje, geen verrassing achteraf.",
      },
      {
        question: "Hoe lang duurt het voor de site live staat?",
        answer:
          "Een landingspagina binnen twee weken, een site van vijf tot tien pagina's meestal vier tot zes. Dat hangt vooral af van hoe snel jij teksten en beelden aanlevert.",
      },
      {
        question: "Kan ik daarna zelf teksten aanpassen?",
        answer:
          "Ja. Je krijgt de site met een handleiding waarin staat waar elke tekst vandaan komt. Kleine wijzigingen doe je zelf; wil je liever dat ik het doe, dan kan dat ook.",
      },
      {
        question: "Regel jij ook domein, hosting en e-mail?",
        answer:
          "Ja, dat hoort erbij. Ik zet het op, richt je domein goed in en zorg dat je mail blijft werken. Het domein staat op jouw naam.",
      },
      {
        question: "Ik heb al een site. Kan die opgeknapt worden?",
        answer:
          "Meestal bouw ik liever opnieuw dan dat ik een bestaande site oplap: dat is sneller klaar en het resultaat gaat langer mee. Je teksten, beelden en Google-posities nemen we gewoon mee.",
      },
      {
        question: "Van wie is de site als we klaar zijn?",
        answer:
          "Van jou. Domein, code en beeldmateriaal zijn jouw eigendom. Je zit niet vast aan een abonnement en kunt er op elk moment mee naar iemand anders.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Een site nodig?",
    lead:
      "Vertel kort wat je van plan bent. Ik antwoord meestal binnen één werkdag.",
    name: "Naam",
    namePlaceholder: "Jouw naam",
    email: "E-mailadres",
    emailPlaceholder: "jij@bedrijf.nl",
    message: "Je plan",
    messagePlaceholder:
      "Wat voor site zoek je, voor wie, en wanneer wil je live?",
    submit: "Verstuur",
    sending: "Versturen…",
    success: "Verstuurd. Je hoort snel van me.",
    errors: {
      invalid: "Controleer je gegevens en probeer het opnieuw.",
      rate: "Je hebt net al een bericht gestuurd. Probeer het later nog eens.",
      server: "Versturen mislukte. Mail me gerust direct.",
    },
    directLabel: "Liever direct mailen?",
  },
  footer: {
    tagline: "Websites voor ondernemers. Gebouwd in Nederland.",
    rights: "Alle rechten voorbehouden.",
  },
  langSwitch: { label: "Taal", other: "English" },
}

export type Dict = typeof nl

const en: Dict = {
  meta: {
    title: "fynnworks — websites that sell",
    description:
      "I design and build fast, opinionated websites for small businesses. From landing page to full company site.",
  },
  nav: {
    work: "Work",
    services: "Services",
    process: "Process",
    faq: "FAQ",
    contact: "Contact",
    cta: "Start a project",
  },
  hero: {
    eyebrow: "Web design & development",
    title: "Websites that\nearn their keep.",
    lead:
      "Not the template everyone else already has. I design and build sites that load fast, rank well, and look like you care.",
    primary: "Start a project",
    secondary: "See the work",
  },
  services: {
    eyebrow: "Services",
    title: "What I build for you",
    items: [
      {
        name: "Landing page",
        price: "from €450",
        description:
          "One page doing one job: turning visitors into enquiries. Live within two weeks.",
        points: ["Custom design", "Contact form", "Findable on Google"],
      },
      {
        name: "Multi-page site",
        price: "from €1,200",
        description:
          "Multiple pages, a clear story, and a structure that lasts you years.",
        points: ["5–10 pages", "Copy guidance", "Editable by you"],
      },
      {
        name: "Custom build",
        price: "on request",
        description:
          "Web shop, booking system, portal with logins. Anything beyond a brochure.",
        points: ["Integrations & APIs", "Auth and roles", "Hosting & upkeep"],
      },
    ],
  },
  work: {
    eyebrow: "Work",
    title: "Recently shipped",
    lead: "A selection of recent projects.",
    visit: "Visit site",
  },
  process: {
    eyebrow: "Process",
    title: "How it goes",
    steps: [
      {
        name: "Call",
        description:
          "Half an hour on the phone. I want to know who your customers are and what the site has to do. Then you get a fixed price.",
      },
      {
        name: "Design",
        description:
          "You see a design of the key pages before a single line of code is written. Two rounds of feedback included.",
      },
      {
        name: "Build",
        description:
          "I build it, fill it with your words and images, and test it on phone, tablet and desktop.",
      },
      {
        name: "Launch",
        description:
          "I handle domain, hosting and email. After that you can take over, or leave the upkeep to me.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "What people usually ask",
    lead: "Question not covered? Ask it below.",
    items: [
      {
        question: "What is this going to cost?",
        answer:
          "Ballpark prices are under Services above. After the intro call you get a fixed price — no hourly billing, no surprises at the end.",
      },
      {
        question: "How long until the site is live?",
        answer:
          "A landing page within two weeks, a five to ten page site usually four to six. Mostly it depends on how quickly you get me your copy and images.",
      },
      {
        question: "Can I edit the text myself afterwards?",
        answer:
          "Yes. The site ships with a guide showing where every piece of text lives. Small changes you make yourself; if you would rather I did them, that works too.",
      },
      {
        question: "Do you handle domain, hosting and email?",
        answer:
          "Yes, that is part of it. I set it up, point your domain correctly and make sure your mail keeps working. The domain is registered in your name.",
      },
      {
        question: "I already have a site. Can it be fixed up?",
        answer:
          "Usually I would rather rebuild than patch an existing site: it is quicker to finish and the result lasts longer. Your copy, images and Google rankings come along.",
      },
      {
        question: "Who owns the site when we are done?",
        answer:
          "You do. Domain, code and imagery are yours. There is no subscription tying you in, and you can take all of it to someone else at any time.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Need a site?",
    lead: "Tell me briefly what you have in mind. I usually reply within a working day.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email address",
    emailPlaceholder: "you@company.com",
    message: "Your plan",
    messagePlaceholder:
      "What kind of site do you need, who is it for, and when do you want to launch?",
    submit: "Send",
    sending: "Sending…",
    success: "Sent. You'll hear from me soon.",
    errors: {
      invalid: "Check your details and try again.",
      rate: "You just sent a message. Please try again later.",
      server: "Sending failed. Feel free to email me directly.",
    },
    directLabel: "Rather email directly?",
  },
  footer: {
    tagline: "Websites for small businesses. Built in the Netherlands.",
    rights: "All rights reserved.",
  },
  langSwitch: { label: "Language", other: "Nederlands" },
}

export const dictionaries: Record<Lang, Dict> = { nl, en }

export function getDictionary(lang: Lang): Dict {
  return dictionaries[lang]
}
