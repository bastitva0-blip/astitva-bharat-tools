import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ImageToBase64Form } from "./image-to-base64-form";

const PAGE_TITLE = "Image to Base64 Converter — Encode & Decode Free";
const PAGE_DESCRIPTION =
  "Convert any image to a Base64 string or decode a Base64 string back to an image. Works in your browser — no upload, no signup. Supports JPG, PNG, WebP, GIF and more.";
const PAGE_KEYWORDS = [
  "image to base64",
  "base64 encode image",
  "base64 decode image",
  "convert image base64 online",
  "base64 string to image",
  "image encoder decoder",
  "base64 image converter free",
  "data uri generator",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/image-to-base64",
    languages: {
      "en-IN": "/image-to-base64",
      "hi-IN": "/image-to-base64",
      "x-default": "/image-to-base64",
    },
  },
  openGraph: {
    type: "website",
    url: "/image-to-base64",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default async function ImageToBase64Page() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Image to Base64 Converter",
          description:
            "Convert any image to a Base64 encoded string or decode a Base64 string back to a viewable and downloadable image — entirely in your browser.",
          path: "/image-to-base64",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Image to Base64" }],
          steps: [
            { name: "Choose a mode", text: "Select the Encode tab to convert an image to Base64, or the Decode tab to convert Base64 back to an image." },
            { name: "Upload or paste", text: "In Encode mode drop your image file. In Decode mode paste your Base64 string." },
            { name: "Copy or download", text: "Copy the Base64 string to clipboard, or download the decoded image." },
          ],
          featureList: [
            "Encode any image (JPG, PNG, WebP, GIF, SVG) to Base64",
            "Decode any Base64 string back to a viewable image",
            "Full data URI output for direct CSS/HTML embedding",
            "Character count and approximate size display",
            "One-click copy to clipboard",
            "100% in-browser — nothing uploaded",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What is a Base64 encoded image?",
              answer:
                "Base64 encoding converts binary image data into a text string of ASCII characters. The result can be embedded directly in HTML, CSS, or JSON without needing a separate file or URL.",
            },
            {
              question: "How do I use a Base64 string in HTML?",
              answer:
                "Use the full data URI as the src attribute: <img src=\"data:image/png;base64,iVBORw0K...\">. The tool outputs the complete data URI ready to paste.",
            },
          ],
        })}
      />
      <PageHeader
        title="Image to Base64 Converter"
        subtitle="Encode an image to Base64 or decode a Base64 string back to an image — in your browser."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Image to Base64" }]}
      />
      <div className="mt-8">
        <ImageToBase64Form />
      </div>
    </main>
  );
}
