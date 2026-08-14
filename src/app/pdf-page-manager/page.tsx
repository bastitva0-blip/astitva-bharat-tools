import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfPageManagerForm } from "./pdf-page-manager-form";

const PAGE_TITLE = "PDF Page Manager — Reorder & Delete PDF Pages";
const PAGE_DESCRIPTION =
  "Rearrange or remove pages from any PDF right in your browser. No upload, no account — everything runs on your device.";
const PAGE_KEYWORDS = [
  "PDF page manager",
  "reorder PDF pages",
  "delete PDF pages online",
  "rearrange PDF pages",
  "PDF organizer in browser",
  "remove pages from PDF",
  "PDF page order tool",
  "BharatTools PDF manager",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-page-manager",
    languages: {
      "en-IN": "/pdf-page-manager",
      "hi-IN": "/pdf-page-manager",
      "x-default": "/pdf-page-manager",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-page-manager",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default async function PdfPageManagerPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Page Manager",
          description:
            "Reorder or delete pages in any PDF entirely in your browser. No file is ever uploaded — all processing happens on your device. Free, no signup required.",
          path: "/pdf-page-manager",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Page Manager" }],
          steps: [
            { name: "Upload your PDF", text: "Drop the PDF whose pages you want to rearrange or remove." },
            {
              name: "Reorder or delete pages",
              text: "Use the arrow buttons to move pages up or down, or the trash button to remove unwanted pages.",
            },
            { name: "Download the result", text: "Click Apply & Download to get your reordered PDF instantly." },
          ],
          featureList: [
            "Reorder pages with up/down controls",
            "Delete individual pages",
            "Visual thumbnails for every page",
            "Runs 100% in your browser — no upload, no signup",
            "Works on mobile and desktop",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. All processing happens entirely in your browser using pdf-lib. Your file never leaves your device.",
            },
            {
              question: "Can I delete multiple pages at once?",
              answer:
                "You can delete pages one at a time using the trash button on each page thumbnail. The tool will warn you if you try to remove the last remaining page.",
            },
            {
              question: "Will the reordered PDF look exactly the same?",
              answer:
                "Yes. The tool copies the original PDF pages as-is into a new document — fonts, images, and formatting are preserved.",
            },
          ],
        })}
      />
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_DESCRIPTION}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "PDF Page Manager" }]}
      />
      <div className="mt-8">
        <PdfPageManagerForm />
      </div>
    </main>
  );
}
