import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { ImageFormatConvertForm } from "./image-format-convert-form";
import { toolPageSchema } from "@/lib/seo/tool-schema";

export const metadata: Metadata = {
  title: "Image Format Converter — JPG, PNG, WebP",
  description:
    "Convert between JPG, PNG and WebP in your browser. Files never leave your device. JPG output flattens transparency to white for portal compatibility.",
  alternates: { canonical: "/image-format-convert" },
};

export default function ImageFormatConvertPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Image Format Converter",
          description:
            "Convert between JPG, PNG and WebP in your browser. No upload, no server.",
          path: "/image-format-convert",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Image Format Converter" },
          ],
          steps: [
            { name: "Upload an image", text: "JPG, PNG, WebP or HEIC up to 25 MB." },
            { name: "Pick a target format", text: "JPG (portals), PNG (transparency), WebP (smaller size)." },
            { name: "Convert", text: "Re-encoded entirely in your browser." },
            { name: "Download", text: "Save the converted file." },
          ],
        })}
      />
      <PageHeader
        title="Image Format Converter"
        subtitle="JPG ↔ PNG ↔ WebP, in your browser. Files never leave your device."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Image Format Converter" }]}
      />
      <div className="mt-8">
        <ImageFormatConvertForm />
      </div>
    </main>
  );
}
