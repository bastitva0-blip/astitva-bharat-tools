import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfPasswordForm } from "./pdf-password-form";

const PAGE_TITLE = "PDF Password Protect — Encrypt Before You Send";
const PAGE_DESCRIPTION =
  "Add a password to any PDF before emailing it to a client. Encryption runs in your browser — the file never touches a server.";
const PAGE_KEYWORDS = [
  "PDF password protect",
  "encrypt PDF online",
  "password protect PDF India",
  "PDF encrypt in browser",
  "secure PDF before sending",
  "PDF password no upload",
  "protect PDF file",
  "BharatTools PDF password",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-password",
    languages: { "en-IN": "/pdf-password", "hi-IN": "/pdf-password", "x-default": "/pdf-password" },
  },
  openGraph: {
    type: "website",
    url: "/pdf-password",
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

export default async function PdfPasswordPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Password Protect",
          description:
            "Add a password to any PDF in your browser. Encryption runs entirely on-device — the file never leaves your device. Free, no signup required.",
          path: "/pdf-password",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Password" }],
          steps: [
            { name: "Upload your PDF", text: "Drop the file you want to protect." },
            { name: "Set a password", text: "Choose a password — share it separately with the recipient." },
            { name: "Download encrypted PDF", text: "Get the password-protected file, nothing uploaded." },
          ],
          featureList: [
            "AES-256 PDF encryption",
            "Runs 100% in your browser — no upload, no signup",
            "Show/hide password toggle",
            "Configurable permissions (no copying, no editing)",
            "Works on mobile and desktop",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The PDF is encrypted entirely in your browser using pdf-lib. Your file never leaves your device.",
            },
            {
              question: "What encryption does this use?",
              answer:
                "The tool uses AES-256 encryption as implemented by pdf-lib, which is the current standard for PDF security.",
            },
            {
              question: "Can I open the protected PDF on any device?",
              answer:
                "Yes. Any standard PDF reader — Adobe Acrobat, Preview on Mac, or a phone PDF viewer — will prompt for the password you set.",
            },
          ],
          note: "The PDF is encrypted in your browser. Your file never leaves your device.",
        })}
      />
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_DESCRIPTION}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "PDF Password" }]}
      />
      <div className="mt-8">
        <PdfPasswordForm />
      </div>
    </main>
  );
}
