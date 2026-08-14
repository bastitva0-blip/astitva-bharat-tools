import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfWatermarkForm } from "./pdf-watermark-form";

const PAGE_TITLE = "Add Watermark to PDF — Free, In-Browser";
const PAGE_DESCRIPTION =
  "Stamp any text watermark — CONFIDENTIAL, DRAFT, your name — onto every page of a PDF. Choose position, opacity, font size, and color. Runs 100% in your browser, no upload, no signup, free.";
const PAGE_KEYWORDS = [
  "add watermark to PDF",
  "PDF watermark online",
  "watermark PDF free",
  "stamp PDF text",
  "PDF watermark no upload",
  "confidential watermark PDF",
  "draft watermark PDF",
  "PDF watermark in browser",
  "watermark PDF India",
  "BharatTools PDF watermark",
  "PDF watermark tool",
  "secure PDF watermark",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-watermark",
    languages: {
      "en-IN": "/pdf-watermark",
      "hi-IN": "/pdf-watermark",
      "x-default": "/pdf-watermark",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-watermark",
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

export default async function PdfWatermarkPage() {
  const locale = await getCurrentLocale();
  getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Watermark",
          description:
            "Stamp a custom text watermark on every page of a PDF in your browser. Pick position, opacity, font size, and color. Files never leave your device — free and private.",
          path: "/pdf-watermark",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Watermark" }],
          steps: [
            { name: "Upload PDF", text: "Drop or select the PDF you want to watermark." },
            {
              name: "Configure watermark",
              text: "Enter your watermark text, then choose position, opacity, font size, and color.",
            },
            {
              name: "Download",
              text: "Click Add Watermark and download the stamped PDF. Files stay on your device.",
            },
          ],
          featureList: [
            "Watermark every page in one click",
            "Four placement options: Center Diagonal, Center Horizontal, Top Left, Bottom Right",
            "Adjustable opacity (5%–50%)",
            "Font size 24–120 pt",
            "Four colors: Gray, Red, Blue, Black",
            "100% on-device — no upload, no signup",
            "Mobile and desktop friendly",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The watermark tool runs entirely in your browser using JavaScript. Your PDF never leaves your device.",
            },
            {
              question: "Can I watermark a scanned PDF?",
              answer:
                "Yes. The tool overlays text on every page regardless of whether it contains scanned images or selectable text.",
            },
            {
              question: "What watermark text should I use?",
              answer:
                "You can type anything — CONFIDENTIAL, DRAFT, your name, or a copyright notice. Leave the field blank and it defaults to CONFIDENTIAL.",
            },
          ],
        })}
      />
      <PageHeader
        title="PDF Watermark"
        subtitle="Stamp any text on every page of your PDF — right in the browser, no upload."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "PDF Watermark" }]}
      />
      <div className="mt-8">
        <PdfWatermarkForm />
      </div>
    </main>
  );
}
