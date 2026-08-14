import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfRepairForm } from "./pdf-repair-form";

const PAGE_TITLE = "PDF Repair — Fix Corrupted PDF Free, In Browser";
const PAGE_DESCRIPTION =
  "Repair a corrupted or damaged PDF file with one click. BharatTools attempts to recover and re-save the document entirely in your browser — no upload, no signup required.";
const PAGE_KEYWORDS = [
  "repair PDF online",
  "fix corrupted PDF",
  "recover damaged PDF",
  "PDF repair in browser",
  "corrupt PDF fixer",
  "fix broken PDF file",
  "PDF recovery tool",
  "BharatTools PDF repair",
  "repair PDF India",
  "damaged PDF repair free",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-repair",
    languages: {
      "en-IN": "/pdf-repair",
      "hi-IN": "/pdf-repair",
      "x-default": "/pdf-repair",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-repair",
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

export default async function PdfRepairPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Repair",
          description:
            "Repair a corrupted or damaged PDF file in one click. Attempts to recover and re-save the document using pdf-lib. Runs 100% in your browser — nothing is uploaded.",
          path: "/pdf-repair",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Repair" }],
          steps: [
            {
              name: "Upload your PDF",
              text: "Drop or browse to the corrupted or damaged PDF you want to repair.",
            },
            {
              name: "Repair PDF",
              text: "Click the Repair PDF button. pdf-lib attempts to load and re-save the document, recovering what it can from the file structure.",
            },
            {
              name: "Download repaired PDF",
              text: "Your browser downloads the repaired PDF automatically. Works best on minor corruption — severely damaged files may not be recoverable.",
            },
          ],
          featureList: [
            "Attempts to recover and re-save corrupted or damaged PDFs",
            "Uses ignoreEncryption and throwOnInvalidObject options for maximum tolerance",
            "Runs 100% in your browser — no upload, no signup",
            "Works on mobile and desktop",
            "Shows page count recovered on success",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The PDF is loaded and processed entirely in your browser using pdf-lib. Your file never leaves your device.",
            },
            {
              question: "What kinds of corruption can this fix?",
              answer:
                "This tool works best on minor structural corruption — such as incomplete saves, minor byte errors, or invalid objects. Severely damaged files with missing or overwritten page data may not be recoverable.",
            },
            {
              question: "What happens if the repair fails?",
              answer:
                "If the PDF is too severely damaged to load, you will see an error message. There is no partial output — the tool only downloads a file when it is confident the PDF was successfully parsed and re-saved.",
            },
          ],
        })}
      />
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_DESCRIPTION}
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "PDF Repair" },
        ]}
      />
      <div className="mt-8">
        <PdfRepairForm />
      </div>
    </main>
  );
}
