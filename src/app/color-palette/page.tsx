import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ColorPaletteForm } from "./color-palette-form";

const PAGE_TITLE = "Color Palette Extractor — Extract Colors from Any Image Free";
const PAGE_DESCRIPTION =
  "Upload any image and instantly extract a dominant 10-color palette. Copy colors as CSS variables, Tailwind config, or a plain hex list. Runs entirely in your browser — nothing uploaded.";
const PAGE_KEYWORDS = [
  "color palette extractor",
  "extract color palette from image",
  "image color palette generator",
  "dominant colors from image",
  "css variables from image",
  "tailwind colors from image",
  "hex palette generator",
  "color scheme extractor",
  "palette from photo",
  "color picker palette",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/color-palette",
    languages: {
      "en-IN": "/color-palette",
      "hi-IN": "/color-palette",
      "x-default": "/color-palette",
    },
  },
  openGraph: {
    type: "website",
    url: "/color-palette",
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

export default async function ColorPalettePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Color Palette Extractor",
          description:
            "Upload any image to extract its 10 most dominant colors. Export the palette as CSS variables, a Tailwind config snippet, or a plain hex list. Fully client-side.",
          path: "/color-palette",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Color Palette Extractor" },
          ],
          steps: [
            {
              name: "Upload an image",
              text: "Drop or select any image — JPG, PNG, WebP, GIF, or SVG.",
            },
            {
              name: "Extract the palette",
              text: "The tool samples pixels from the image and groups similar colors to produce the 10 most dominant colors.",
            },
            {
              name: "Copy and use",
              text: "Copy the palette as CSS variables, a Tailwind config block, or a plain comma-separated hex list.",
            },
          ],
          featureList: [
            "Extracts top 10 dominant colors from any image",
            "Export as CSS custom properties (--color-1: #hex)",
            "Export as Tailwind config color tokens",
            "Export as plain comma-separated hex list",
            "One-click copy for each export format",
            "Works with JPG, PNG, WebP, GIF, SVG",
            "100% in-browser — nothing uploaded to a server",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "How does the color extraction work?",
              answer:
                "The tool draws the image onto an offscreen canvas, samples 1000 random pixels, and groups similar RGB values into 32-step buckets. The 10 most frequent color buckets become your palette.",
            },
            {
              question: "What export formats are supported?",
              answer:
                "You can copy the palette as CSS variables (--color-1: #hex), a Tailwind config colors object, or a plain comma-separated hex list.",
            },
            {
              question: "Is my image uploaded anywhere?",
              answer:
                "No. All processing happens in your browser using the Canvas API. Your image never leaves your device.",
            },
          ],
        })}
      />
      <PageHeader
        title="Color Palette Extractor"
        subtitle="Upload any image to pull out its dominant colors. Export as CSS, Tailwind, or hex."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Color Palette Extractor" },
        ]}
      />
      <div className="mt-8">
        <ColorPaletteForm />
      </div>
    </main>
  );
}
