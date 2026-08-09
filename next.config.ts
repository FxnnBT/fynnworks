import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Draait straks als één systemd-service op de Pi; standalone maakt het
  // mogelijk om op een snellere machine te builden en alleen de output te
  // kopiëren als de Pi te weinig geheugen heeft.
  output: "standalone",
  // Geen sharp-optimalisatie op de Pi: die CPU heeft wel wat beters te doen.
  // Afbeeldingen zelf al op maat aanleveren (max ~1600px breed).
  images: { unoptimized: true },
  async redirects() {
    return [{ source: "/", destination: "/nl", permanent: false }]
  },
}

export default nextConfig
