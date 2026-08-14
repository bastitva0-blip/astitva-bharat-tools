import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { PdfCropForm } from "./pdf-crop-form";

const PAGE_TITLE = "Crop PDF — Trim Margins Free, In Browser";
const PAGE_DESCRIPTION =
  "Remove unwanted white space or margins from every page of your PDF in seconds. Set top, bottom, left, and right margins in millimetres and download the trimmed file instantly — no upload, no signup, 100% in your browser.";
const PAGE_KEYWORDS = [
  "crop PDF online",
  "trim PDF margins",
  "PDF crop tool free",
  "remove margins PDF",
  "crop PDF in browser",
  "PDF trim white space",
  "crop PDF no upload",
  "PDF margin remover",
  "trim PDF pages",
  "crop PDF India",
  "BharatTools PDF crop",
  "PDF crop tool",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-crop",
    languages: {
      "en-IN": "/pdf-crop",
      "hi-IN": "/pdf-crop",
      "x-default": "/pdf-crop",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-crop",
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

export default async function PdfCropPage() {
  const locale = await getCurrentLocale();
  getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Crop",
          description:
            "Trim margins from every page of a PDF directly in your browser. Enter the amount to remove from each edge in millimetres and download the cropped file — no upload, no signup, free.",
          path: "/pdf-crop",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Crop" }],
          steps: [
            { name: "Upload PDF", text: "Drop or select the PDF whose margins you want to trim." },
            {
              name: "Set margins",
              text: "Enter how many millimetres to remove from the top, bottom, left, and right of each page.",
            },
            {
              name: "Download",
              text: "Click Crop PDF and save the trimmed file. Your PDF never leaves your device.",
            },
          ],
          featureList: [
            "Trim top, bottom, left, and right margins independently",
            "Apply cropping to all pages or the first page only",
            "Millimetre-based precision — no guesswork",
            "100% on-device — no upload, no signup",
            "Works on scanned PDFs and text PDFs",
            "Instant download after processing",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The crop tool runs entirely in your browser using JavaScript. Your PDF never leaves your device.",
            },
            {
              question: "What does cropping a PDF actually do?",
              answer:
                "Cropping sets a crop box on each page that tells PDF viewers to display only the inner rectangle. The original page content is preserved and can be restored by removing the crop box.",
            },
            {
              question: "Can I crop only the first page?",
              answer:
                "Yes. Select First page only under Apply to before clicking Crop PDF, and only the first page will have its margins trimmed.",
            },
          ],
        })}
      />
      <PageHeader
        title="Crop PDF"
        subtitle="Trim white space and unwanted margins from your PDF — right in the browser, no upload."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "PDF Crop" }]}
      />
      <div className="mt-8">
        <PdfCropForm />
      </div>
    </main>
  );
}
