import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Geen sharp-optimalisatie op de Pi: die CPU heeft wel wat beters te doen.
  // Afbeeldingen zelf al op maat aanleveren (max ~1600px breed).
  images: { unoptimized: true },
  // Alleen voor `next dev`: zonder dit weigert de dev-server /_next/static/*
  // aan elk ander origin dan localhost. Testen op je telefoon via het
  // LAN-adres levert dan een pagina zonder JavaScript op — de site rendert,
  // maar niets hydrateert. Raakt de productiebuild niet.
  allowedDevOrigins: ["<dev-host>"],
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
    ]
  },
}

export default nextConfig
