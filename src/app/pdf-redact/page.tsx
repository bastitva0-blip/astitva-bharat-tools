import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfRedactForm } from "./pdf-redact-form";

const PAGE_TITLE = "PDF Redact — Remove Sensitive Text Forever, In Browser";
const PAGE_DESCRIPTION =
  "Permanently black out Aadhaar numbers, PAN details, signatures, and other sensitive info from any PDF. Redaction runs entirely in your browser — nothing is uploaded.";
const PAGE_KEYWORDS = [
  "PDF redact online",
  "redact PDF in browser",
  "black out PDF text",
  "remove sensitive info PDF",
  "PDF redaction tool India",
  "hide text in PDF",
  "PDF privacy tool",
  "BharatTools PDF redact",
  "Aadhaar redact PDF",
  "PAN card redact PDF",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-redact",
    languages: {
      "en-IN": "/pdf-redact",
      "hi-IN": "/pdf-redact",
      "x-default": "/pdf-redact",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-redact",
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

export default async function PdfRedactPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Redact",
          description:
            "Permanently black out sensitive information in any PDF — Aadhaar, PAN, signatures, bank details. Redaction runs 100% in your browser. Nothing is uploaded.",
          path: "/pdf-redact",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Redact" }],
          steps: [
            {
              name: "Upload your PDF",
              text: "Drop the PDF containing sensitive information you want to remove.",
            },
            {
              name: "Draw redaction boxes",
              text: "Click and drag over any area on any page to mark it for redaction.",
            },
            {
              name: "Download redacted PDF",
              text: "Click Apply & Download to get a new PDF with the selected areas permanently blacked out.",
            },
          ],
          featureList: [
            "Draw black redaction rectangles on any page",
            "Multi-page PDF support with page navigator",
            "Redactions are permanent — not just overlays",
            "Runs 100% in your browser — no upload, no signup",
            "Works on mobile and desktop",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The PDF is loaded and processed entirely in your browser using pdfjs-dist and pdf-lib. Your file never leaves your device.",
            },
            {
              question: "Are the redactions truly permanent?",
              answer:
                "Yes. The tool draws filled black rectangles directly onto the PDF page content using pdf-lib, permanently covering the underlying text or images.",
            },
            {
              question: "Can I redact multiple pages at once?",
              answer:
                "Yes. Use the page navigator to move between pages and draw redaction boxes on each. All redactions across all pages are applied when you click Apply & Download.",
            },
            {
              question: "What types of content can I redact?",
              answer:
                "You can redact any area — text (Aadhaar numbers, PAN, phone numbers, addresses), images, signatures, or any other visible content on the page.",
            },
          ],
        })}
      />
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_DESCRIPTION}
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "PDF Redact" },
        ]}
      />
      <div className="mt-8">
        <PdfRedactForm />
      </div>
    </main>
  );
}
