import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfMetadataForm } from "./pdf-metadata-form";

const PAGE_TITLE = "PDF Metadata Editor — View and Edit PDF Title, Author & More";
const PAGE_DESCRIPTION =
  "View and edit the hidden metadata of any PDF — title, author, subject, keywords, and creator. Changes are saved instantly to a new PDF download. Runs entirely in your browser, no upload needed.";
const PAGE_KEYWORDS = [
  "PDF metadata editor",
  "edit PDF title",
  "edit PDF author",
  "PDF properties editor",
  "change PDF metadata",
  "remove PDF author",
  "PDF metadata online",
  "PDF metadata no upload",
  "PDF info editor India",
  "BharatTools PDF metadata",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/pdf-metadata",
    languages: {
      "en-IN": "/pdf-metadata",
      "hi-IN": "/pdf-metadata",
      "x-default": "/pdf-metadata",
    },
  },
  openGraph: {
    type: "website",
    url: "/pdf-metadata",
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

export default async function PdfMetadataPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Metadata Editor",
          description:
            "Open a PDF, read its embedded metadata fields — title, author, subject, keywords, creator — edit them, and download the updated PDF. Everything runs in your browser.",
          path: "/pdf-metadata",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Metadata Editor" }],
          steps: [
            { name: "Upload a PDF", text: "Drop or select any PDF." },
            { name: "Edit fields", text: "Update title, author, subject, keywords, or creator." },
            { name: "Download", text: "Save the updated PDF with the new metadata." },
          ],
          featureList: [
            "Reads existing title, author, subject, keywords, and creator",
            "Edit any or all metadata fields",
            "Download updated PDF instantly",
            "100% on-device — no upload, no signup",
            "Works on mobile and desktop",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What metadata can I edit?",
              answer:
                "You can edit the five standard PDF document information fields: Title, Author, Subject, Keywords, and Creator. These are stored in the PDF's document information dictionary.",
            },
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The PDF is processed entirely in your browser using pdf-lib. Your file never leaves your device.",
            },
            {
              question: "Will editing metadata change the visual content of the PDF?",
              answer:
                "No. Metadata fields are stored separately from the page content. Changing them has no effect on the text, images, or layout of your PDF.",
            },
          ],
        })}
      />
      <PageHeader
        title="PDF Metadata Editor"
        subtitle="View and edit the title, author, subject, keywords, and creator stored inside a PDF. Download the updated file instantly."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "PDF Metadata Editor" }]}
      />
      <div className="mt-8">
        <PdfMetadataForm />
      </div>
    </main>
  );
}
