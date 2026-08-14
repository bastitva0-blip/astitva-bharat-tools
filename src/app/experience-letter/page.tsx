import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ExperienceLetterForm } from "./experience-letter-form";

const PAGE_TITLE = "Experience Letter Generator — Free Work Experience Certificate, Print Ready";
const PAGE_DESCRIPTION =
  "Generate a professional experience letter or work experience certificate instantly. Fill company and employee details, preview the letter live, and print or save as PDF. Free, runs entirely in your browser — no signup required.";
const PAGE_KEYWORDS = [
  "experience letter generator",
  "work experience certificate",
  "experience letter format india",
  "employment certificate generator",
  "experience letter online free",
  "relieving letter format",
  "experience certificate format",
  "experience letter kaise banaye",
  "work experience letter pdf",
  "employee experience letter india",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/experience-letter",
    languages: {
      "en-IN": "/experience-letter",
      "hi-IN": "/experience-letter",
      "x-default": "/experience-letter",
    },
  },
  openGraph: {
    type: "website",
    url: "/experience-letter",
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

export default function ExperienceLetterPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Experience Letter Generator",
          description:
            "Generate a professional experience letter or work experience certificate. Fill company and employee details, preview the letter live and print or save as PDF.",
          path: "/experience-letter",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Experience Letter Generator" }],
          steps: [
            { name: "Enter company details", text: "Fill in the company name, letterhead, and address." },
            { name: "Fill employee details", text: "Enter the employee name, designation, department, joining and last working dates." },
            { name: "Print or save as PDF", text: "Click Print / Save as PDF. In the print dialog select Save as PDF to download a ready-to-sign experience letter." },
          ],
          featureList: [
            "Professional experience letter with company letterhead",
            "Auto-calculates tenure from joining and last working dates",
            "Pronoun selection for he/she/they",
            "Optional reason-for-leaving line",
            "Live preview — WYSIWYG updates as you type",
            "Print-ready A4 format — use browser Save as PDF",
            "100% on-device — no upload, no signup, no data stored",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is the generated experience letter legally valid?",
              answer:
                "The format follows standard professional conventions used in India. For legal validity the letter should be printed on company letterhead, signed by the authorised signatory, and stamped with the company seal if applicable.",
            },
            {
              question: "How is the tenure calculated?",
              answer:
                "The tool automatically calculates the total tenure in years and months from the joining date to the last working date you enter. It formats it naturally, e.g. '2 years 4 months'.",
            },
            {
              question: "How do I save the letter as a PDF?",
              answer:
                "Click the 'Print / Save as PDF' button. In the print dialog set the destination to 'Save as PDF'. The form panel is automatically hidden so only the letter document is printed.",
            },
          ],
        })}
      />
      <PageHeader
        title="Experience Letter Generator"
        subtitle="Generate a professional work experience certificate — fill details, preview and print."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Experience Letter Generator" }]}
      />
      <div className="mt-8">
        <ExperienceLetterForm />
      </div>
    </main>
  );
}
