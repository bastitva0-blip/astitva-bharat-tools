import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ImageCropForm } from "./image-crop-form";

export const metadata: Metadata = {
  title: "Crop Image Online — Free Crop or Locked Aspect Ratio",
  description:
    "Crop a photo freehand or lock it to 1:1, 4:3, 3:4, 16:9 or the 3.5:4.5 passport proportion. Runs in your browser — the photo is never uploaded.",
  alternates: { canonical: "/image-crop" },
};

export default function ImageCropPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Image Cropper",
          description:
            "Crop any photo freehand or to a locked aspect ratio and download the result, without uploading it anywhere.",
          path: "/image-crop",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Image Cropper" }],
          steps: [
            { name: "Upload a photo", text: "JPG, PNG or WebP up to 25 MB." },
            { name: "Choose an aspect", text: "Free, or locked to 1:1, 4:3, 3:4, 16:9, 3.5:4.5." },
            { name: "Drag the crop box", text: "The selection size in original pixels is shown live." },
            { name: "Download", text: "PNG and WebP keep transparency; everything else saves as JPG." },
          ],
          faqs: [
            {
              question: "Does cropping reduce the quality of my photo?",
              answer:
                "The pixels you keep are copied at their original resolution — nothing is scaled down. A JPG is re-encoded once at high quality, which is visually lossless; PNG and WebP are re-encoded losslessly.",
            },
            {
              question: "Which aspect ratio do I need for a passport or exam photo?",
              answer:
                "3.5:4.5 — that is the 3.5 cm × 4.5 cm proportion nearly every Indian ID and exam photo uses. If you need an exact pixel size and KB limit as well, use the Exam Photo Resizer instead: it crops and hits the portal's spec in one step.",
            },
            {
              question: "Can I crop a transparent PNG without losing the transparency?",
              answer:
                "Yes. A PNG input stays a PNG and keeps its alpha channel. Only JPG output flattens transparency, and it flattens to white rather than black.",
            },
          ],
        })}
      />
      <PageHeader
        title="Crop Image"
        subtitle="Freehand, or locked to a ratio. Drag the box, download the crop — nothing leaves your device."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Image Cropper" }]}
      />
      <div className="mt-8">
        <ImageCropForm />
      </div>
    </main>
  );
}
