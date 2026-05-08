import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  // Block crawlers on staging hosts to avoid duplicate-content / pre-launch
  // indexing. Override via NEXT_PUBLIC_ALLOW_INDEX=1 to allow indexing on the
  // current host (e.g. once we're ready to launch on .devalok.dev too).
  const allowOverride = process.env.NEXT_PUBLIC_ALLOW_INDEX === "1";
  const isStaging = /devalok\.dev|localhost|127\.0\.0\.1/.test(SITE_URL);
  if (isStaging && !allowOverride) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap: `${SITE_URL}/sitemap.xml`,
    };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
