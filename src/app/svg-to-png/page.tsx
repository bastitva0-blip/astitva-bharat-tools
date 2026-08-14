import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { SvgToPngForm } from "./svg-to-png-form";

const PAGE_TITLE = "SVG to PNG Converter — Free Online Tool";
const PAGE_DESCRIPTION =
  "Convert SVG files to PNG images at any resolution. Upload an SVG file or paste SVG code, set width, height, and scale multiplier. Works entirely in your browser — no upload to server.";
const PAGE_KEYWORDS = [
  "svg to png",
  "convert svg to png",
  "svg to png online",
  "svg converter",
  "vector to raster",
  "svg export png",
  "svg to image",
  "free svg converter",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/svg-to-png",
    languages: {
      "en-IN": "/svg-to-png",
      "hi-IN": "/svg-to-png",
      "x-default": "/svg-to-png",
    },
  },
  openGraph: {
    type: "website",
    url: "/svg-to-png",
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

export default async function SvgToPngPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "SVG to PNG Converter",
          description:
            "Convert SVG vector files to PNG raster images at any resolution, entirely in your browser.",
          path: "/svg-to-png",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "SVG to PNG" }],
          steps: [
            {
              name: "Upload or paste SVG",
              text: "Upload an SVG file from your device or paste SVG code directly into the editor.",
            },
            {
              name: "Set dimensions and scale",
              text: "Choose the output width, height, and scale multiplier (1x, 2x, 3x, 4x). Optionally set a white background.",
            },
            {
              name: "Convert and download",
              text: "Click Convert to PNG and download the resulting PNG image.",
            },
          ],
          featureList: [
            "Upload SVG file or paste SVG code",
            "Set custom width and height",
            "Scale multiplier up to 4x for high-DPI output",
            "Transparent or white background",
            "Live PNG preview before download",
            "100% in-browser — nothing sent to server",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Can I convert SVG with embedded fonts or images?",
              answer:
                "Yes, as long as the fonts and images are either embedded inline in the SVG or accessible from the same origin. External resource references may not render correctly due to browser security restrictions.",
            },
            {
              question: "What does the scale multiplier do?",
              answer:
                "The scale multiplier increases the canvas resolution. A 2x scale on a 200×200 SVG produces a 400×400 PNG, giving you a sharper image suitable for retina displays.",
            },
          ],
        })}
      />
      <PageHeader
        title="SVG to PNG Converter"
        subtitle="Convert any SVG to a high-resolution PNG — choose dimensions, scale, and background."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "SVG to PNG" }]}
      />
      <div className="mt-8">
        <SvgToPngForm />
      </div>
    </main>
  );
}
