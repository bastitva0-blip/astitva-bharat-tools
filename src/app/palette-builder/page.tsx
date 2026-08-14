import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PaletteBuilderForm } from "./palette-builder-form";

const PAGE_TITLE = "Color Palette Builder — Create & Export Custom Color Palettes Free";
const PAGE_DESCRIPTION =
  "Build a custom color palette from scratch. Add named colors, reorder them, then export as CSS variables, a Tailwind config block, or Figma tokens JSON. No login required.";
const PAGE_KEYWORDS = [
  "color palette builder",
  "custom color palette",
  "css variables generator",
  "tailwind color config generator",
  "figma tokens color",
  "color scheme builder",
  "design system colors",
  "palette generator online",
  "color token builder",
  "export color palette",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/palette-builder",
    languages: {
      "en-IN": "/palette-builder",
      "hi-IN": "/palette-builder",
      "x-default": "/palette-builder",
    },
  },
  openGraph: {
    type: "website",
    url: "/palette-builder",
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

export default async function PaletteBuilderPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Color Palette Builder",
          description:
            "Build a custom named color palette and export it as CSS variables, a Tailwind config block, or Figma tokens JSON. Fully client-side, no login required.",
          path: "/palette-builder",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Color Palette Builder" },
          ],
          steps: [
            {
              name: "Add colors",
              text: "Use the color picker to choose a color, give it a name, and click Add.",
            },
            {
              name: "Arrange your palette",
              text: "Reorder colors with the up/down arrows, or delete colors you do not need.",
            },
            {
              name: "Export and copy",
              text: "Choose CSS variables, Tailwind config, or Figma tokens JSON and click Copy to clipboard.",
            },
          ],
          featureList: [
            "Start with 5 default colors and add as many as you like",
            "Named color tokens for semantic palettes",
            "Reorder colors with up/down arrows",
            "Export as CSS custom properties (:root { --name: #hex; })",
            "Export as Tailwind config colors object",
            "Export as Figma tokens JSON for design-to-code handoff",
            "One-click copy for each export format",
            "Runs entirely in your browser — no data sent anywhere",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What export formats does the palette builder support?",
              answer:
                "You can export your palette as CSS custom properties, a Tailwind config colors object, or Figma tokens JSON compatible with the Tokens Studio plugin.",
            },
            {
              question: "Can I use this for my design system?",
              answer:
                "Yes. Name your colors semantically (primary, surface, accent) and export them as CSS variables or Figma tokens to use directly in your design system.",
            },
            {
              question: "Is there a limit on the number of colors?",
              answer:
                "No — you can add as many colors as you need. The palette scrolls to accommodate large sets.",
            },
          ],
        })}
      />
      <PageHeader
        title="Color Palette Builder"
        subtitle="Build a named color palette and export as CSS variables, Tailwind config, or Figma tokens."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Color Palette Builder" },
        ]}
      />
      <div className="mt-8">
        <PaletteBuilderForm />
      </div>
    </main>
  );
}
