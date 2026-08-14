import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { AffidavitForm } from "./affidavit-form";

const PAGE_TITLE = "Affidavit Generator — Free Affidavit Format India, Print Ready";
const PAGE_DESCRIPTION =
  "Generate a standard Indian affidavit on ₹100 stamp paper format instantly. Fill in your details, choose an affidavit type — General, Income, Address Proof, Name Change or Character Certificate — preview and print or save as PDF. Free, runs in your browser.";
const PAGE_KEYWORDS = [
  "affidavit format india",
  "affidavit generator online",
  "100 rupee stamp paper affidavit",
  "affidavit kaise banaye",
  "income affidavit",
  "address proof affidavit",
  "name change affidavit",
  "character certificate affidavit",
  "notary affidavit format",
  "affidavit print online free",
  "general affidavit india",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/affidavit",
    languages: {
      "en-IN": "/affidavit",
      "hi-IN": "/affidavit",
      "x-default": "/affidavit",
    },
  },
  openGraph: {
    type: "website",
    url: "/affidavit",
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

export default function AffidavitPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Affidavit Generator",
          description:
            "Generate a standard Indian affidavit on ₹100 stamp paper format. Choose from General, Income, Address Proof, Name Change or Character Certificate templates. Fill details, preview and print.",
          path: "/affidavit",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Affidavit Generator" }],
          steps: [
            { name: "Select affidavit type", text: "Pick from General, Income, Address Proof, Name Change or Character Certificate." },
            { name: "Fill in your details", text: "Enter deponent name, address, and any template-specific fields. The declaration text auto-populates and is fully editable." },
            { name: "Print or save as PDF", text: "Click Print / Save as PDF. In the print dialog select Save as PDF to download a ready-to-sign affidavit." },
          ],
          featureList: [
            "5 affidavit templates: General, Income, Address Proof, Name Change, Character Certificate",
            "Standard ₹100 non-judicial stamp paper layout with decorative border",
            "Live preview updates as you type — WYSIWYG",
            "Editable declaration text for custom clauses",
            "Print-ready A4 format — use browser Save as PDF",
            "100% on-device — no upload, no signup, no data stored",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is this affidavit legally valid in India?",
              answer:
                "The format follows standard Indian affidavit conventions. However, for legal validity the affidavit must be printed on an actual ₹100 non-judicial stamp paper (or e-stamp paper), signed by the deponent, and attested by a Notary Public or Oath Commissioner. This tool generates the text and layout — the physical stamp paper and notarisation are done separately.",
            },
            {
              question: "Can I edit the declaration text?",
              answer:
                "Yes. Each template pre-fills a declaration, but the text area is fully editable. You can add, remove or modify any clause before printing.",
            },
            {
              question: "How do I save it as a PDF?",
              answer:
                "Click the 'Print / Save as PDF' button. In the print dialog that opens, set the destination/printer to 'Save as PDF' (available in Chrome, Edge, Firefox and most browsers). The form panel is automatically hidden so only the affidavit document is printed.",
            },
          ],
        })}
      />
      <PageHeader
        title="Affidavit Generator"
        subtitle="Standard Indian affidavit on ₹100 stamp paper format — fill details, preview and print."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Affidavit Generator" }]}
      />
      <div className="mt-8">
        <AffidavitForm />
      </div>
    </main>
  );
}
