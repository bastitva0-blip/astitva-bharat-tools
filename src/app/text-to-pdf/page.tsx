import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { TextToPdfForm } from "./text-to-pdf-form";

const PAGE_TITLE = "Text to PDF — Convert Text to PDF Free, In Browser";
const PAGE_DESCRIPTION =
  "Convert plain text or pasted content to a PDF instantly, right in your browser. Choose font size, page size (A4 or Letter), and margins. No upload, no signup, no watermark. Free and works on mobile.";
const PAGE_KEYWORDS = [
  "text to PDF",
  "convert text to PDF online",
  "text to PDF free",
  "paste text to PDF",
  "plain text PDF converter",
  "text to PDF no upload",
  "text to PDF in browser",
  "text to PDF India",
  "text PDF converter free",
  "BharatTools text to PDF",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/text-to-pdf",
    languages: {
      "en-IN": "/text-to-pdf",
      "hi-IN": "/text-to-pdf",
      "x-default": "/text-to-pdf",
    },
  },
  openGraph: {
    type: "website",
    url: "/text-to-pdf",
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

export default async function TextToPdfPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Text to PDF",
          description:
            "Convert plain text to a PDF in your browser. Paste or type text, pick font size, page size and margins, then download — no upload, no watermark, no signup.",
          path: "/text-to-pdf",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Text to PDF" }],
          steps: [
            { name: "Type or paste text", text: "Enter your text in the text area." },
            {
              name: "Choose options",
              text: "Pick font size, page size (A4 or Letter), margins, and a filename.",
            },
            { name: "Download PDF", text: "Click Convert to PDF — your file downloads instantly, no upload needed." },
          ],
          featureList: [
            "Converts plain text to a properly formatted PDF",
            "Automatic word-wrap and multi-page support",
            "Font sizes: 10, 12, 14, 16, 18 pt",
            "Page sizes: A4 and US Letter",
            "Margin presets: Normal, Narrow, Wide",
            "Custom output filename",
            "100% on-device — no upload, no signup, no watermark",
            "Mobile and desktop friendly",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my text sent to a server?",
              answer:
                "No. The PDF is generated entirely inside your browser using JavaScript. Your text never leaves your device.",
            },
            {
              question: "What happens when my text is longer than one page?",
              answer:
                "The tool automatically wraps text to fit the page width and adds new pages as needed, so long documents are fully supported.",
            },
            {
              question: "Can I set the font size and margins?",
              answer:
                "Yes. You can choose a font size from 10 to 18 pt, Normal, Narrow or Wide margins, and A4 or US Letter page size before converting.",
            },
          ],
        })}
      />
      <PageHeader
        title="Text to PDF"
        subtitle="Convert plain text to a PDF instantly — no upload, no signup."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Text to PDF" }]}
      />
      <div className="mt-8">
        <TextToPdfForm />
      </div>
    </main>
  );
}
