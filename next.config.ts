import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-brand"],
  // Sankhya reverse-proxy: serve analytics ingestion first-party via /ingest so
  // adblockers that block third-party analytics don't drop our cookieless
  // product events. sankhya.ts beacons to "/ingest/collect", which maps to the
  // collector's /api/collect. The client IP (used only for the daily,
  // never-stored visitor hash) is carried through in x-forwarded-for.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const host =
      process.env.SANKHYA_HOST || "https://sankhya-production.up.railway.app";
    return [
      {
        source: "/ingest/:path*",
        destination: `${host}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
