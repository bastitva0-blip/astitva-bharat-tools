import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { getCurrentLocale } from "@/i18n/server";
import { PdfOcrForm } from "./pdf-ocr-form";

const PAGE_TITLE =
  "PDF OCR — Extract Text from Scanned PDFs Free";
const PAGE_DESCRIPTION =
  "Extract searchable, copyable text from scanned or image-based PDFs directly in your browser. Supports English and Hindi. No upload, no signup — OCR runs entirely on your device.";
const PAGE_KEYWORDS = [
  "PDF OCR",
  "extract text from scanned PDF",
  "scanned PDF to text",
  "image PDF text extractor",
  "OCR PDF online free",
  "PDF text extraction India",
  "searchable PDF maker",
  "Hindi PDF OCR",
  "English Hindi OCR",
  "PDF OCR no upload",
  "browser-based OCR",
  "BharatTools PDF OCR",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-ocr",
    languages: {
      "en-IN": "/pdf-ocr",
      "hi-IN": "/pdf-ocr",
      "x-default": "/pdf-ocr",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-ocr",
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

export default async function PdfOcrPage() {
  await getCurrentLocale();
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF OCR",
          description:
            "Extract selectable, copyable text from a scanned or image-based PDF. Supports English and Hindi. Runs 100% in your browser — no file is uploaded.",
          path: "/pdf-ocr",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "PDF OCR" },
          ],
          steps: [
            {
              name: "Upload your scanned PDF",
              text: "Drop or select the PDF whose text you want to extract.",
            },
            {
              name: "Choose a language",
              text: "Pick English, Hindi, or both for best recognition accuracy.",
            },
            {
              name: "Copy or download the text",
              text: "Extracted text appears instantly — copy it to clipboard or save as a .txt file.",
            },
          ],
          featureList: [
            "OCR on scanned and image-based PDFs",
            "English and Hindi language support",
            "Multi-page PDFs — processes every page",
            "100% on-device — no upload, no signup",
            "Copy to clipboard or download as .txt",
            "Mobile and desktop friendly",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What kind of PDFs can I use this on?",
              answer:
                "This tool works best on PDFs that contain scanned pages or embedded images of text — such as photocopied documents, government certificates, or mark sheets. It will not improve results on PDFs that already have a text layer.",
            },
            {
              question: "Is my PDF uploaded to any server?",
              answer:
                "No. All OCR processing happens in your browser using pdfjs-dist and Tesseract.js. Your PDF never leaves your device.",
            },
            {
              question: "Can I extract Hindi text from a scanned PDF?",
              answer:
                "Yes. Select Hindi or English + Hindi from the language picker before clicking Extract Text. Accuracy depends on the print quality of the original document.",
            },
          ],
        })}
      />
      <PageHeader
        title="PDF OCR"
        subtitle="Extract copyable text from a scanned or image PDF. English and Hindi. Nothing uploaded."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "PDF OCR" },
        ]}
      />
      <div className="mt-8">
        <PdfOcrForm />
      </div>
    </main>
  );
}
