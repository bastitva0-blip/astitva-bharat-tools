import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PlaceholderImgForm } from "./placeholder-img-form";

const PAGE_TITLE = "Placeholder Image Generator — Custom Size & Color, Free";
const PAGE_DESCRIPTION =
  "Generate custom placeholder images at any size with your own text, background color, and text color. Download PNG or copy the data URI for use directly in HTML — free, in your browser.";
const PAGE_KEYWORDS = [
  "placeholder image generator",
  "placeholder img tool",
  "dummy image generator",
  "custom placeholder image",
  "generate placeholder png",
  "placeholder image data uri",
  "fake image generator",
  "placeholder image online free",
  "placeholder img india",
  "blank image generator",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/placeholder-img",
    languages: {
      "en-IN": "/placeholder-img",
      "hi-IN": "/placeholder-img",
      "x-default": "/placeholder-img",
    },
  },
  openGraph: {
    type: "website",
    url: "/placeholder-img",
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

export default async function PlaceholderImgPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Placeholder Image Generator",
          description:
            "Generate custom placeholder images at any size. Set background color, text color, and custom label. Download as PNG or copy the data URI for direct use in HTML — no server needed.",
          path: "/placeholder-img",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Placeholder Image Generator" }],
          steps: [
            { name: "Set dimensions", text: "Enter the width and height in pixels, or pick a common preset." },
            {
              name: "Customize appearance",
              text: "Choose background color, text color, custom label text, and font size.",
            },
            {
              name: "Download or copy",
              text: "Click Download PNG to save the image, or copy the data URI to use directly in an HTML <img> tag.",
            },
          ],
          featureList: [
            "Any width and height in pixels",
            "Custom background and text colors",
            "Custom label text — defaults to dimension string",
            "Auto or manual font size",
            "Live canvas preview",
            "Download as PNG",
            "Copy data URI for direct use in HTML",
            "Common size presets: 16×16 to 1920×1080",
            "100% in-browser — nothing uploaded",
            "Free, no signup required",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What is a placeholder image?",
              answer:
                "A placeholder image is a temporary image used during development or design to fill an image slot before real content is ready. It typically shows the image dimensions as text.",
            },
            {
              question: "Can I use the data URI directly in HTML?",
              answer:
                "Yes. Copy the data URI and paste it into an HTML <img src=\"...\"> attribute. The image is fully self-contained and needs no server.",
            },
            {
              question: "Is there a maximum size limit?",
              answer:
                "Very large canvases (over 4000×4000 px) may be slow or fail in some browsers due to memory limits. For most placeholder use cases sizes up to 2000×2000 px work fine.",
            },
          ],
        })}
      />
      <PageHeader
        title="Placeholder Image Generator"
        subtitle="Create placeholder images at any size, color, and label — download PNG or copy data URI."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Placeholder Image Generator" }]}
      />
      <div className="mt-8">
        <PlaceholderImgForm />
      </div>
    </main>
  );
}
