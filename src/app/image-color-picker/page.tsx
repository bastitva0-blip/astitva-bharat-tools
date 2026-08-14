import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ImageColorPickerForm } from "./image-color-picker-form";

const PAGE_TITLE = "Image Color Picker — Pick Colors & Extract Palette Free";
const PAGE_DESCRIPTION =
  "Upload any image and click anywhere to pick the exact color at that pixel. Also extracts a 10-color dominant palette. See HEX, RGB and HSL values instantly. Works in your browser, nothing uploaded.";
const PAGE_KEYWORDS = [
  "image color picker",
  "pick color from image",
  "color picker online",
  "extract color palette from image",
  "image color extractor",
  "hex color from image",
  "rgb from image",
  "dominant color extractor",
  "color palette generator",
  "eyedropper tool online",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/image-color-picker",
    languages: {
      "en-IN": "/image-color-picker",
      "hi-IN": "/image-color-picker",
      "x-default": "/image-color-picker",
    },
  },
  openGraph: {
    type: "website",
    url: "/image-color-picker",
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

export default async function ImageColorPickerPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Image Color Picker",
          description:
            "Upload an image and click any pixel to instantly read its HEX, RGB, and HSL color values. Also extracts a dominant 10-color palette from the image automatically.",
          path: "/image-color-picker",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Image Color Picker" }],
          steps: [
            { name: "Upload an image", text: "Drop or select any image — JPG, PNG, WebP, GIF or SVG." },
            { name: "Click to pick a color", text: "Click anywhere on the displayed image to read the exact pixel color in HEX, RGB, and HSL." },
            { name: "Copy and use", text: "Click the copy buttons next to any color value. The palette panel shows the 10 dominant colors extracted from the image." },
          ],
          featureList: [
            "Click any pixel to get its exact HEX, RGB, and HSL values",
            "Automatic 10-color dominant palette extraction",
            "One-click copy for every color format",
            "Live color swatch preview",
            "Works with JPG, PNG, WebP, GIF, SVG",
            "100% in-browser — nothing uploaded to a server",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "How do I pick a color from an image?",
              answer:
                "Upload your image using the file picker or by dropping it onto the canvas. Then click any spot on the image to instantly see the HEX, RGB, and HSL values of that pixel.",
            },
            {
              question: "How is the color palette generated?",
              answer:
                "The tool samples 500 random pixels from the image, groups similar colors into buckets, and returns the 10 most frequent color clusters as the dominant palette.",
            },
          ],
        })}
      />
      <PageHeader
        title="Image Color Picker"
        subtitle="Click any pixel to get HEX, RGB and HSL. Auto-extracts a 10-color palette from your image."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Image Color Picker" }]}
      />
      <div className="mt-8">
        <ImageColorPickerForm />
      </div>
    </main>
  );
}
