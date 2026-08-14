import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ImageWatermarkForm } from "./image-watermark-form";

export const metadata: Metadata = {
  title: "Image Watermark — Add Text to Photos Free, In Browser",
  description:
    "Add a custom text watermark to any photo — diagonal tiling, corner placement, adjustable opacity and color. Runs entirely in your browser; your image is never uploaded.",
  keywords: [
    "image watermark",
    "add watermark to photo",
    "watermark image online",
    "text watermark",
    "photo watermark free",
    "watermark jpg png",
  ],
  openGraph: {
    title: "Image Watermark — Add Text to Photos Free, In Browser",
    description:
      "Add a custom text watermark to any photo. Diagonal tiling, corner placement, adjustable opacity and color. Nothing is uploaded.",
    url: "/image-watermark",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Watermark — Add Text to Photos Free, In Browser",
    description:
      "Add a custom text watermark to any photo in your browser. No upload, no account.",
  },
  alternates: { canonical: "/image-watermark" },
};

export default function ImageWatermarkPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Image Watermark",
          description:
            "Add a custom text watermark to any JPEG, PNG, or WebP photo. Choose diagonal tiling or a corner position, set opacity, font size, and color. Everything runs in your browser — your image is never uploaded.",
          path: "/image-watermark",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Image Watermark" }],
          applicationSubCategory: "UtilitiesApplication",
          featureList: [
            "Diagonal tiled watermark pattern across the whole image",
            "Six placement options: center diagonal, center, four corners",
            "Opacity from 5% to 80%",
            "Four font sizes: Small, Medium, Large, XL",
            "Four colors: White, Black, Gray, Red",
            "Full-resolution PNG download — no quality loss",
            "Runs entirely in your browser — image never uploaded",
          ],
          keywords: [
            "image watermark",
            "add watermark to photo",
            "watermark image online free",
            "text watermark photo",
            "diagonal watermark",
            "watermark jpg png webp",
            "browser watermark tool",
          ],
          steps: [
            {
              name: "Upload your photo",
              text: "Drag and drop or click to upload a JPEG, PNG, or WebP image.",
            },
            {
              name: "Set watermark options",
              text: "Type your watermark text, choose position, opacity, font size, and color. The preview updates live.",
            },
            {
              name: "Download",
              text: "Click Download to save a full-resolution PNG with the watermark applied.",
            },
          ],
          faqs: [
            {
              question: "Is my image uploaded to any server?",
              answer:
                "No. Everything — the watermark drawing, the canvas export — happens entirely in your browser using the HTML Canvas API. Your image never leaves your device.",
            },
            {
              question: "Which image formats are supported?",
              answer:
                "JPEG, PNG, and WebP. The downloaded result is always a PNG so transparency is preserved and there is no additional compression loss.",
            },
            {
              question: "What does the Center Diagonal option do?",
              answer:
                "It tiles your watermark text repeatedly across the entire image at a 45° angle, creating a pattern that is harder to crop out than a single corner watermark.",
            },
            {
              question: "Can I change the watermark color to match my brand?",
              answer:
                "You can choose White, Black, Gray, or Red. For the best visibility on most photos, White at 30% opacity works well on dark subjects, and Black at 30% on light backgrounds.",
            },
          ],
        })}
      />
      <PageHeader
        title="Image Watermark"
        subtitle="Add a text watermark to any photo. Choose diagonal tiling or a corner, adjust opacity and color, then download — nothing is uploaded."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Image Watermark" }]}
      />
      <div className="mt-8">
        <ImageWatermarkForm />
      </div>
    </main>
  );
}
