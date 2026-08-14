import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { FaviconMakerForm } from "./favicon-maker-form";

const PAGE_TITLE = "Favicon Generator — Create All Favicon Sizes Free";
const PAGE_DESCRIPTION =
  "Upload a PNG or SVG and instantly generate all favicon sizes (16×16 to 512×512) plus a web manifest. Download everything as a ZIP — free, no upload, works in browser.";
const PAGE_KEYWORDS = [
  "favicon generator",
  "favicon maker online",
  "create favicon from image",
  "favicon all sizes",
  "site.webmanifest generator",
  "favicon png generator",
  "browser favicon maker",
  "favicon zip download",
  "favicon generator india",
  "free favicon tool",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/favicon-maker",
    languages: { "en-IN": "/favicon-maker", "hi-IN": "/favicon-maker", "x-default": "/favicon-maker" },
  },
  openGraph: {
    type: "website",
    url: "/favicon-maker",
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

export default async function FaviconMakerPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Favicon Generator",
          description:
            "Upload a PNG or SVG image and generate all favicon sizes from 16×16 to 512×512, plus a site.webmanifest file. Download as a ZIP — entirely in your browser.",
          path: "/favicon-maker",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Favicon Generator" }],
          steps: [
            { name: "Upload your image", text: "Select a PNG or SVG file to use as your favicon source." },
            { name: "Set app details", text: "Enter your app name and choose a theme color for the web manifest." },
            { name: "Download ZIP", text: "Click Download ZIP to get all favicon sizes and the site.webmanifest in one archive." },
          ],
          featureList: [
            "Generates 9 favicon sizes: 16, 32, 48, 64, 96, 128, 180, 192, 512 px",
            "Includes site.webmanifest with icon entries",
            "Supports PNG and SVG source images",
            "100% in-browser — nothing uploaded to any server",
            "Custom app name and theme color for manifest",
            "Download all as a single ZIP file",
            "Free, no signup required",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What image formats can I use as the favicon source?",
              answer:
                "You can upload a PNG or SVG file. For best results use a square image with a simple icon design.",
            },
            {
              question: "What sizes does the Favicon Generator produce?",
              answer:
                "The tool generates 16×16, 32×32, 48×48, 64×64, 96×96, 128×128, 180×180, 192×192, and 512×512 PNG files.",
            },
            {
              question: "Do I need to upload my image to a server?",
              answer:
                "No. All processing happens inside your browser using the Canvas API. Your image never leaves your device.",
            },
          ],
        })}
      />
      <PageHeader
        title="Favicon Generator"
        subtitle="Turn any image into a complete favicon set with manifest — all sizes, one ZIP."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Favicon Generator" }]}
      />
      <div className="mt-8">
        <FaviconMakerForm />
      </div>
    </main>
  );
}
