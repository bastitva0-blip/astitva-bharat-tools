import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { ImageToTextForm } from "./image-to-text-form";
import { toolPageSchema } from "@/lib/seo/tool-schema";

export const metadata: Metadata = {
  title: "Image to Text (OCR) — Extract text from a photo, in your browser",
  description:
    "Pull copyable text out of an image or scan — English and Hindi. Runs entirely on your device; nothing is uploaded.",
  alternates: { canonical: "/image-to-text" },
};

export default function ImageToTextPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Image to Text (OCR)",
          description:
            "Extract selectable, copyable text from an image in English or Hindi, entirely in your browser.",
          path: "/image-to-text",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Image to Text (OCR)" },
          ],
          steps: [
            { name: "Pick a language", text: "Choose English, Hindi, or both." },
            { name: "Drop an image", text: "Upload a photo or scan that contains text." },
            { name: "Copy the text", text: "Recognized text appears below — copy it or download it as a .txt file." },
          ],
        })}
      />
      <PageHeader
        title="Image to Text (OCR)"
        subtitle="Extract copyable text from a photo or scan. English and Hindi. Nothing uploaded."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Image to Text (OCR)" }]}
      />
      <div className="mt-8">
        <ImageToTextForm />
      </div>
    </main>
  );
}
