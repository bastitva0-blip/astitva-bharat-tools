import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfCompressForm } from "./pdf-compress-form";

const PAGE_TITLE = "Compress PDF Online — Free, In-Browser PDF Compressor for Sarkari Forms";
const PAGE_DESCRIPTION =
  "Compress a PDF below 200 KB, 500 KB or any target for Indian government form portals. Re-encodes embedded photos, strips metadata, runs 100% in your browser - your PDF is never uploaded. Free, no signup, works on mobile.";
const PAGE_KEYWORDS = [
  "compress PDF online",
  "PDF compressor India",
  "reduce PDF size to 200 KB",
  "shrink PDF for upload",
  "PDF size kam karein",
  "compress PDF for sarkari form",
  "compress PDF for SSC",
  "compress PDF for UPSC",
  "PDF compressor no upload",
  "private PDF compressor",
  "PDF compressor in browser",
  "BharatTools PDF compressor",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-compress",
    languages: { "en-IN": "/pdf-compress", "hi-IN": "/pdf-compress", "x-default": "/pdf-compress" },
  },
  openGraph: {
    type: "website",
    url: "/pdf-compress",
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

export default async function PdfCompressPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Compressor",
          description:
            "Compress a PDF in your browser to fit a sarkari portal upload limit. Re-encodes embedded photos at chosen quality, strips metadata, outputs a smaller PDF. Free, no signup, no upload - everything runs on-device.",
          path: "/pdf-compress",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Compressor" }],
          steps: [
            { name: "Upload PDF", text: "Drop a PDF up to 50 MB." },
            {
              name: "Pick strength",
              text: "Light keeps quality, Recommended balances size and quality, Stronger gives the smallest file.",
            },
            { name: "Download", text: "Get the smaller PDF. Files never leave your device." },
          ],
          featureList: [
            "Re-encodes embedded JPEG photos at chosen quality",
            "Three presets: Light, Recommended, Stronger",
            "Strips metadata and unused objects",
            "Works on PDFs up to 50 MB",
            "100% on-device - no upload, no signup",
            "Mobile and desktop friendly",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "How do I compress a PDF to under 200 KB or 500 KB?",
              answer:
                "Open BharatTools PDF Compressor, drop your PDF and pick Recommended or Stronger. The tool re-encodes embedded photos at lower quality and strips metadata. Works best on PDFs containing scanned pages or photographs - typical of filled sarkari forms.",
            },
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The compressor runs entirely in your browser using JavaScript. Your PDF never leaves your device.",
            },
            {
              question: "Will this work on text-only PDFs?",
              answer:
                "Savings on text-only PDFs are small (10-15%) because there are no photos to re-encode. The tool gives big savings on PDFs that contain scanned pages or embedded photographs.",
            },
          ],
        })}
      />
      <PageHeader
        title={dict.pdfCompress.title}
        subtitle={dict.pdfCompress.subtitle}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: dict.pdfCompress.breadcrumb }]}
      />
      <div className="mt-8">
        <PdfCompressForm />
      </div>
    </main>
  );
}
