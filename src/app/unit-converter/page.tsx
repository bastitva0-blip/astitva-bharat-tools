import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { UnitConverterForm } from "./unit-converter-form";

const PAGE_TITLE = "Unit Converter — Length, Weight, Area, Volume, Temperature & Indian Units";
const PAGE_DESCRIPTION =
  "Convert between metric, imperial, and Indian units including bigha, gunta, cent, maan, ser, lakh, and crore. Free, browser-only unit conversion tool.";
const PAGE_KEYWORDS = [
  "unit converter",
  "length converter",
  "weight converter",
  "area converter",
  "bigha to square meter",
  "gunta to square meter",
  "lakh crore converter",
  "temperature converter",
  "volume converter India",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/unit-converter",
    languages: {
      "en-IN": "/unit-converter",
      "hi-IN": "/unit-converter",
      "x-default": "/unit-converter",
    },
  },
  openGraph: {
    type: "website",
    url: "/unit-converter",
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

export default async function UnitConverterPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Unit Converter",
          description: PAGE_DESCRIPTION,
          path: "/unit-converter",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Unit Converter" },
          ],
          steps: [
            { name: "Select a category", text: "Choose from Length, Weight, Area, Volume, Temperature, or Indian Numbers." },
            { name: "Enter a value and choose units", text: "Type your value in the From field and select the source and target units." },
            { name: "Read the result", text: "The converted value updates instantly. Use the swap button to reverse direction." },
          ],
          featureList: [
            "Metric and imperial units",
            "Indian land area units: bigha, gunta, cent",
            "Indian weight units: maan, ser",
            "Indian number formatting: lakh, crore, million, billion",
            "Temperature: Celsius, Fahrenheit, Kelvin",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "How many square meters in a bigha?",
              answer:
                "This tool uses the UP bigha standard: 1 bigha = 2529 square meters. Bigha size varies by state, so always verify with local land records.",
            },
            {
              question: "What is a gunta in square meters?",
              answer: "1 gunta (also guntha) = 101.17 square meters.",
            },
            {
              question: "How many kg is one maan?",
              answer: "1 maan = 40 kg. This is a traditional Indian weight unit still used in some regions.",
            },
          ],
        })}
      />
      <PageHeader
        title="Unit Converter"
        subtitle="Metric, imperial, and Indian units — bigha, gunta, maan, lakh, crore, and more."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Unit Converter" }]}
      />
      <div className="mt-8">
        <UnitConverterForm />
      </div>
    </main>
  );
}
