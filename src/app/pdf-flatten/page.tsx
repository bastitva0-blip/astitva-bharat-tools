import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfFlattenForm } from "./pdf-flatten-form";

const PAGE_TITLE = "Flatten PDF — Lock Form Fields Free, In Browser";
const PAGE_DESCRIPTION =
  "Remove all interactive form fields from any PDF with one click. Flattening locks filled values into the document, making it non-editable — perfect before sharing. Runs entirely in your browser.";
const PAGE_KEYWORDS = [
  "flatten PDF online",
  "flatten PDF form fields",
  "remove form fields PDF",
  "lock PDF form",
  "PDF flatten in browser",
  "make PDF non-editable",
  "flatten filled PDF",
  "BharatTools PDF flatten",
  "PDF form flatten India",
  "flatten interactive PDF",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-flatten",
    languages: {
      "en-IN": "/pdf-flatten",
      "hi-IN": "/pdf-flatten",
      "x-default": "/pdf-flatten",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-flatten",
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

export default async function PdfFlattenPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Flatten",
          description:
            "Remove all interactive form fields from any PDF in one click. Flattening locks filled values into the document, making it non-editable. Runs 100% in your browser — nothing is uploaded.",
          path: "/pdf-flatten",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Flatten" }],
          steps: [
            {
              name: "Upload your PDF",
              text: "Drop or browse to the PDF whose form fields you want to flatten.",
            },
            {
              name: "Flatten PDF",
              text: "Click the Flatten PDF button. pdf-lib removes all interactive fields and bakes the filled values into the page content.",
            },
            {
              name: "Download flattened PDF",
              text: "Your browser downloads the flattened PDF automatically, ready to share without editable fields.",
            },
          ],
          featureList: [
            "Flattens all interactive form fields in one click",
            "Filled values are preserved as static page content",
            "Works on any standard PDF with AcroForm fields",
            "Runs 100% in your browser — no upload, no signup",
            "Works on mobile and desktop",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The PDF is loaded and processed entirely in your browser using pdf-lib. Your file never leaves your device.",
            },
            {
              question: "What does flattening actually do?",
              answer:
                "Flattening converts interactive form fields (text boxes, checkboxes, dropdowns, signatures) into static page content. The filled values remain visible but can no longer be edited or submitted.",
            },
            {
              question: "What if my PDF has no form fields?",
              answer:
                "The tool will still produce a valid download — it will simply be a copy of the original PDF. No error is shown because the file is still processed correctly.",
            },
          ],
        })}
      />
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_DESCRIPTION}
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "PDF Flatten" },
        ]}
      />
      <div className="mt-8">
        <PdfFlattenForm />
      </div>
    </main>
  );
}
