import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-brand"],
  // PostHog reverse-proxy (EU): serve analytics ingestion first-party via
  // /ingest so adblockers that block posthog.com don't drop our cookieless
  // product events. posthog.ts points api_host at "/ingest".
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
