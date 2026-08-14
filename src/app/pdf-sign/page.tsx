import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfSignForm } from "./pdf-sign-form";

const PAGE_TITLE = "Sign PDF — Add Your Signature Free, In Browser";
const PAGE_DESCRIPTION =
  "Add your handwritten or typed signature to any PDF — entirely in your browser. Draw, type, or upload a signature image and place it on any page. No upload, no signup, free.";
const PAGE_KEYWORDS = [
  "sign PDF online",
  "add signature to PDF",
  "PDF signature free",
  "digital signature PDF India",
  "sign PDF without upload",
  "PDF esign in browser",
  "sign PDF for sarkari documents",
  "PDF signature tool",
  "draw signature on PDF",
  "type signature PDF",
  "BharatTools PDF sign",
  "PDF sign no account",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-sign",
    languages: {
      "en-IN": "/pdf-sign",
      "hi-IN": "/pdf-sign",
      "x-default": "/pdf-sign",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-sign",
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

export default async function PdfSignPage() {
  const locale = await getCurrentLocale();
  getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Sign",
          description:
            "Add a handwritten, typed, or image signature to any PDF in your browser. Place it on one or multiple pages and download instantly. Files never leave your device — free and private.",
          path: "/pdf-sign",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Sign" }],
          steps: [
            { name: "Upload PDF", text: "Drop the PDF you want to sign." },
            {
              name: "Create signature",
              text: "Draw your signature on a canvas, type your name in cursive or print, or upload a PNG/JPG signature image.",
            },
            {
              name: "Place and download",
              text: "Click on the page to position your signature, then click Apply & Download to get the signed PDF.",
            },
          ],
          featureList: [
            "Draw signature with mouse or touch",
            "Type name in cursive or print style",
            "Upload a PNG or JPG signature image",
            "Place signature on any page with a single click",
            "Adjustable signature width",
            "Multi-page support",
            "100% on-device — no upload, no signup",
            "Mobile and desktop friendly",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server when I sign it?",
              answer:
                "No. The PDF Sign tool runs entirely in your browser. Your document and signature never leave your device.",
            },
            {
              question: "What signature types are supported?",
              answer:
                "You can draw a freehand signature with your mouse or finger, type your name in a cursive or print font, or upload an existing signature as a PNG or JPG image.",
            },
            {
              question: "Can I sign multiple pages at once?",
              answer:
                "Yes. Navigate to each page and click to place the signature. The tool remembers one placement per page and applies all placements when you click Apply & Download.",
            },
          ],
        })}
      />
      <PageHeader
        title="Sign PDF"
        subtitle="Add your signature to any PDF — draw, type, or upload. Runs entirely in your browser."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "PDF Sign" }]}
      />
      <div className="mt-8">
        <PdfSignForm />
      </div>
    </main>
  );
}
