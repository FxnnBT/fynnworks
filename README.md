# fynnworks

Portfolio- en verkoopsite. Next.js 16 (App Router) + Tailwind v4 + shadcn/ui,
NL/EN, contactformulier via SMTP. Draait als één systemd-service op een Raspberry Pi.

## Lokaal draaien

```bash
npm install
cp .env.example .env.local   # SMTP-gegevens invullen
npm run dev                  # http://localhost:3000 → /nl
npm test                     # validatie + rate limit
```

Zelf teksten, prijzen of projecten wijzigen: zie **[AANPASSEN.md](AANPASSEN.md)**.

## Wat waar staat

| Pad | Inhoud |
|---|---|
| `content/dictionaries.ts` | Alle teksten, NL en EN naast elkaar |
| `content/projects.ts` | Je portfolio-items (nu placeholders) |
| `lib/site.ts` | Naam, domein, zichtbaar e-mailadres |
| `app/actions.ts` | Server Action die de mail verstuurt |
| `lib/contact.ts` | Validatie + rate limit |
| `components/ui/waves-background-2.tsx` | WebGL shader-hero |

Nieuwe shadcn-componenten toevoegen: `npx shadcn@latest add <naam>` — die komen
in `components/ui/`, waar de rest ook staat.

## Eigen projecten invullen

Zet screenshots in `public/work/` en verwijs ernaar vanuit `content/projects.ts`
(`image: "/work/klantnaam.jpg"`). Lever ze aan op max ~1600px breed: de
Next-beeldoptimalisatie staat uit, zodat de Pi geen CPU aan schalen kwijt is.

## Uitrollen op de Pi

### Bestanden naar de Pi

Niet via git — de repo is privé en GitHub accepteert sinds 2021 geen wachtwoord
meer voor git-operaties, dus dat kost je een access token op de Pi. Kopieer
direct over SSH:

```bash
# op de Pi, eenmalig
sudo mkdir -p /srv/fynnworks && sudo chown <gebruiker>:<gebruiker> /srv/fynnworks

# op je pc, in de projectmap — ook voor elke latere update
git ls-files -z --cached --others --exclude-standard | tar --null -T - -czf - \
  | ssh <gebruiker>@<pi-host> "tar -xzf - -C /srv/fynnworks"
```

`git ls-files` als bron betekent dat `.gitignore` het filteren doet: geen
`node_modules`, geen `.next`, geen `.git`, en vooral geen `.env.local` met je
SMTP-wachtwoord erin. Er is dus geen exclude-lijst die kan verouderen. Het pakt
je werkmap zoals hij is, dus je hoeft niet eerst te committen — ~550 KB.

`--others --exclude-standard` zorgt dat nieuwe, nog niet gecommitte bestanden
óók meegaan (bijvoorbeeld een verificatiebestand in `public/`). Zonder die twee
vlaggen ziet `git ls-files` alleen wat al in git zit en verdwijnt zo'n bestand
stilzwijgend uit de overdracht. `.gitignore` blijft gerespecteerd.

De map moet van dezelfde gebruiker zijn als `User=` in
`deploy/fynnworks.service` (nu `pi`), anders kan de service straks niet in
`.next` schrijven. `ReadWritePaths` geeft padrechten, geen eigendom.

### Installeren

```bash
# op de Pi
cd /srv/fynnworks
npm ci && npm run build

sudo install -m 600 /dev/null /etc/fynnworks.env
sudo nano /etc/fynnworks.env
sudo cp deploy/fynnworks.service /etc/systemd/system/
sudo systemctl enable --now fynnworks
curl -I localhost:3500/nl            # hoort 200 te geven
```

`.env.example` staat niet in git (`.gitignore` negeert `.env*`), dus de inhoud
van `/etc/fynnworks.env` staat hier:

```
SMTP_HOST=smtp.hostnet.nl
SMTP_PORT=587
SMTP_USER=info@fynnworks.nl
SMTP_PASS=<wachtwoord van de mailbox>
CONTACT_TO=info@fynnworks.nl
```

`mailout.hostnet.nl` werkt niet van buiten Hostnets netwerk — die timet out op
25, 465 en 587. Gebruik `smtp.hostnet.nl`.

De service luistert op **poort 3500** (`deploy/fynnworks.service`); Caddy proxyt
daarnaartoe en regelt TLS (`deploy/Caddyfile`). Wijzig je de poort, pas dan
beide bestanden aan.

### Bijwerken

```bash
# op je pc
git ls-files -z --cached --others --exclude-standard | tar --null -T - -czf - \
  | ssh <gebruiker>@<pi-host> "tar -xzf - -C /srv/fynnworks"

# op de Pi
sudo systemctl stop fynnworks        # ProtectSystem=strict: alleen .next is schrijfbaar
cd /srv/fynnworks && npm run build
sudo systemctl start fynnworks
```

Alleen `deploy/fynnworks.service` gewijzigd? Dan hoeft er niet gebouwd te
worden: `sudo cp deploy/fynnworks.service /etc/systemd/system/ && sudo systemctl
daemon-reload && sudo systemctl restart fynnworks`.

Nieuwe of gewijzigde dependencies (`package.json`)? Dan `npm ci` vóór de build.

## Domeinen

`fynnworks.nl` is de canonical host. `www.fynnworks.nl`, `fynnworks.com` en
`www.fynnworks.com` sturen permanent (301) door naar `fynnworks.nl`. Caddy
vraagt voor alle vier zelf een certificaat aan.

Buiten de code te regelen:

- **DNS** — vier records naar je IP van je verbinding: `fynnworks.nl` en `fynnworks.com` als
  A-record, beide `www`-varianten als CNAME naar hun kale domein.
- **Router** — poorten 80 en 443 forwarden naar de Pi. Poort 80 moet open blijven,
  anders kan Caddy het certificaat niet vernieuwen.
- **Vast IP** — heb je een wisselend IP van je verbinding, dan heb je dynamische DNS nodig,
  anders is de site na een IP-wissel onbereikbaar.

Wissel je van hoofddomein, pas dan **beide** aan: het eerste blok in
`deploy/Caddyfile` én `url` in `lib/site.ts`.

Heeft de Pi te weinig geheugen om te builden? Zet er swap bij
(`sudo dphys-swapfile swapoff && sudo nano /etc/dphys-swapfile && sudo dphys-swapfile setup && sudo dphys-swapfile swapon`).
Bouwen op je pc en de output kopiëren is geen optie: dat is x86 → ARM en de
getracede `node_modules` kunnen platformspecifieke binaries bevatten.
