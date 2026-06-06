import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { PhotoGrayscaleForm } from "./photo-grayscale-form";
import { toolPageSchema } from "@/lib/seo/tool-schema";

export const metadata: Metadata = {
  title: "Photo Grayscale Converter — Colour to B&W",
  description:
    "Convert a colour photo to clean grayscale in your browser. Drag the slider to compare before and after. JPG download.",
  alternates: { canonical: "/photo-grayscale" },
};

export default function PhotoGrayscalePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Photo Grayscale Converter",
          description: "Convert colour photos to black and white in your browser. No upload.",
          path: "/photo-grayscale",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Photo Grayscale Converter" },
          ],
          steps: [
            { name: "Upload a photo", text: "JPG, PNG or HEIC up to 25 MB." },
            { name: "Apply", text: "Perceptual BT.709 luminance conversion." },
            { name: "Compare", text: "Drag the divider to see before vs after." },
            { name: "Download", text: "Save the JPG." },
          ],
        })}
      />
      <PageHeader
        title="Photo Grayscale Converter"
        subtitle="Colour to clean black & white. Drag the slider on the result to compare."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Photo Grayscale Converter" }]}
      />
      <div className="mt-8">
        <PhotoGrayscaleForm />
      </div>
    </main>
  );
}
