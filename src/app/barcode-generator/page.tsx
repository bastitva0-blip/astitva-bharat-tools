import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { BarcodeGeneratorForm } from "./barcode-generator-form";

const PAGE_TITLE = "Barcode Generator — Code128, EAN, QR, PDF417 & More";
const PAGE_DESCRIPTION =
  "Generate barcodes in Code128, EAN-13, EAN-8, UPC-A, QR Code, PDF417, and DataMatrix formats. Download as PNG or SVG. Runs entirely in your browser — nothing uploaded.";
const PAGE_KEYWORDS = [
  "barcode generator",
  "Code128 barcode",
  "EAN-13 barcode",
  "QR code generator",
  "PDF417 barcode",
  "DataMatrix barcode",
  "barcode PNG download",
  "barcode SVG download",
  "online barcode maker",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/barcode-generator",
    languages: {
      "en-IN": "/barcode-generator",
      "hi-IN": "/barcode-generator",
      "x-default": "/barcode-generator",
    },
  },
  openGraph: {
    type: "website",
    url: "/barcode-generator",
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

export default async function BarcodeGeneratorPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Barcode Generator",
          description:
            "Generate barcodes in multiple formats including Code128, EAN-13, EAN-8, UPC-A, QR Code, PDF417, and DataMatrix. Download as PNG or SVG.",
          path: "/barcode-generator",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Barcode Generator" },
          ],
          steps: [
            { name: "Choose barcode type", text: "Select from Code128, EAN-13, EAN-8, UPC-A, QR Code, PDF417, or DataMatrix." },
            { name: "Enter your value", text: "Type the text or number to encode. Live preview updates instantly." },
            { name: "Download", text: "Save the barcode as a PNG image or SVG vector file." },
          ],
          featureList: [
            "Seven barcode formats: Code128, EAN-13, EAN-8, UPC-A, QR Code, PDF417, DataMatrix",
            "Live preview updates as you type",
            "Download as PNG or SVG",
            "Adjustable scale and height",
            "Runs entirely in your browser — no uploads",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Which barcode formats are supported?",
              answer:
                "Code128, EAN-13, EAN-8, UPC-A, QR Code, PDF417, and DataMatrix.",
            },
            {
              question: "What is the difference between PNG and SVG download?",
              answer:
                "PNG is a raster image suitable for printing at a fixed resolution. SVG is a vector format that scales to any size without losing quality, ideal for print and design work.",
            },
            {
              question: "Why does EAN-13 give a validation error?",
              answer:
                "EAN-13 requires exactly 12 or 13 numeric digits. The 13th digit is a check digit computed automatically if you provide 12 digits.",
            },
            {
              question: "Is my data uploaded to a server?",
              answer:
                "No. All barcode generation happens in your browser using the bwip-js library. Nothing is sent to any server.",
            },
          ],
        })}
      />
      <PageHeader
        title="Barcode Generator"
        subtitle="Code128, EAN-13, EAN-8, UPC-A, QR Code, PDF417, DataMatrix. PNG & SVG download. Runs in your browser."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Barcode Generator" }]}
      />
      <div className="mt-8">
        <BarcodeGeneratorForm />
      </div>
    </main>
  );
}
