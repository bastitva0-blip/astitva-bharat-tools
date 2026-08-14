import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { GradientMakerForm } from "./gradient-maker-form";

const PAGE_TITLE = "CSS Gradient Generator — Create Linear, Radial & Conic Gradients Free";
const PAGE_DESCRIPTION =
  "Design beautiful CSS gradients with a live preview. Create linear, radial, and conic gradients with custom color stops. Copy the CSS, Tailwind arbitrary value, or SVG gradient definition instantly.";
const PAGE_KEYWORDS = [
  "css gradient generator",
  "linear gradient maker",
  "radial gradient generator",
  "conic gradient tool",
  "gradient css code",
  "tailwind gradient generator",
  "css background gradient",
  "gradient color picker",
  "gradient preview tool",
  "svg gradient generator",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/gradient-maker",
    languages: {
      "en-IN": "/gradient-maker",
      "hi-IN": "/gradient-maker",
      "x-default": "/gradient-maker",
    },
  },
  openGraph: {
    type: "website",
    url: "/gradient-maker",
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

export default async function GradientMakerPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "CSS Gradient Generator",
          description:
            "Create linear, radial, and conic CSS gradients with a live preview. Add color stops, set angles, and copy the CSS or Tailwind output instantly.",
          path: "/gradient-maker",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "CSS Gradient Generator" },
          ],
          steps: [
            {
              name: "Choose gradient type",
              text: "Select Linear, Radial, or Conic gradient from the type tabs.",
            },
            {
              name: "Configure color stops",
              text: "Add color stops with custom colors and positions. Adjust angle, shape, or center as needed.",
            },
            {
              name: "Copy the output",
              text: "Copy the generated CSS, Tailwind arbitrary value, or SVG gradient definition for use in your project.",
            },
          ],
          featureList: [
            "Linear, radial, and conic gradient types",
            "Multiple color stops with color picker and position control",
            "Angle slider for linear and conic gradients",
            "Shape and position options for radial gradients",
            "Live full-width gradient preview",
            "8 popular gradient presets",
            "Copy CSS, Tailwind arbitrary value, and SVG gradient",
            "100% in-browser — nothing uploaded",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What gradient types does this tool support?",
              answer:
                "The tool supports all three CSS gradient types: linear-gradient (with angle control), radial-gradient (with shape and position options), and conic-gradient (with angle and position).",
            },
            {
              question: "Can I export the gradient for SVG?",
              answer:
                "Yes. The tool generates an SVG <linearGradient> or <radialGradient> definition that you can paste directly into an SVG file.",
            },
            {
              question: "How do I use the Tailwind output?",
              answer:
                "The Tailwind output is an arbitrary value class like bg-[linear-gradient(...)]. Paste it directly into your className string in any Tailwind project.",
            },
          ],
        })}
      />
      <PageHeader
        title="CSS Gradient Generator"
        subtitle="Build linear, radial, and conic gradients with live preview. Copy the CSS or Tailwind output."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "CSS Gradient Generator" },
        ]}
      />
      <div className="mt-8">
        <GradientMakerForm />
      </div>
    </main>
  );
}
