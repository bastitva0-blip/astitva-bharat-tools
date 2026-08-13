import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { BgRemoveForm } from "./bg-remove-form";

export const metadata: Metadata = {
  title: "Background Remover — AI, In-Browser, Free",
  description:
    "Remove the background from any photo in seconds — AI-powered, runs entirely in your browser. Download as transparent PNG or white-background JPG. No upload, no signup.",
  alternates: { canonical: "/bg-remove" },
  keywords: [
    "background remover", "remove background from photo", "remove bg online free",
    "transparent background png", "white background photo", "ai background removal",
    "exam photo white background", "passport photo background remover",
  ],
};

export default async function BgRemovePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: dict.common.home, href: "/" },
            { label: "Background Remover" },
          ]),
          toolPageSchema({
            name: "Background Remover",
            description:
              "Remove the background from any photo. AI-powered, runs in your browser. Download as PNG with transparent background or JPG with white/custom background.",
            path: "/bg-remove",
            breadcrumbs: [
              { label: "Home", href: "/" },
              { label: "Background Remover" },
            ],
            steps: [
              { name: "Upload photo", text: "Drop a JPG, PNG, WebP or HEIC image." },
              { name: "Choose background", text: "Pick transparent, white, grey, or light blue." },
              { name: "Remove & download", text: "AI cuts the subject out. Download your PNG or JPG." },
            ],
          }),
        ]}
      />

      <PageHeader
        title="Background Remover"
        subtitle="AI removes the background from your photo — runs entirely in your browser. Pick transparent (PNG) or replace with white for exam portals. Nothing is uploaded."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Background Remover" },
        ]}
      />

      <p className="mt-2 text-body-xs text-surface-fg-muted">
        First run downloads a ~5 MB AI model — subsequent removals are instant.
      </p>

      <div className="mt-8">
        <BgRemoveForm />
      </div>
    </main>
  );
}
