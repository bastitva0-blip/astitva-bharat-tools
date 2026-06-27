import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { HeicToJpgForm } from "./heic-to-jpg-form";
import { toolPageSchema } from "@/lib/seo/tool-schema";

export const metadata: Metadata = {
  title: "HEIC to JPG Converter — iPhone photos for Indian portals",
  description:
    "Indian government portals reject HEIC. Convert iPhone HEIC photos to JPG in your browser — no upload, no app, no signup.",
  alternates: { canonical: "/heic-to-jpg" },
};

export default function HeicToJpgPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "HEIC to JPG Converter",
          description:
            "Convert iPhone HEIC photos to JPG so Indian government and exam portals accept them. Runs entirely in your browser.",
          path: "/heic-to-jpg",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "HEIC to JPG Converter" },
          ],
          steps: [
            { name: "Drop a HEIC photo", text: "Straight from your iPhone or Mac Photos export." },
            { name: "Convert", text: "Decoded on your device. Nothing uploaded." },
            { name: "Download the JPG", text: "Portal-ready, with the same image quality." },
          ],
        })}
      />
      <PageHeader
        title="HEIC to JPG Converter"
        subtitle="Indian portals reject HEIC. Drop an iPhone photo — get a JPG. In your browser, nothing uploaded."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "HEIC to JPG Converter" }]}
      />
      <div className="mt-8">
        <HeicToJpgForm />
      </div>
    </main>
  );
}
