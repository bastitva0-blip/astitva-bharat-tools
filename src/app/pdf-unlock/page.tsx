import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfUnlockForm } from "./pdf-unlock-form";

const PAGE_TITLE = "Unlock PDF — Remove Password Free, In Browser";
const PAGE_DESCRIPTION =
  "Remove a password from any PDF instantly in your browser. Enter the owner password and download an unlocked copy — your file never touches a server. Free, no signup.";
const PAGE_KEYWORDS = [
  "unlock PDF online",
  "remove PDF password",
  "PDF password remover India",
  "decrypt PDF in browser",
  "unlock PDF no upload",
  "remove PDF encryption",
  "PDF unlocker free",
  "open password protected PDF",
  "BharatTools PDF unlock",
  "PDF password hatao",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-unlock",
    languages: { "en-IN": "/pdf-unlock", "hi-IN": "/pdf-unlock", "x-default": "/pdf-unlock" },
  },
  openGraph: {
    type: "website",
    url: "/pdf-unlock",
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

export default async function PdfUnlockPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Unlock",
          description:
            "Remove a password from any PDF entirely in your browser. Enter the owner password, download an unlocked copy. Free, no signup, no upload — everything runs on-device.",
          path: "/pdf-unlock",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Unlock" }],
          steps: [
            { name: "Upload your PDF", text: "Drop the password-protected PDF you want to unlock." },
            { name: "Enter the password", text: "Type the current password for the PDF." },
            { name: "Download unlocked PDF", text: "Get the unlocked file — nothing is uploaded to any server." },
          ],
          featureList: [
            "Removes PDF password restriction in your browser",
            "Detects non-protected PDFs automatically",
            "Show/hide password toggle",
            "100% on-device — no upload, no signup",
            "Works on mobile and desktop",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The PDF is decrypted entirely in your browser using pdf-lib. Your file never leaves your device.",
            },
            {
              question: "What if I don't know the PDF password?",
              answer:
                "This tool requires the correct password to unlock the PDF. It cannot brute-force or bypass encryption — you must have the password the file was protected with.",
            },
            {
              question: "What if my PDF is not password-protected?",
              answer:
                "Leave the password field blank and click Unlock PDF. The tool will detect that the file is not encrypted and let you download a clean copy.",
            },
          ],
        })}
      />
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_DESCRIPTION}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "PDF Unlock" }]}
      />
      <div className="mt-8">
        <PdfUnlockForm />
      </div>
    </main>
  );
}
