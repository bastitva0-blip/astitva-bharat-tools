import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PdfRotateForm } from "./pdf-rotate-form";

export const metadata: Metadata = {
  title: "Rotate PDF Pages — Fix Sideways Scans",
  description:
    "Turn one page or every page of a PDF by 90°, 180° or 270° and save it. No re-encoding, no quality loss, and the PDF never leaves your browser.",
  alternates: { canonical: "/pdf-rotate" },
};

export default function PdfRotatePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "PDF Page Rotator",
          description:
            "Rotate individual pages or a whole PDF and download the corrected file, entirely in your browser.",
          path: "/pdf-rotate",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "PDF Page Rotator" }],
          steps: [
            { name: "Upload a PDF", text: "Up to 50 MB. Page previews are drawn on your device." },
            { name: "Turn the pages", text: "Rotate one page at a time, or every page at once." },
            { name: "Save", text: "Download the corrected PDF — page content is untouched." },
          ],
          faqs: [
            {
              question: "Does rotating a PDF reduce its quality?",
              answer:
                "No. Rotation only rewrites the page's orientation flag; the text and images inside the page are copied across byte-for-byte. The output is the same quality as the input.",
            },
            {
              question: "Why does my scan open sideways on the portal but look fine on my phone?",
              answer:
                "Phone galleries often apply the orientation stored in the file's metadata while portals ignore it. Rotating the pages here writes the correct orientation into the PDF itself, so every viewer shows it the same way.",
            },
            {
              question: "Can I rotate only some pages?",
              answer:
                "Yes. Each page preview has its own left and right buttons, so you can fix a single sideways page in an otherwise correct document.",
            },
          ],
        })}
      />
      <PageHeader
        title="Rotate PDF Pages"
        subtitle="Fix a sideways scan — one page or all of them. No re-encoding, no upload."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "PDF Page Rotator" }]}
      />
      <div className="mt-8">
        <PdfRotateForm />
      </div>
    </main>
  );
}
