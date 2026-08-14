import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ImageResizeForm } from "./image-resize-form";

export const metadata: Metadata = {
  title: "Image Resize — Resize Photos to Any Size Free, In Browser",
  description:
    "Resize any image to exact pixel dimensions or a percentage of the original. JPEG, PNG, WebP — runs entirely in your browser, nothing is uploaded.",
  keywords: [
    "image resize",
    "resize image online free",
    "resize photo to any size",
    "image resizer",
    "resize jpg online",
    "resize png online",
    "resize webp",
    "change image dimensions",
    "scale image by percentage",
    "photo resize tool",
  ],
  alternates: { canonical: "/image-resize" },
  openGraph: {
    title: "Image Resize — Resize Photos to Any Size Free, In Browser",
    description:
      "Resize any image to exact pixel dimensions or a percentage. JPEG, PNG, WebP supported. Runs in your browser — nothing is uploaded.",
    url: "https://bharattools.in/image-resize",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Resize — Resize Photos to Any Size Free, In Browser",
    description:
      "Resize any image to exact pixel dimensions or a percentage. JPEG, PNG, WebP. In-browser, free, no upload.",
  },
};

export default async function ImageResizePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Image Resize",
          description:
            "Resize any photo to exact pixel dimensions or a percentage of the original. Supports JPEG, PNG, and WebP. Runs entirely in your browser — the image is never uploaded.",
          path: "/image-resize",
          breadcrumbs: [
            { label: dict.common.home, href: "/" },
            { label: "Image Resize" },
          ],
          steps: [
            {
              name: "Upload an image",
              text: "Drop or choose a JPEG, PNG, or WebP file.",
            },
            {
              name: "Set target size",
              text: 'Choose "By pixels" and enter width and height, or switch to "By percentage" and pick a scale factor.',
            },
            {
              name: "Download the resized image",
              text: "Click Resize Image — the result downloads to your device immediately.",
            },
          ],
          featureList: [
            "Resize to exact pixel dimensions with optional aspect-ratio lock",
            "Scale by percentage from 1% to 200%",
            "Output as JPEG, PNG, WebP, or keep the original format",
            "Quality slider for JPEG and WebP output",
            "Runs entirely in your browser — no upload, no signup",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: [
            "image resize",
            "resize photo",
            "resize image online free",
            "change image dimensions",
            "scale image percentage",
            "resize jpg png webp",
          ],
          faqs: [
            {
              question: "Does resizing reduce the image quality?",
              answer:
                "Reducing dimensions below the original will always discard pixels — that is inherent to downscaling. Increasing dimensions (upscaling) uses bilinear interpolation via the browser's canvas engine, which keeps edges smooth but cannot recover detail that was not there. Set the quality slider to 90–100% to minimise additional compression loss on JPEG/WebP output.",
            },
            {
              question: "What is aspect ratio lock?",
              answer:
                "When locked (the default), changing the width automatically updates the height to keep the same proportions as the original image, and vice versa. Unlock it to set width and height independently.",
            },
            {
              question: "Is my photo uploaded to a server?",
              answer:
                "No. All processing happens inside your browser using the HTML Canvas API. The image never leaves your device.",
            },
          ],
        })}
      />

      <PageHeader
        title="Image Resize"
        subtitle="Resize any photo to exact pixel dimensions or a percentage — JPEG, PNG, WebP. Runs in your browser; nothing is uploaded."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Image Resize" },
        ]}
      />

      <div className="mt-8">
        <ImageResizeForm />
      </div>
    </main>
  );
}
