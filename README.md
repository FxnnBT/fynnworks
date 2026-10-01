# fynnworks

Portfolio- en verkoopsite. Next.js 16 (App Router) + Tailwind v4 + shadcn/ui,
NL/EN, contactformulier via SMTP. Draait als één systemd-service op een Raspberry Pi.

## Lokaal draaien

```bash
npm install
cp .env.example .env.local   # SMTP-gegevens en ADMIN_PASSWORD invullen
npm run dev                  # http://localhost:3000 → /nl
npm test                     # validatie + rate limit
```

Zelf teksten, prijzen of projecten wijzigen: zie **[AANPASSEN.md](AANPASSEN.md)**.

## Wat waar staat

| Pad | Inhoud |
|---|---|
| `content/dictionaries.ts` | Alle teksten, NL en EN naast elkaar |
| `content/projects.ts` | Startlijst portfolio-items; daarna beheer je ze op `/admin` |
| `lib/store.ts` | Schrijfbare opslag: projecten, reviews, uploads |
| `app/admin/` | Beheerpagina: werk toevoegen, reviews goedkeuren |
| `lib/site.ts` | Naam, domein, zichtbaar e-mailadres |
| `app/actions.ts` | Server Action die de mail verstuurt |
| `lib/contact.ts` | Validatie + rate limit |
| `components/ui/waves-background-2.tsx` | WebGL shader-hero |

Nieuwe shadcn-componenten toevoegen: `npx shadcn@latest add <naam>` — die komen
in `components/ui/`, waar de rest ook staat.

## Beheerpagina

`https://fynnworks.nl/admin` — één wachtwoordveld, `ADMIN_PASSWORD` uit
`/etc/fynnworks.env`. Het cookie blijft 30 dagen geldig; wachtwoord wijzigen
maakt elk uitstaand cookie meteen ongeldig. Vijf mislukte pogingen per uur per
IP, daarna een uur op slot. De pagina staat op `noindex` en in `robots.txt`.

Daar doe je twee dingen:

- **Werk toevoegen of weghalen.** Screenshot uploaden mag rechtstreeks; lever
  hem aan op max ~1600px breed en onder 3 MB, want de beeldoptimalisatie staat
  uit (de Pi schaalt niets). Uploads komen in `/var/lib/fynnworks/uploads/` en
  worden uitgeserveerd door `app/uploads/[file]/route.ts` — niet uit `public/`,
  want dat leest Next alleen bij het opstarten in.
- **Reviews goedkeuren.** Bezoekers laten er een achter onderaan de
  werksectie. Niets komt op de site voordat jij op goedkeuren drukt. Reviews
  die op de spamheuristiek aanslaan krijgen een `spam?`-markering, maar worden
  nooit geweigerd — precies zoals het contactformulier `[spam?]` in het
  onderwerp zet.

### Waar die gegevens staan

`/var/lib/fynnworks/` — `projects.json`, `reviews.json` en `uploads/`. systemd
maakt en beheert die map (`StateDirectory=fynnworks` in
`deploy/fynnworks.service`); zonder die regel is er niets schrijfbaar, want de
unit draait met `ProtectSystem=strict`. Lokaal is het `./data/`, gitignored.

De eerste keer dat de site draait wordt `content/projects.ts` naar
`projects.json` geschreven. Daarna is dat bestand de bron: wijzigingen in de
code veranderen niets meer aan wat er op de site staat.

> **Back-up is handwerk.** Die map ligt buiten `/srv/fynnworks`, dus de
> tar-overdracht en een rebuild raken hem niet — maar hij gaat ook nooit mee
> naar je pc. Zet je de Pi opnieuw op, dan ben je de reviews kwijt:
> `scp -r <gebruiker>@<pi-host>:/var/lib/fynnworks ./backup` zo nu en dan.

## Uitrollen op de Pi

### Bestanden naar de Pi

Niet via git: dat kost je een access token op de Pi, en je zou eerst moeten
committen voordat je iets kunt uitproberen. Kopieer direct over SSH — zet
`<pi-host>` in je `~/.ssh/config`, dan hoef je adres en gebruiker hieronder
nergens in te typen:

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

Dezelfde variabelen als `.env.example`, met echte waarden. De inhoud van
`/etc/fynnworks.env`:

```
SMTP_HOST=smtp.hostnet.nl
SMTP_PORT=587
SMTP_USER=info@fynnworks.nl
SMTP_PASS=<wachtwoord van de mailbox>
CONTACT_TO=info@fynnworks.nl
ADMIN_PASSWORD=<wachtwoord voor /admin>
```

`DEV_ORIGIN` hoort daar niet in: die is alleen voor `next dev` op je eigen pc
(zie `.env.example`).

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

## Demo's

Losse statische proefsites staan op `fynnworks.nl/demo/<naam>/index.html`. Ze
liggen in `public/demo/` en worden door de Next-app zelf uitgeserveerd — geen
aparte webserver, geen build.

```bash
# per demo, vanaf je pc
scp -r ./mijn-poc <gebruiker>@<pi-host>:/srv/fynnworks/public/demo/naam
ssh <gebruiker>@<pi-host> "sudo systemctl restart fynnworks"
# → https://fynnworks.nl/demo/naam/index.html

# weghalen
ssh <gebruiker>@<pi-host> "rm -rf /srv/fynnworks/public/demo/naam && sudo systemctl restart fynnworks"
```

Die herstart is nodig: Next leest `public/` bij het opstarten in, dus zonder
herstart geeft een verse demo 404.

Waar het op stukloopt:

- **`/index.html` hoort in de URL.** Next doet niet aan mapindexen: `/demo/naam/`
  wordt doorgestuurd naar `/demo/naam` en dat is een 404. Binnen de demo werken
  relatieve links (`menu.html`) daarna gewoon.
- Er moet dus een **`index.html`** in de wortel van de map staan.
- Verwijs naar assets met **relatieve** paden (`./stijl.css`), niet met
  `/stijl.css` — dat laatste zoekt vanaf de domeinwortel en belandt op de
  hoofdsite in plaats van in je demo.

Demo's blijven uit Google: `app/robots.ts` verbiedt `/demo/` en
`next.config.ts` zet er een `X-Robots-Tag: noindex` op. Ze zijn wel gewoon te
bezoeken door wie de link heeft; er zit geen wachtwoord op.

**Ze staan niet in git.** De overdracht met `tar` hieronder pakt alleen wat git
kent, dus je demo's gaan nooit mee — ze blijven wel staan op de Pi, want die
`tar -x` overschrijft alleen en verwijdert niets. Zet je de Pi opnieuw op, dan
ben je ze kwijt; bewaar het origineel dus op je pc.

## Bezoekersstatistieken

[GoatCounter](https://www.goatcounter.com) draait als eigen service op de Pi
(`deploy/goatcounter.service`), met SQLite in `/var/lib/goatcounter`, op poort
8081. Bezoekers bereiken hem via `fynnworks.nl/count` en `/count.js`, die
`next.config.ts` doorzet naar `127.0.0.1:8081`. Er is dus geen subdomein,
DNS-record of doorgestuurde poort. Het script staat in
`components/goatcounter.tsx`, alleen op de homepage en de juridische pagina's
(niet op `/briefing/<token>`). Wat er wel en niet wordt bewaard staat in
artikel 6 van de privacyverklaring.

Het dashboard staat thuis op `http://<pi-lan-ip>:8081`. Van buiten kan dat
niet, ook niet als iemand poort 8081 op de router doorstuurt:
`IPAddressAllow` in de unit laat alleen localhost en private adressen toe.
Onderweg kan het wel via een tunnel, daarna op `http://localhost:8081`:

```bash
ssh -N -L 8081:127.0.0.1:8081 <gebruiker>@<pi-host>
```

Eenmalig opgezet met:

```bash
# op de Pi; binary van github.com/arp242/goatcounter/releases (linux-arm64)
sudo install -m 755 goatcounter /usr/local/bin/goatcounter
sudo useradd --system --no-create-home --shell /usr/sbin/nologin goatcounter
sudo install -d -o goatcounter -g goatcounter -m 750 /var/lib/goatcounter
cd /tmp && sudo -u goatcounter goatcounter db create site -createdb \
  -db sqlite+/var/lib/goatcounter/db.sqlite3 -vhost fynnworks.nl -user.email <mail>
sudo cp deploy/goatcounter.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now goatcounter
```

Je eigen bezoeken tellen niet meer mee nadat je één keer
`https://fynnworks.nl/nl#toggle-goatcounter` hebt geopend. Dat zet een vlag in
de localStorage van die browser.

### Melding bij een bezoek

`deploy/visit-notify.sh` kijkt elke minuut of de totalen per pagina in
GoatCounter zijn gestegen en post dan iets als `2× /nl` in een Discord-kanaal.
Het draait als goatcounter (alleen-lezen op de database), maar in een eigen
service, zodat GoatCounter zelf nog steeds niet naar buiten kan. Het
webhook-adres staat alleen op de Pi. De eerste melding bevat alle bezoeken tot
dan toe.

```bash
# Discord: kanaal → Instellingen → Integraties → Webhooks → URL kopiëren
# op de Pi, na de overdracht
sudo install -m 755 /srv/fynnworks/deploy/visit-notify.sh /usr/local/bin/visit-notify
sudo install -m 600 /dev/null /etc/visit-notify.env
sudoedit /etc/visit-notify.env   # één regel: DISCORD_WEBHOOK=<webhook-url>
sudo cp /srv/fynnworks/deploy/visit-notify.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now visit-notify
```

## Domeinen

`fynnworks.nl` is de canonical host. `www.fynnworks.nl`, `fynnworks.com` en
`www.fynnworks.com` sturen permanent (301) door naar `fynnworks.nl`.

DNS en TLS lopen via Cloudflare, niet vanaf deze Pi. Het verkeer komt van
Cloudflare rechtstreeks binnen op **poort 3500**, waar de Next-service
luistert. Cloudflare regelt daarmee ook het certificaat.

Gevolg: **`deploy/Caddyfile` is op dit moment niet in gebruik.** Caddy staat wel
geïnstalleerd en luistert op 80 en 443, maar daar komt niemand — een
certificaataanvraag mislukt dan ook (`journalctl -u caddy` toont 522's). Wil je Caddy alsnog gebruiken, bijvoorbeeld voor nettere demo-URL's of
extra headers, dan moet het inkomende verkeer bij Cloudflare naar **poort 80**
wijzen in plaats van 3500. Anders kun je Caddy net zo goed uitzetten
(`sudo systemctl disable --now caddy`).

- **Vast IP** — heb je een wisselend IP van je verbinding, dan heb je
  dynamische DNS nodig, anders is de site na een IP-wissel onbereikbaar.

Wissel je van hoofddomein, pas dan `url` in `lib/site.ts` aan — daar komen de
canonical-tags, `sitemap.xml` en `robots.txt` uit. Zet je Caddy ooit alsnog in
het pad, dan moet het eerste blok in `deploy/Caddyfile` hetzelfde domein noemen.

Heeft de Pi te weinig geheugen om te builden? Zet er swap bij
(`sudo dphys-swapfile swapoff && sudo nano /etc/dphys-swapfile && sudo dphys-swapfile setup && sudo dphys-swapfile swapon`).
Bouwen op je pc en de output kopiëren is geen optie: dat is x86 → ARM en de
getracede `node_modules` kunnen platformspecifieke binaries bevatten.
