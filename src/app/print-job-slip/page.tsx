import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PrintJobSlipForm } from "./print-job-slip-form";

const PAGE_TITLE = "Print Job Slip — Send Files to Print Shop With a Clear Cover Sheet";
const PAGE_DESCRIPTION =
  "Bundle files for the print shop with a clear cover sheet: copies, color or B&W, single or double-sided, page ranges and notes. Outputs one PDF, ready to Quick Send. Free, runs in your browser - files never uploaded.";
const PAGE_KEYWORDS = [
  "print job slip",
  "send file to print shop",
  "print shop file share",
  "photocopy shop file send",
  "print order PDF",
  "print instructions cover sheet",
  "print job summary",
  "photocopy job slip",
  "Quick Send print shop",
  "P2P file share to print shop",
  "BharatTools print job slip",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/print-job-slip",
    languages: {
      "en-IN": "/print-job-slip",
      "hi-IN": "/print-job-slip",
      "x-default": "/print-job-slip",
    },
  },
  openGraph: {
    type: "website",
    url: "/print-job-slip",
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

export default async function PrintJobSlipPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Print Job Slip",
          description:
            "Bundle one or many files into a single PDF with a cover sheet that tells the print shop exactly what to print: copies, color, sides, page ranges, notes. Pairs with Quick Send for one-tap delivery.",
          path: "/print-job-slip",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Print Job Slip" }],
          steps: [
            { name: "Add files", text: "Drop PDFs and images for the job." },
            { name: "Set instructions", text: "Copies, color or B&W, sides, paper, page ranges per file." },
            { name: "Build slip", text: "Get one PDF starting with a clear cover sheet for the shop." },
            { name: "Send", text: "Download or hand off via Quick Send - no app, no number." },
          ],
          featureList: [
            "Per-file instructions: copies, color or B&W, sides, paper, page ranges",
            "Multiple instruction rows per file (e.g. pages 1-3 B&W, 4-6 color)",
            "Auto-generated cover sheet with totals and notes",
            "Combines PDFs and images into one deliverable PDF",
            "Pairs with Quick Send peer-to-peer transfer",
            "100% on-device - no upload, no signup",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What is a print job slip?",
              answer:
                "It's a single PDF that bundles all your print files together with a cover sheet on page one telling the print shop exactly what to print: how many copies, color or B&W, single or double-sided, which pages, and any notes. The shop staff sees the cover sheet first, then the actual documents.",
            },
            {
              question: "Can I print different pages of the same file with different settings?",
              answer:
                "Yes. For each PDF you can add multiple instruction rows. For example: row 1 prints pages 1-3 in B&W, row 2 prints pages 4-6 in color. The output PDF appends pages in the order you set.",
            },
            {
              question: "How do I send the slip to the print shop?",
              answer:
                "Download the PDF, then send it via Quick Send (BharatTools' peer-to-peer file transfer). The shop scans your QR with their phone and gets the file directly - no app install, no phone number exchange, files never stored on a server.",
            },
          ],
        })}
      />
      <PageHeader
        title={dict.printJobSlip.title}
        subtitle={dict.printJobSlip.subtitle}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: dict.printJobSlip.breadcrumb }]}
      />
      <div className="mt-8">
        <PrintJobSlipForm />
      </div>
    </main>
  );
}
