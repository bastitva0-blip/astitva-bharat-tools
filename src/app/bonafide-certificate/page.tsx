import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { BonafideCertificateForm } from "./bonafide-certificate-form";

const PAGE_TITLE = "Bonafide Certificate Generator — Free School, College & Employment Certificate";
const PAGE_DESCRIPTION =
  "Generate a bonafide certificate instantly for students (school/college) or employees. Fill institution details, certifying officer, and purpose — preview and print or save as PDF. Free, runs in your browser, no signup required.";
const PAGE_KEYWORDS = [
  "bonafide certificate generator",
  "bonafide certificate format india",
  "bonafide certificate online free",
  "student bonafide certificate",
  "school bonafide certificate",
  "college bonafide certificate",
  "employment bonafide certificate",
  "bonafide certificate for bank account",
  "bonafide certificate for visa",
  "bonafide certificate for scholarship",
  "bonafide certificate kaise banaye",
  "bonafide letter format",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/bonafide-certificate",
    languages: {
      "en-IN": "/bonafide-certificate",
      "hi-IN": "/bonafide-certificate",
      "x-default": "/bonafide-certificate",
    },
  },
  openGraph: {
    type: "website",
    url: "/bonafide-certificate",
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

export default async function BonafideCertificatePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-7xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Bonafide Certificate Generator",
          description:
            "Generate a bonafide certificate for students or employees. Fill institution details, certifying officer info, and purpose — preview and print or save as PDF.",
          path: "/bonafide-certificate",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Bonafide Certificate Generator" }],
          steps: [
            { name: "Select certificate type", text: "Choose between Student certificate (school/college) or Employee certificate." },
            { name: "Fill in details", text: "Enter institution name, address, certifying officer details, and the student or employee information." },
            { name: "Print or save as PDF", text: "Click Print / Save as PDF. In the print dialog select Save as PDF to download a ready-to-sign certificate." },
          ],
          featureList: [
            "Student and Employee bonafide certificate templates",
            "Official letterhead layout with institution details",
            "Live preview — WYSIWYG updates as you type",
            "Multiple purpose options: bank account, visa, scholarship, admission and more",
            "Signature block with seal placeholder",
            "Print-ready A4 format — use browser Save as PDF",
            "100% on-device — no upload, no signup, no data stored",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is this bonafide certificate legally valid?",
              answer:
                "The format follows standard bonafide certificate conventions used in India. For official use, the certificate must be printed on institution/company letterhead, signed by the authorised officer, and stamped with the official seal. This tool generates the text and layout — the authorised signature and seal are added separately.",
            },
            {
              question: "Can I use this for both students and employees?",
              answer:
                "Yes. The tool has two modes — Student (for school or college certificates with course, year/batch fields) and Employee (with designation and department fields). Switch between them using the toggle at the top.",
            },
            {
              question: "How do I save the certificate as a PDF?",
              answer:
                "Click the 'Print / Save as PDF' button. In the print dialog set the destination to 'Save as PDF'. The form panel is automatically hidden so only the certificate is printed.",
            },
          ],
        })}
      />
      <PageHeader
        title="Bonafide Certificate Generator"
        subtitle="Generate a bonafide certificate for students or employees — fill details, preview and print."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Bonafide Certificate Generator" }]}
      />
      <div className="mt-8">
        <BonafideCertificateForm />
      </div>
    </main>
  );
}
