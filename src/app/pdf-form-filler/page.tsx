import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfFormFillerForm } from "./pdf-form-filler-form";

const PAGE_TITLE = "PDF Form Filler — Fill Government PDF Forms Free, In Browser";
const PAGE_DESCRIPTION =
  "Fill any PDF form directly in your browser — no upload, no signup. Detect all fillable fields, type your values, and download the completed PDF instantly. Ideal for government forms, applications, and official documents.";
const PAGE_KEYWORDS = [
  "fill PDF form online",
  "PDF form filler free",
  "fill government PDF form",
  "fill PDF in browser",
  "PDF form fill India",
  "interactive PDF form filler",
  "fill PDF without Adobe",
  "BharatTools PDF form",
  "government form PDF fill",
  "fill PDF form fields online",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-form-filler",
    languages: {
      "en-IN": "/pdf-form-filler",
      "hi-IN": "/pdf-form-filler",
      "x-default": "/pdf-form-filler",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-form-filler",
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

export default async function PdfFormFillerPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Form Filler",
          description:
            "Fill any PDF form directly in your browser. Detects all fillable fields — text boxes, checkboxes, dropdowns — lets you type your values, and downloads the completed PDF. Nothing is uploaded to any server.",
          path: "/pdf-form-filler",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Form Filler" }],
          steps: [
            {
              name: "Upload your PDF",
              text: "Drop or browse to the PDF form you want to fill. The tool detects all fillable fields automatically.",
            },
            {
              name: "Fill in the fields",
              text: "Type your values into text fields, check boxes, or pick options from dropdowns — all in your browser.",
            },
            {
              name: "Download filled PDF",
              text: "Click Fill & Download. The completed PDF is saved to your device with all values flattened in.",
            },
          ],
          featureList: [
            "Detects all fillable PDF form fields automatically",
            "Supports text fields, checkboxes, radio buttons, and dropdowns",
            "Download completed PDF with values flattened in",
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
              question: "What types of fields are supported?",
              answer:
                "Text fields, checkboxes, radio groups, dropdowns, and option lists. If a field type is not recognised, it is shown as Unknown and skipped during fill.",
            },
            {
              question: "What if the PDF has no fillable fields?",
              answer:
                "The tool will show a message saying the PDF has no fillable form fields. You can still download the original file.",
            },
            {
              question: "Can I use this for government forms like passport, PAN, or Aadhaar applications?",
              answer:
                "Yes, as long as the PDF has AcroForm fields (interactive form fields). Many government PDFs do include these. If the form is a scanned image PDF, it will have no fillable fields.",
            },
          ],
        })}
      />
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_DESCRIPTION}
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "PDF Form Filler" },
        ]}
      />
      <div className="mt-8">
        <PdfFormFillerForm />
      </div>
    </main>
  );
}
