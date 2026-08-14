import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfToImagesForm } from "./pdf-to-images-form";

const PAGE_TITLE = "PDF to Images — Extract Every Page as PNG or JPEG";
const PAGE_DESCRIPTION =
  "Convert each page of a PDF into a high-quality PNG or JPEG image and download all pages as a ZIP file. Runs entirely in your browser — your PDF is never uploaded.";
const PAGE_KEYWORDS = [
  "PDF to images",
  "PDF to PNG",
  "PDF to JPEG",
  "extract PDF pages as images",
  "PDF page to image",
  "convert PDF to pictures",
  "PDF to image online",
  "PDF to image no upload",
  "PDF to image India",
  "BharatTools PDF to images",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-to-images",
    languages: {
      "en-IN": "/pdf-to-images",
      "hi-IN": "/pdf-to-images",
      "x-default": "/pdf-to-images",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-to-images",
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

export default async function PdfToImagesPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF to Images",
          description:
            "Extract every page of a PDF as a PNG or JPEG image. Download all pages together as a ZIP file. Processing happens in your browser — your file never leaves your device.",
          path: "/pdf-to-images",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF to Images" }],
          steps: [
            { name: "Upload a PDF", text: "Drop or select a PDF up to 50 MB." },
            { name: "Choose format and scale", text: "Pick PNG or JPEG and a render scale (1x, 2x, or 3x)." },
            { name: "Extract pages", text: "Every page is rendered to a separate image in your browser." },
            { name: "Download ZIP", text: "Save all page images in one ZIP file." },
          ],
          featureList: [
            "Renders every page at 1x, 2x, or 3x scale",
            "PNG (lossless) and JPEG output",
            "Downloads all pages as a ZIP file",
            "100% on-device — no upload, no signup",
            "Works on mobile and desktop",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The PDF is rendered using PDF.js running directly in your browser. No data is sent to any server.",
            },
            {
              question: "What scale should I choose?",
              answer:
                "2x is the right default — it gives sharp images at twice the PDF's native resolution. Use 3x only when you need very high quality for printing; use 1x when you want the smallest file size.",
            },
            {
              question: "Can I extract just one page?",
              answer:
                "Currently the tool extracts all pages at once and bundles them into a ZIP. Individual files inside the ZIP can be opened separately after extraction.",
            },
          ],
        })}
      />
      <PageHeader
        title="PDF to Images"
        subtitle="Extract every page as a PNG or JPEG and download them all as a ZIP. Nothing leaves your device."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "PDF to Images" }]}
      />
      <div className="mt-8">
        <PdfToImagesForm />
      </div>
    </main>
  );
}
