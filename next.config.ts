import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Geen sharp-optimalisatie op de Pi: die CPU heeft wel wat beters te doen.
  // Afbeeldingen zelf al op maat aanleveren (max ~1600px breed).
  images: { unoptimized: true },
  // Alleen voor `next dev`: zonder dit weigert de dev-server /_next/static/*
  // aan elk ander origin dan localhost. Testen op je telefoon via het
  // LAN-adres levert dan een pagina zonder JavaScript op — de site rendert,
  // maar niets hydrateert. Raakt de productiebuild niet. Uit het env, want een
  // LAN-adres verschilt per netwerk en hoort niet in een publieke repo: zet
  // DEV_ORIGIN in .env.local. Leeg is prima zolang je op localhost werkt.
  allowedDevOrigins: process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : [],
  experimental: {
    // Een server action mag standaard 1 MB ontvangen; saveUpload() laat 3 MB
    // per bestand toe. De briefing stuurt er maximaal zes tegelijk, maar de
    // browser verkleint ze eerst tot een paar honderd kB (zie shrink() in
    // components/brief-form.tsx). 10 MB is ruim genoeg voor die zes plus de
    // marge van multipart, zonder dat de Pi tientallen MB's zit te bufferen.
    serverActions: { bodySizeLimit: "10mb" },
  },
  async redirects() {
    return [{ source: "/", destination: "/nl", permanent: false }]
  },
  // Demo's in public/demo/ zijn klantwerk en placeholders: wel te bezoeken met
  // de link, niet in Google. robots.txt vraagt het beleefd, deze header maakt
  // het hard — ook voor bots die al een directe link hebben.
  async headers() {
    return [
      {
        source: "/demo/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // De beheerpagina hoort nergens in een index thuis.
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Briefinglinks zijn persoonlijk en staan nergens op de site. Er linkt
      // niets naartoe, maar een klant die de link doorstuurt of in een balk
      // plakt die "suggesties verbetert" kan hem alsnog ergens laten belanden.
      {
        source: "/:lang/briefing/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ]
  },
}

export default nextConfig
