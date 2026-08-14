import type { MetadataRoute } from "next";
import { formGuides } from "@/lib/form-guides";
import { compressPresets } from "@/lib/presets/compress-sizes";
import { documentPresets } from "@/lib/presets/documents";
import { examPresets } from "@/lib/presets/exams";
import { SITE_URL } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${SITE_URL}${path}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/tools"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/pricing"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: url("/for-operators"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/for-professionals"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/for-coaching"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/b2b"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/refer"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
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
    "/pdf-compress",
    "/pdf-merge-split",
    "/print-job-slip",
    "/quick-send",
    "/image-format-convert",
    "/qr-generate",
    "/qr-scan",
    "/image-to-text",
    "/heic-to-jpg",
    "/photo-grayscale",
    "/aadhaar-collage",
    "/pdf-to-jpg",
    "/pdf-rotate",
    "/signature-maker",
    "/image-crop",
    "/image-rotate",
    "/bg-remove",
    "/batch-compress",
    "/aadhaar-mask",
    "/pdf-password",
    "/pdf-page-manager",
    "/pdf-page-numbers",
    "/pdf-watermark",
    "/pdf-redact",
    "/pdf-sign",
    "/pdf-unlock",
    "/pdf-crop",
    "/pdf-flatten",
    "/pdf-ocr",
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

  const formGuideIndex: MetadataRoute.Sitemap = [
    {
      url: url("/form-guides"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const formGuidePages: MetadataRoute.Sitemap = formGuides.map((g) => ({
    url: url(`/form-guides/${g.slug}`),
    lastModified: new Date(g.lastUpdatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...hubs,
    ...examPages,
    ...compressPages,
    ...documentPages,
    ...formGuideIndex,
    ...formGuidePages,
  ];
}
