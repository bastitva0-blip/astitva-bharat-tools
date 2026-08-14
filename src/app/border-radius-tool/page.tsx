import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { BorderRadiusToolForm } from "./border-radius-tool-form";

const PAGE_TITLE = "Border Radius Generator — Set Each Corner Independently Free";
const PAGE_DESCRIPTION =
  "Visually set border-radius for each corner of a box independently. Toggle px, %, or rem units. Link all corners or set them individually. Copy the shorthand or longhand CSS instantly.";
const PAGE_KEYWORDS = [
  "border radius generator",
  "css border radius tool",
  "border radius each corner",
  "rounded corners css",
  "css border radius shorthand",
  "border radius px percent rem",
  "corner radius generator",
  "css border radius preview",
  "border radius online",
  "rounded corners tool",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/border-radius-tool",
    languages: {
      "en-IN": "/border-radius-tool",
      "hi-IN": "/border-radius-tool",
      "x-default": "/border-radius-tool",
    },
  },
  openGraph: {
    type: "website",
    url: "/border-radius-tool",
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

export default async function BorderRadiusToolPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Border Radius Generator",
          description:
            "Set border-radius for each corner independently with a live preview. Switch between px, %, and rem. Copy the shorthand or longhand CSS.",
          path: "/border-radius-tool",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Border Radius Generator" },
          ],
          steps: [
            {
              name: "Set corner values",
              text: "Enter values for top-left, top-right, bottom-right, and bottom-left corners — or link all corners to change them together.",
            },
            {
              name: "Choose units",
              text: "Toggle between px, %, and rem units to match your design system.",
            },
            {
              name: "Copy the CSS",
              text: "Copy the generated shorthand or longhand border-radius CSS property.",
            },
          ],
          featureList: [
            "Independent control for each corner",
            "Link all corners toggle",
            "px, %, and rem unit switch",
            "Live shape preview",
            "Shorthand and longhand CSS output",
            "5 quick presets: sharp, slight, rounded, pill, circle",
            "100% in-browser — nothing uploaded",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What is the difference between shorthand and longhand border-radius?",
              answer:
                "Shorthand border-radius: TL TR BR BL sets all four corners in one property. Longhand uses individual properties like border-top-left-radius: 10px, which can be more explicit in CSS-in-JS contexts.",
            },
            {
              question: "When should I use % versus px?",
              answer:
                "Use % when you want the radius to scale with the element's size (e.g. 50% for a circle). Use px for fixed, design-system-aligned values that don't scale with element size.",
            },
            {
              question: "What does the pill preset do?",
              answer:
                "The pill preset sets border-radius to 9999px, which produces fully rounded left and right caps regardless of the element's width or height.",
            },
          ],
        })}
      />
      <PageHeader
        title="Border Radius Generator"
        subtitle="Set each corner independently. Live preview with shorthand and longhand CSS output."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Border Radius Generator" },
        ]}
      />
      <div className="mt-8">
        <BorderRadiusToolForm />
      </div>
    </main>
  );
}
