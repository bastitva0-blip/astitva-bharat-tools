import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfPageNumbersForm } from "./pdf-page-numbers-form";

const PAGE_TITLE = "Add Page Numbers to PDF — Free, In-Browser";
const PAGE_DESCRIPTION =
  "Stamp page numbers onto any PDF — pick the position, format, and starting number. Runs entirely in your browser, no upload, no signup.";
const PAGE_KEYWORDS = [
  "add page numbers to PDF",
  "PDF page numbers online",
  "number PDF pages free",
  "PDF page numbering tool India",
  "stamp page numbers PDF browser",
  "PDF page numbers no upload",
  "BharatTools PDF page numbers",
  "add page number to PDF free",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-page-numbers",
    languages: {
      "en-IN": "/pdf-page-numbers",
      "hi-IN": "/pdf-page-numbers",
      "x-default": "/pdf-page-numbers",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-page-numbers",
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

export default async function PdfPageNumbersPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Page Numbers",
          description:
            "Add page numbers to any PDF in your browser — choose position, format, and start number. The file never leaves your device.",
          path: "/pdf-page-numbers",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Page Numbers" }],
          steps: [
            { name: "Upload your PDF", text: "Drop the PDF you want to number — up to any size, processed on-device." },
            { name: "Choose options", text: "Pick position (bottom, top, left, right), number format, font size, and starting page number." },
            { name: "Download numbered PDF", text: "Get the updated PDF with page numbers stamped on every page." },
          ],
          featureList: [
            "Six placement options — bottom or top, left, center, or right",
            "Four number formats including 'Page 1 of {total}'",
            "Configurable start number and font size",
            "Runs 100% in your browser — no upload, no signup",
            "Works on mobile and desktop",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. Page numbers are stamped entirely in your browser using pdf-lib. Your file never leaves your device.",
            },
            {
              question: "Can I start numbering from a page other than 1?",
              answer:
                "Yes. Set the 'Start number' field to any value — useful when a document's first few pages are a cover or table of contents you want to exclude from the count.",
            },
            {
              question: "What formats are available for the page number label?",
              answer:
                "Four formats: plain number (1), 'Page 1', '1 / total', and 'Page 1 of total'. Choose the one that matches your document's style.",
            },
          ],
        })}
      />
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_DESCRIPTION}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "PDF Page Numbers" }]}
      />
      <div className="mt-8">
        <PdfPageNumbersForm />
      </div>
    </main>
  );
}
