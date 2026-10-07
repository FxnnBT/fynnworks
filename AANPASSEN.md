# Wat jij nog moet aanpassen

Alles wat op de site staat komt uit vijf bestanden. Je hoeft nergens
componenten open te maken om tekst, prijzen of projecten te wijzigen.

| Bestand | Waarvoor |
|---|---|
| `content/dictionaries.ts` | **Alle teksten** van de homepage, Nederlands en Engels |
| `content/pages.ts` | Teksten van de losse pagina's (prijzen, portfolio, over mij, de dienstpagina's), plus hun titel en omschrijving in Google |
| `content/projects.ts` | Startlijst portfolio-items — daarna beheer je ze op `/admin` |
| `lib/site.ts` | Naam, domein, zichtbaar e-mailadres |
| `.env.local` | SMTP-gegevens (niet in git) |

> **Let op:** teksten staan twee keer in `dictionaries.ts` — één keer in het
> `nl`-blok en één keer in het `en`-blok. Vergeet je er één, dan geeft
> TypeScript een foutmelding bij `npm run build`. Dat is expres.

---

## 1. Eerst dit (anders werkt de site niet echt)

- [ ] **`lib/site.ts`** — `url` staat op `https://fynnworks.nl` (je canonical
      domein, `.com` stuurt daarheen door — zie README). `email` staat nog op
      `hallo@fynnworks.nl`; zet daar je echte mailbox neer.
- [ ] **`.env.local` aanmaken** — kopieer `.env.example` en vul je SMTP-gegevens
      in. Zonder dit komt er geen mail aan. Zet er meteen een
      `ADMIN_PASSWORD` in: daarmee kom je op `/admin`.
- [ ] **De twee projecten** — Marcel Hensema en Beldi Amsterdam staan erin met
      echte teksten. Controleer het **jaartal** bij Marcel Hensema (staat nu op
      2025) en de omschrijvingen: die heb ik van de sites afgelezen, jij weet
      beter wat je er precies voor ze gedaan hebt. Wijzigen doe je door hem op
      `/admin` weg te halen en opnieuw toe te voegen.
- [ ] **`public/work/*.jpg`** — de twee screenshots heb ik uit het browservenster
      gemaakt. Bruikbaar, maar eigen beelden zijn beter (zie punt 3).
- [ ] **`content/dictionaries.ts` → `faq.items`** — de zes vragen en antwoorden
      zijn door mij geschreven op basis van wat er verder op de site staat. Lees
      ze één keer door: de doorlooptijden, wie domein en hosting regelt en wat
      er over eigendom staat moeten kloppen met hoe jij het echt doet.
Het favicon staat al goed: `app/icon.png` (512×512, browsertabblad) en
`app/apple-icon.png` (180×180, snelkoppeling op iOS-beginscherm), gemaakt van je
logo. Wil je later een ander logo: vervang die twee bestanden, verder niets —
Next zet de `<link>`-tags zelf in de `<head>`.

---

## 2. Teksten wijzigen — waar staat wat

Open `content/dictionaries.ts`. Onderstaande sleutels zitten allemaal in het
`nl`-blok bovenaan; scroll naar beneden voor dezelfde sleutels in het `en`-blok.

### Bovenbalk

| Wat je ziet | Sleutel |
|---|---|
| Menu-items "Werk / Prijzen / Werkwijze / Vragen" | `nav.work`, `nav.pricing`, `nav.process`, `nav.faq` |
| Gele knop rechtsboven | `nav.cta` |

De naam **fynnworks** linksboven komt uit `lib/site.ts` (`SITE.name`).

### Hero (het eerste scherm)

| Wat je ziet | Sleutel |
|---|---|
| Kleine tekst boven de kop | `hero.eyebrow` |
| Grote kop | `hero.title` |
| Alinea eronder | `hero.lead` |
| Gele knop | `hero.primary` |
| Knop met randje | `hero.secondary` |

De regelafbreking in de grote kop maak je met `\n`:

```ts
title: "Websites die\nwerk opleveren.",
```

### Werk

| Wat je ziet | Sleutel |
|---|---|
| "WERK" boven de kop | `work.eyebrow` |
| Kop "Eerder gemaakt" | `work.title` |
| Zinnetje rechts ernaast | `work.lead` |
| Link "Bekijk site" op elke kaart | `work.visit` |

De kaarten zelf beheer je op `/admin` — zie punt 3.

### Diensten

Kop en tussenkop: `services.eyebrow`, `services.title`.
Daaronder `services.items` — een lijst van drie. Per dienst:

| Veld | Wat het is |
|---|---|
| `name` | Naam van de dienst |
| `price` | De gele prijs eronder, bv. `"vanaf €550"` |
| `description` | De alinea in het midden |
| `points` | Het lijstje met vinkjes rechts |

Een dienst toevoegen of weghalen mag: het blok telt zelf door (01, 02, 03…).
Doe je dat, doe het dan in **beide** talen — de lijsten moeten even lang zijn.

### Werkwijze

Kop: `process.eyebrow`, `process.title`.
`process.steps` is een lijst van vier stappen met `name` en `description`.
De nummers 01–04 worden automatisch gezet.

### Vragen

Kop en tussenkop: `faq.eyebrow`, `faq.title`, `faq.lead`.
`faq.items` is een lijst met per vraag een `question` en een `answer`. De
nummers 01, 02, 03… worden automatisch gezet, dus vragen toevoegen, weghalen of
omwisselen mag — in **beide** talen, de lijsten moeten even lang zijn.

Twee dingen bewust zo gelaten:

- **Geen prijzen in de antwoorden.** Het antwoord op "Wat gaat dit kosten?"
  verwijst naar Diensten in plaats van bedragen te herhalen. Anders moet je bij
  elke prijswijziging op twee plekken zijn en vergeet je er één.
- **Openklappen zonder JavaScript.** De vragen gebruiken het `<details>`-element
  van de browser zelf. Eén vraag tegelijk open is standaardgedrag; toetsenbord
  en schermlezer werken vanzelf. In oude browsers kunnen meerdere vragen
  tegelijk openstaan — verder verandert er niets.

### Contact

| Wat je ziet | Sleutel |
|---|---|
| Kop "Een site nodig?" | `contact.title` |
| Alinea eronder | `contact.lead` |
| "Liever direct mailen?" | `contact.directLabel` |
| Labels boven de velden | `contact.name`, `contact.email`, `contact.message` |
| Grijze voorbeeldtekst ín de velden | `contact.namePlaceholder`, `contact.emailPlaceholder`, `contact.messagePlaceholder` |
| Verzendknop | `contact.submit` (en `contact.sending` tijdens versturen) |
| Groene bevestiging na versturen | `contact.success` |
| Foutmeldingen | `contact.errors.invalid` / `.rate` / `.server` |

Het e-mailadres onder "Liever direct mailen?" komt uit `lib/site.ts`.

### Voettekst

`footer.tagline` en `footer.rights`. Het jaartal wordt automatisch gezet.

### Tabblad-titel en Google-omschrijving

`meta.title` en `meta.description`. Dit is wat er in het browsertabblad staat
en wat Google onder je zoekresultaat toont. Houd de omschrijving onder ~155
tekens.

---

## 3. Je eigen projecten erin zetten

**Het makkelijkste gaat dit via `/admin`.** Log in met je `ADMIN_PASSWORD`,
vul het formulier onderaan in en upload de screenshot — geen code, geen
opnieuw uitrollen. Daar haal je projecten ook weer weg.

`content/projects.ts` hieronder is alleen nog de **startlijst**: die wordt de
allereerste keer dat de site draait naar de opslag geschreven, en daarna kijkt
de site er niet meer naar. Wijzig je hem later alsnog, dan verandert er niets
op de site — gebruik `/admin`.

Voor de volledigheid, zo ziet een project eruit:

```ts
{
  slug: "korte-naam-zonder-spaties",   // alleen intern, moet uniek zijn
  client: "Naam van de klant",         // klein bovenaan de kaart
  year: "2025",                        // rechtsboven op de kaart
  title: {
    nl: "Wat je voor ze gemaakt hebt",
    en: "Same in English",
  },
  summary: {
    nl: "Eén of twee zinnen: wat was het probleem, wat leverde het op.",
    en: "Same in English.",
  },
  tags: ["Webshop", "Next.js"],        // de pilletjes onderaan
  href: "https://klant.nl",            // weglaten = geen 'Bekijk site'-link
  image: "/work/klantnaam.jpg",
  featured: true,                      // true = brede kaart over twee kolommen
  status: {                            // optioneel labeltje op de kaart
    nl: "In aanbouw",
    en: "In progress",
  },
}
```

Een paar dingen om te weten:

- **Afbeeldingen:** zet je screenshots in `public/work/` en verwijs ernaar als
  `/work/klantnaam.jpg`. Lever ze aan op **max ~1600px breed** — de
  beeldoptimalisatie staat uit zodat de Pi er geen rekenkracht aan kwijt is,
  dus wat jij erin zet is wat de bezoeker downloadt.
- **`featured`:** houd het bij één of twee, anders valt het niet meer op. Een
  brede kaart is 21:9, een gewone 4:3. Blijft er één smalle kaart alleen op een
  rij over, dan wordt die automatisch ook breed — je krijgt dus nooit een half
  leeg vak, hoeveel projecten je er ook in zet.
- **`status`:** optioneel. Zet er een labeltje mee op de kaart, bijvoorbeeld
  voor werk dat nog loopt. Laat het weg zodra de site echt live is.
- **`href` weglaten** mag — de kaart wordt dan gewoon niet klikbaar. Handig
  voor werk dat offline is of onder NDA valt.
- Aantal projecten is vrij: haal er weg of voeg toe, de grid vult zichzelf.
- **Uploads via `/admin`** komen niet in `public/work/` maar in
  `/var/lib/fynnworks/uploads/` op de Pi, met een `/uploads/…`-adres. Dat moet:
  Next leest `public/` alleen bij het opstarten in, dus een verse upload zou
  daar 404 geven tot je de service herstart.

De beelden staan bewust in zwart-wit en kleuren in als je eroverheen gaat. Dat
zit in `components/work.tsx` (`grayscale` / `group-hover:grayscale-0`) als je
het anders wilt. Op telefoon en tablet staan ze meteen in kleur — daar is geen
muis om eroverheen te gaan, dus grijs zou grijs blijven.

---

## 4. Uiterlijk aanpassen

Zit allemaal onderin `app/globals.css`, in het blok
`/* --- fynnworks: dark editorial --- */`:

| Variabele | Wat het doet |
|---|---|
| `--warm` | De gele accentkleur (knoppen, prijzen, streepjes) |
| `--warm-foreground` | Tekstkleur óp die gele knoppen |
| `--line` | De hele dunne scheidingslijntjes |
| `--text-display` | Grootte van de hero-kop |
| `--text-section` | Grootte van de sectiekoppen |
| `--space-section` | Witruimte tussen secties |

De lettertypes staan in `app/[lang]/layout.tsx`: Instrument Serif voor de koppen,
Geist voor de lopende tekst. Wil je andere, vervang de imports van
`next/font/google` — de rest gaat automatisch mee.

De site is bewust alleen donker. Een lichte variant zou een tweede ontwerp zijn,
geen schakelaartje.

---

## 5. Voordat je live gaat

- [ ] Formulier één keer echt versturen en controleren of de mail aankomt op
      `CONTACT_TO`, en of "beantwoorden" naar de afzender gaat.
- [ ] Site bekijken op je telefoon (of Chrome device-mode op 390px breed). Dit
      is het enige dat ik niet heb kunnen controleren.
- [ ] `npm run build` moet schoon door.
- [ ] Op de Pi: zie `README.md` voor de service, Caddy, DNS en poort-forwarding.

## 6. Waar je beter vanaf kunt blijven

Niet omdat het heilig is, maar omdat het meer kapot maakt dan het oplevert:

- `components/ui/waves-background-2.tsx` — de shader. Aanpassen kan, maar de
  waardes bovenin (`UNIFORMS`) zijn met een visuele editor gegenereerd; met de
  hand draaien geeft snel modder.
- `lib/contact.ts` — de validatie en de rate limit. Zet je de limiet uit, dan
  ligt je mailbox binnen een week vol spam.
