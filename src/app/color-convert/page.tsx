import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ColorConvertForm } from "./color-convert-form";

const PAGE_TITLE = "Color Format Converter — HEX, RGB, HSL, HSV, CMYK, oklch";
const PAGE_DESCRIPTION =
  "Convert colors between HEX, RGB, HSL, HSV, CMYK, and oklch formats instantly. Pick a color or enter a hex value and get all formats with one-click copy. Runs entirely in your browser.";
const PAGE_KEYWORDS = [
  "color format converter",
  "hex to rgb",
  "rgb to hsl",
  "hex to hsl",
  "hex to cmyk",
  "rgb to cmyk",
  "color code converter",
  "oklch converter",
  "hsv color converter",
  "css color formats",
  "color picker converter",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/color-convert",
    languages: {
      "en-IN": "/color-convert",
      "hi-IN": "/color-convert",
      "x-default": "/color-convert",
    },
  },
  openGraph: {
    type: "website",
    url: "/color-convert",
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

export default async function ColorConvertPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Color Format Converter",
          description:
            "Convert any color between HEX, RGB, HSL, HSV, CMYK, and oklch formats. Pick a color or type a hex code and instantly see all representations with one-click copy.",
          path: "/color-convert",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Color Format Converter" },
          ],
          steps: [
            {
              name: "Enter or pick a color",
              text: "Type a HEX code or use the color picker to select any color.",
            },
            {
              name: "View all formats",
              text: "The tool instantly converts to HEX, RGB, HSL, HSV, CMYK, and oklch and displays each value.",
            },
            {
              name: "Copy the value you need",
              text: "Click the copy button next to any format to copy it straight to your clipboard.",
            },
          ],
          featureList: [
            "Converts between HEX, RGB, HSL, HSV, CMYK, and oklch",
            "Native color picker + hex text input",
            "One-click copy for each format",
            "Named CSS color lookup",
            "Color swatch preview",
            "All conversions done in-browser — nothing sent to a server",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What color formats does this tool support?",
              answer:
                "The tool converts between HEX (#rrggbb), RGB (red, green, blue 0–255), HSL (hue, saturation, lightness), HSV (hue, saturation, value), CMYK (cyan, magenta, yellow, black), and oklch (perceptual lightness, chroma, hue).",
            },
            {
              question: "Is oklch conversion accurate?",
              answer:
                "The oklch values are computed via an approximate sRGB → XYZ → OKLab → oklch pipeline — accurate enough for design work and CSS usage. True ICC-profile accuracy would require a dedicated color management library.",
            },
            {
              question: "How do I use a color in CSS?",
              answer:
                "Copy any of the displayed formats. Modern browsers and CSS support HEX, rgb(), hsl(), and oklch() natively. CMYK is useful for print workflows.",
            },
          ],
        })}
      />
      <PageHeader
        title="Color Format Converter"
        subtitle="Convert between HEX, RGB, HSL, HSV, CMYK, and oklch — copy any format instantly."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Color Format Converter" },
        ]}
      />
      <div className="mt-8">
        <ColorConvertForm />
      </div>
    </main>
  );
}
