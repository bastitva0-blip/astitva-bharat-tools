import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ShadowMakerForm } from "./shadow-maker-form";

const PAGE_TITLE = "CSS Box Shadow Generator — Design Multi-Layer Shadows Free";
const PAGE_DESCRIPTION =
  "Visually design CSS box shadows with multiple layers. Adjust offset, blur, spread, and color for each layer. Live preview on a card. Copy the box-shadow CSS instantly.";
const PAGE_KEYWORDS = [
  "css box shadow generator",
  "box shadow maker",
  "css shadow tool",
  "multi-layer box shadow",
  "box shadow preview",
  "css shadow code generator",
  "inset shadow css",
  "shadow design tool",
  "card shadow generator",
  "drop shadow css",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/shadow-maker",
    languages: {
      "en-IN": "/shadow-maker",
      "hi-IN": "/shadow-maker",
      "x-default": "/shadow-maker",
    },
  },
  openGraph: {
    type: "website",
    url: "/shadow-maker",
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

export default async function ShadowMakerPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "CSS Box Shadow Generator",
          description:
            "Design multi-layer CSS box shadows with live preview. Adjust offset, blur, spread, and color per layer. Copy the ready-to-use box-shadow CSS value.",
          path: "/shadow-maker",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "CSS Box Shadow Generator" },
          ],
          steps: [
            {
              name: "Choose a preset or start blank",
              text: "Pick one of the 8 popular shadow presets or start building from scratch.",
            },
            {
              name: "Adjust shadow layers",
              text: "Set X offset, Y offset, blur, spread, and color for each layer. Toggle inset for inner shadows. Add up to 5 layers.",
            },
            {
              name: "Copy the CSS",
              text: "Copy the generated box-shadow CSS value and paste it into your stylesheet.",
            },
          ],
          featureList: [
            "Multiple shadow layers (up to 5)",
            "Per-layer X offset, Y offset, blur, spread, and color",
            "Inset shadow toggle per layer",
            "Live card preview on a neutral background",
            "8 popular shadow presets",
            "Copy-ready CSS box-shadow value",
            "100% in-browser — nothing uploaded",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What is the inset toggle?",
              answer:
                "The inset keyword changes a box shadow from an outer shadow to an inner shadow. It appears inside the element's border rather than outside.",
            },
            {
              question: "Can I layer multiple shadows?",
              answer:
                "Yes. CSS box-shadow supports a comma-separated list of shadows. This tool lets you add up to 5 layers and previews all of them simultaneously on the card.",
            },
            {
              question: "What do blur and spread do?",
              answer:
                "Blur radius controls how soft the shadow edge is. Spread radius expands or contracts the shadow before blur is applied — positive spread makes the shadow larger, negative makes it smaller.",
            },
          ],
        })}
      />
      <PageHeader
        title="CSS Box Shadow Generator"
        subtitle="Build layered box shadows visually. Adjust each layer and copy the CSS output."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "CSS Box Shadow Generator" },
        ]}
      />
      <div className="mt-8">
        <ShadowMakerForm />
      </div>
    </main>
  );
}
