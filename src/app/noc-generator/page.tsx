import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { NocGeneratorForm } from "./noc-generator-form";

const PAGE_TITLE = "NOC Generator — Free No Objection Certificate Format India, Print Ready";
const PAGE_DESCRIPTION =
  "Generate a No Objection Certificate (NOC) for travel, job change, vehicle transfer, or property in seconds. Fill in issuer and recipient details, preview the NOC live, and print or save as PDF. Free, runs entirely in your browser.";
const PAGE_KEYWORDS = [
  "NOC generator online",
  "no objection certificate format india",
  "travel NOC from employer",
  "job change NOC format",
  "vehicle NOC format",
  "property NOC format",
  "NOC letter generator free",
  "NOC kaise banaye",
  "no objection certificate pdf",
  "employer NOC letter india",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/noc-generator",
    languages: {
      "en-IN": "/noc-generator",
      "hi-IN": "/noc-generator",
      "x-default": "/noc-generator",
    },
  },
  openGraph: {
    type: "website",
    url: "/noc-generator",
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

export default function NocGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "NOC Generator",
          description:
            "Generate a No Objection Certificate (NOC) for travel, job change, vehicle transfer, or property. Fill details, preview and print or save as PDF.",
          path: "/noc-generator",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "NOC Generator" }],
          steps: [
            { name: "Select NOC type", text: "Choose from Travel, Job Change, Vehicle, or Property NOC." },
            { name: "Fill in details", text: "Enter issuer, recipient, and type-specific fields. The NOC text updates live." },
            { name: "Print or save as PDF", text: "Click Print / Save as PDF. In the print dialog select Save as PDF to download your NOC." },
          ],
          featureList: [
            "4 NOC types: Travel, Job Change, Vehicle Transfer, Property",
            "Live preview — WYSIWYG updates as you type",
            "Formal A4 letter format with heading and signature block",
            "Print-ready format — use browser Save as PDF",
            "100% on-device — no upload, no signup, no data stored",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is this NOC legally valid in India?",
              answer:
                "The format follows standard professional conventions. For legal validity the NOC should be printed on the issuer's official letterhead, signed by the authorised person, and stamped with a company or official seal where applicable.",
            },
            {
              question: "What types of NOC can I generate?",
              answer:
                "You can generate a Travel NOC (employer allowing foreign travel), Job Change NOC (employer has no objection to joining another organisation), Vehicle NOC (seller/RTO NOC for vehicle registration transfer), and Property NOC (landlord or society NOC for tenant).",
            },
            {
              question: "How do I save the NOC as a PDF?",
              answer:
                "Click the 'Print / Save as PDF' button. In the print dialog set the destination to 'Save as PDF'. The form panel is automatically hidden so only the NOC document is printed.",
            },
          ],
        })}
      />
      <PageHeader
        title="NOC Generator"
        subtitle="Generate a No Objection Certificate for travel, job change, vehicle, or property — fill details and print."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "NOC Generator" }]}
      />
      <div className="mt-8">
        <NocGeneratorForm />
      </div>
    </main>
  );
}
