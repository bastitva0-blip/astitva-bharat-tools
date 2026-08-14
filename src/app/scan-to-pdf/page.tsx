import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ScanToPdfForm } from "./scan-to-pdf-form";

const PAGE_TITLE = "Scan to PDF — Camera to PDF Free, In Browser";
const PAGE_DESCRIPTION =
  "Use your phone or webcam to scan documents and convert them to a PDF instantly. Capture pages with your camera or upload images. Runs 100% in your browser — nothing uploaded to any server.";
const PAGE_KEYWORDS = [
  "scan to PDF",
  "camera to PDF",
  "scan document to PDF",
  "mobile scan PDF",
  "free scan PDF online",
  "scan without app",
  "scan documents India",
  "document scanner browser",
  "convert photos to PDF",
  "scan sarkari document",
  "BharatTools scan PDF",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/scan-to-pdf",
    languages: {
      "en-IN": "/scan-to-pdf",
      "hi-IN": "/scan-to-pdf",
      "x-default": "/scan-to-pdf",
    },
  },
  openGraph: {
    type: "website",
    url: "/scan-to-pdf",
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

export default async function ScanToPdfPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Scan to PDF",
          description:
            "Use your phone camera or webcam to scan documents and save them as a PDF. Runs 100% in your browser — files never uploaded.",
          path: "/scan-to-pdf",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Scan to PDF" }],
          steps: [
            {
              name: "Capture or upload pages",
              text: "Point your camera at a document and tap Capture, or switch to Upload to select existing photos.",
            },
            {
              name: "Reorder pages",
              text: "Use the up / down arrows to arrange pages in the right order, or delete any unwanted page.",
            },
            {
              name: "Download PDF",
              text: "Tap Convert to PDF — a multi-page PDF is built in your browser and downloaded instantly.",
            },
          ],
          featureList: [
            "Live camera preview with front / rear camera toggle",
            "Upload existing images (JPG, PNG, WebP)",
            "Reorder and delete pages before converting",
            "PDF sized to each image's native resolution",
            "100% on-device — nothing sent to any server",
            "Free, no signup, works on Android and iOS browsers",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Do I need to install an app to scan documents to PDF?",
              answer:
                "No. BharatTools Scan to PDF works entirely in your browser — just open the page, allow camera access, and start capturing. No app download required.",
            },
            {
              question: "Are my scanned documents uploaded to a server?",
              answer:
                "Never. All processing happens on your device. Your images and the generated PDF never leave your browser.",
            },
            {
              question: "Can I scan multiple pages into a single PDF?",
              answer:
                "Yes. Capture or upload as many pages as you need, reorder them if necessary, then tap Convert to PDF to get a single multi-page PDF.",
            },
          ],
        })}
      />
      <PageHeader
        title="Scan to PDF"
        subtitle="Capture documents with your camera or upload images — convert to a PDF in seconds, right in your browser."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Scan to PDF" }]}
      />
      <div className="mt-8">
        <ScanToPdfForm />
      </div>
    </main>
  );
}
