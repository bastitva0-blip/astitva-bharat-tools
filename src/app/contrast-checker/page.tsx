import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ContrastCheckerForm } from "./contrast-checker-form";

const PAGE_TITLE = "Color Contrast Checker — WCAG AA & AAA Accessibility Tool";
const PAGE_DESCRIPTION =
  "Check WCAG AA and AAA color contrast ratios for accessibility compliance. Enter foreground and background colors to get the contrast ratio and instant pass/fail results for normal and large text.";
const PAGE_KEYWORDS = [
  "color contrast checker",
  "WCAG contrast ratio",
  "accessibility contrast",
  "WCAG AA compliance",
  "WCAG AAA compliance",
  "foreground background contrast",
  "text contrast checker",
  "color accessibility tool",
  "contrast ratio calculator",
  "web accessibility colors",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/contrast-checker",
    languages: {
      "en-IN": "/contrast-checker",
      "hi-IN": "/contrast-checker",
      "x-default": "/contrast-checker",
    },
  },
  openGraph: {
    type: "website",
    url: "/contrast-checker",
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

export default async function ContrastCheckerPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Color Contrast Checker",
          description:
            "Check WCAG AA and AAA color contrast ratios for text accessibility. Enter foreground and background colors to instantly see pass/fail results for normal and large text sizes.",
          path: "/contrast-checker",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Color Contrast Checker" },
          ],
          steps: [
            {
              name: "Enter your colors",
              text: "Pick or type a foreground (text) color and a background color using the color pickers or hex inputs.",
            },
            {
              name: "View the contrast ratio",
              text: "The tool instantly computes the WCAG relative luminance and shows you the contrast ratio (e.g. 4.5:1).",
            },
            {
              name: "Check pass/fail badges",
              text: "See whether your color pair passes WCAG AA and AAA levels for both normal text and large text.",
            },
          ],
          featureList: [
            "Live WCAG contrast ratio calculation",
            "Pass/fail badges for AA and AAA levels",
            "Separate results for normal and large text",
            "Native color picker + hex text input",
            "Live preview of text on colored background",
            "One-click foreground/background swap",
            "100% client-side — no data sent to server",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What is a WCAG contrast ratio?",
              answer:
                "WCAG (Web Content Accessibility Guidelines) defines contrast ratio as (L1 + 0.05) / (L2 + 0.05), where L1 and L2 are the relative luminances of the lighter and darker colors. A ratio of 1:1 means no contrast; 21:1 is the maximum (black on white).",
            },
            {
              question: "What ratios are needed to pass WCAG AA?",
              answer:
                "WCAG AA requires a contrast ratio of at least 4.5:1 for normal text (under 18pt / 14pt bold) and at least 3:1 for large text (18pt+ or 14pt+ bold).",
            },
            {
              question: "What ratios are needed to pass WCAG AAA?",
              answer:
                "WCAG AAA requires at least 7:1 for normal text and at least 4.5:1 for large text — stricter thresholds for enhanced accessibility.",
            },
          ],
        })}
      />
      <PageHeader
        title="Color Contrast Checker"
        subtitle="Check WCAG AA and AAA contrast ratios for accessible color combinations."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Color Contrast Checker" },
        ]}
      />
      <div className="mt-8">
        <ContrastCheckerForm />
      </div>
    </main>
  );
}
