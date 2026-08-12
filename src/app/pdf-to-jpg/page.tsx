import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfToJpgForm } from "./pdf-to-jpg-form";

export const metadata: Metadata = {
  title: "PDF to JPG Converter — Every Page as an Image",
  description:
    "Convert a PDF into JPG or PNG images, one per page, at 72, 150 or 300 DPI. Runs entirely in your browser — the PDF is never uploaded.",
  alternates: { canonical: "/pdf-to-jpg" },
};

export default function PdfToJpgPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF to JPG Converter",
          description:
            "Turn each page of a PDF into a JPG or PNG image at your chosen resolution, without uploading the file anywhere.",
          path: "/pdf-to-jpg",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF to JPG Converter" }],
          steps: [
            { name: "Upload a PDF", text: "Up to 50 MB. It stays on your device." },
            { name: "Pick format and resolution", text: "JPG or PNG, at 72, 150 or 300 DPI." },
            { name: "Convert", text: "Every page is rendered to its own image." },
            { name: "Download", text: "Save one page or all of them at once." },
          ],
          faqs: [
            {
              question: "Is my PDF uploaded to a server?",
              answer:
                "No. The PDF is rendered by your own browser using a local copy of the PDF engine. Open DevTools and watch the Network tab while you convert — no request carries your file.",
            },
            {
              question: "Which DPI should I choose for a government portal upload?",
              answer:
                "150 DPI is the right default: text stays readable at full size and the file stays small enough for most upload caps. Use 300 DPI only when the page will be printed or run through OCR, and 72 DPI when you just need a small proof image.",
            },
            {
              question: "Can it convert a password-protected PDF?",
              answer:
                "No. A PDF that is encrypted — such as an e-Aadhaar download — has to be opened with its password first. Remove the password in your PDF reader, save an unprotected copy, then convert that.",
            },
          ],
        })}
      />
      <PageHeader
        title="PDF to JPG Converter"
        subtitle="Every page becomes its own image — JPG or PNG, at the resolution you pick. Nothing leaves your device."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "PDF to JPG Converter" }]}
      />
      <div className="mt-8">
        <PdfToJpgForm />
      </div>
    </main>
  );
}
