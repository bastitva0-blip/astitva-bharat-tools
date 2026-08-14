import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { CssUnitConverterForm } from "./css-unit-converter-form";

const PAGE_TITLE = "CSS Unit Converter — px, rem, em, pt, vw, vh, %";
const PAGE_DESCRIPTION =
  "Convert between CSS units including px, rem, em, pt, vw, vh, and %. Set your base font size and viewport dimensions for accurate, context-aware conversions. Instant results, no server needed.";
const PAGE_KEYWORDS = [
  "css unit converter",
  "px to rem",
  "rem to px",
  "px to em",
  "em to px",
  "px to pt",
  "vw to px",
  "vh to px",
  "css units",
  "responsive design calculator",
  "font size converter",
  "viewport units converter",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/css-unit-converter",
    languages: {
      "en-IN": "/css-unit-converter",
      "hi-IN": "/css-unit-converter",
      "x-default": "/css-unit-converter",
    },
  },
  openGraph: {
    type: "website",
    url: "/css-unit-converter",
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

export default async function CssUnitConverterPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "CSS Unit Converter",
          description:
            "Convert any CSS value between px, rem, em, pt, vw, vh, and % units. Configure your base font size and viewport for accurate context-aware conversions.",
          path: "/css-unit-converter",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "CSS Unit Converter" },
          ],
          steps: [
            {
              name: "Set your context",
              text: "Enter your base font size (typically 16px), viewport dimensions, and parent element font size for em conversions.",
            },
            {
              name: "Enter a value",
              text: "Type a number in any unit field — px, rem, em, pt, vw, vh, or % — and all other units update instantly.",
            },
            {
              name: "Use the quick reference",
              text: "Check the common spacing reference table to see values like 4px, 8px, 16px, 24px, 32px across all units at a glance.",
            },
          ],
          featureList: [
            "Converts between px, rem, em, pt, vw, vh, and %",
            "Configurable base font size for rem/em accuracy",
            "Configurable viewport width and height for vw/vh",
            "Configurable parent font size for em",
            "Common spacing reference table (4px to 64px)",
            "Fully browser-side — no data leaves your device",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What is the difference between rem and em?",
              answer:
                "rem is relative to the root (html) element font size, typically 16px. em is relative to the parent element's font size, which can vary throughout the document. rem is usually easier to reason about for consistent spacing.",
            },
            {
              question: "How are vw and vh calculated?",
              answer:
                "1vw equals 1% of the viewport width, and 1vh equals 1% of the viewport height. Enter your target viewport dimensions in the settings to get accurate conversions.",
            },
            {
              question: "How is pt converted to px?",
              answer:
                "1 point (pt) equals 1.3333 pixels at 96 DPI, the standard screen resolution used by CSS. So 12pt = 16px, and 9pt = 12px.",
            },
            {
              question: "What does % represent here?",
              answer:
                "The % unit is relative to the parent element's font size (same as em). 100% = 1em = the parent font size. For layout widths/heights % works differently; this tool treats it as a font-size percentage.",
            },
          ],
        })}
      />
      <PageHeader
        title="CSS Unit Converter"
        subtitle="Convert between px, rem, em, pt, vw, vh, and % — set your context for accurate results."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "CSS Unit Converter" },
        ]}
      />
      <div className="mt-8">
        <CssUnitConverterForm />
      </div>
    </main>
  );
}
