import type { MetadataRoute } from "next";
import { compressPresets } from "@/lib/presets/compress-sizes";
import { documentPresets } from "@/lib/presets/documents";
import { examPresets } from "@/lib/presets/exams";
import { SITE_URL } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${SITE_URL}${path}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: url("/privacy"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: url("/terms"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const hubs: MetadataRoute.Sitemap = [
    "/photo-resize",
    "/image-compress",
    "/image-compress/custom",
    "/document-photo",
    "/photo-signature-joiner",
    "/print-sheet",
    "/jpg-to-pdf",
  ].map((p) => ({
    url: url(p),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const examPages: MetadataRoute.Sitemap = examPresets.map((p) => ({
    url: url(`/photo-resize/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const compressPages: MetadataRoute.Sitemap = compressPresets.map((p) => ({
    url: url(`/image-compress/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const documentPages: MetadataRoute.Sitemap = documentPresets.map((p) => ({
    url: url(`/document-photo/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...hubs, ...examPages, ...compressPages, ...documentPages];
}
