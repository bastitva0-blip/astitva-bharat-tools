import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ImageRotateForm } from "./image-rotate-form";

export const metadata: Metadata = {
  title: "Rotate & Flip Image Online — Fix Sideways Photos",
  description:
    "Rotate a photo by 90°, 180° or 270° and mirror it left–right or top–bottom. The pixels are rewritten, so portals that ignore EXIF orientation still show it correctly. Nothing is uploaded.",
  alternates: { canonical: "/image-rotate" },
};

export default function ImageRotatePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Image Rotate & Flip",
          description:
            "Rotate or mirror a photo in the browser and download the corrected image, with the orientation baked into the pixels.",
          path: "/image-rotate",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Image Rotate & Flip" }],
          steps: [
            { name: "Upload a photo", text: "JPG, PNG or WebP up to 25 MB." },
            { name: "Rotate or flip", text: "Quarter turns either way, plus horizontal and vertical mirror." },
            { name: "Check the preview", text: "The live preview matches the saved file exactly." },
            { name: "Download", text: "Orientation is written into the pixels, not just the metadata." },
          ],
          faqs: [
            {
              question: "Why does my photo look upright on my phone but sideways on the portal?",
              answer:
                "Phone cameras often store the picture sideways and add an EXIF orientation tag telling viewers to turn it. Gallery apps obey that tag; many government upload previews do not. Rotating here rewrites the actual pixels, so every viewer agrees.",
            },
            {
              question: "Does rotating lose quality?",
              answer:
                "A quarter turn moves pixels without resampling them, so the image itself is unchanged. A JPG is re-encoded once at high quality; PNG and WebP are re-encoded losslessly.",
            },
            {
              question: "What is the difference between rotate and flip?",
              answer:
                "Rotating turns the photo. Flipping mirrors it, which is what you need when a document was scanned through the back of the sheet or a selfie came out reversed. Flipping a photo of a person or a document is visible to anyone checking it — only use it when the original really is mirrored.",
            },
          ],
        })}
      />
      <PageHeader
        title="Rotate & Flip Image"
        subtitle="Quarter turns and mirroring, baked into the pixels so no portal can ignore it."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Image Rotate & Flip" }]}
      />
      <div className="mt-8">
        <ImageRotateForm />
      </div>
    </main>
  );
}
