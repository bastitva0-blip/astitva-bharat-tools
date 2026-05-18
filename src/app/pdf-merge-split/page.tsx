import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfMergeSplitForm } from "./pdf-merge-split-form";

const PAGE_TITLE = "Merge PDF & Split PDF Online — Free, In-Browser, No Upload";
const PAGE_DESCRIPTION =
  "Combine multiple PDFs into one or split a PDF by page ranges like 1-3, 5, 7-9. Runs 100% in your browser - your PDFs are never uploaded. Free, no signup, works on mobile - perfect for sarkari form portals.";
const PAGE_KEYWORDS = [
  "merge PDF online",
  "combine PDF files",
  "PDF joiner",
  "split PDF",
  "separate PDF pages",
  "PDF page ranges",
  "PDF splitter India",
  "PDF merger India",
  "merge PDF for sarkari form",
  "split PDF for upload",
  "PDF tools no upload",
  "private PDF merge",
  "BharatTools PDF merge split",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-merge-split",
    languages: {
      "en-IN": "/pdf-merge-split",
      "hi-IN": "/pdf-merge-split",
      "x-default": "/pdf-merge-split",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-merge-split",
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

export default async function PdfMergeSplitPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Merge & Split",
          description:
            "Combine multiple PDFs into one, or split a PDF into separate files using page ranges. Runs 100% in your browser - files never uploaded. Free, no signup.",
          path: "/pdf-merge-split",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Merge & Split" }],
          steps: [
            { name: "Pick mode", text: "Merge several PDFs into one, or split one PDF." },
            { name: "Add files", text: "Drop the PDF(s) and reorder or enter page ranges." },
            { name: "Download", text: "Get the merged PDF or split parts. Nothing uploaded." },
          ],
          featureList: [
            "Merge unlimited PDFs into a single file",
            "Reorder PDFs before merging",
            "Split a PDF by ranges like '1-3, 5, 7-9'",
            "Split into individual pages with one click",
            "100% on-device - no upload",
            "Free, no signup, works on mobile",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "How do I merge multiple PDFs into one?",
              answer:
                "Open BharatTools PDF Merge & Split, pick Merge mode, drop your PDFs, drag to reorder them, and click 'Merge into one PDF'. The combined file downloads immediately - nothing is uploaded to a server.",
            },
            {
              question: "How do I split a PDF into specific page ranges?",
              answer:
                "Open Split mode, drop your PDF, pick 'Page ranges' and type something like '1-3, 5, 7-9'. Each range becomes a separate downloadable PDF. Or pick 'Every page' to break the PDF into one-page files.",
            },
            {
              question: "Is there an upload limit?",
              answer:
                "Each PDF can be up to 50 MB. Because everything runs in your browser, the limit is your device's memory, not a server quota.",
            },
          ],
        })}
      />
      <PageHeader
        title={dict.pdfMergeSplit.title}
        subtitle={dict.pdfMergeSplit.subtitle}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: dict.pdfMergeSplit.breadcrumb }]}
      />
      <div className="mt-8">
        <PdfMergeSplitForm />
      </div>
    </main>
  );
}
