import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  // Block crawlers on staging hosts to avoid duplicate-content / pre-launch
  // indexing. The production canonical (`bharattools.app`) lets everything through.
  const isStaging = /devalok\.dev|localhost|127\.0\.0\.1/.test(SITE_URL);
  if (isStaging) {
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
