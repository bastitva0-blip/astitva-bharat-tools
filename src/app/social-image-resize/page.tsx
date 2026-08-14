import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { SocialImageResizeForm } from "./social-image-resize-form";

const PAGE_TITLE = "Social Media Image Resizer — Resize for All Platforms Free";
const PAGE_DESCRIPTION =
  "Resize any image to the exact dimensions for Instagram, Facebook, Twitter/X, LinkedIn, YouTube and more. Download all sizes at once as a ZIP — free, in your browser.";
const PAGE_KEYWORDS = [
  "social media image resizer",
  "resize image for instagram",
  "resize image for facebook",
  "twitter image size",
  "linkedin image size",
  "og image resizer",
  "social media banner size",
  "youtube thumbnail size",
  "image resize all platforms",
  "social image size tool india",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/social-image-resize",
    languages: {
      "en-IN": "/social-image-resize",
      "hi-IN": "/social-image-resize",
      "x-default": "/social-image-resize",
    },
  },
  openGraph: {
    type: "website",
    url: "/social-image-resize",
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

export default async function SocialImageResizePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Social Media Image Resizer",
          description:
            "Resize any image to exact social media dimensions for Instagram, Facebook, Twitter/X, LinkedIn, YouTube and more — all in your browser, no upload needed.",
          path: "/social-image-resize",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Social Media Image Resizer" },
          ],
          steps: [
            { name: "Upload your image", text: "Select any image file from your device." },
            {
              name: "Choose platforms and fit mode",
              text: "Check the social platforms you want, then pick Cover, Contain, or Stretch fit.",
            },
            {
              name: "Download",
              text: "Click Download All as ZIP to get every size at once, or download individual images.",
            },
          ],
          featureList: [
            "9 platform presets: OG, Twitter/X, LinkedIn cover, Instagram square/portrait/landscape, Facebook cover, YouTube thumbnail, LinkedIn post",
            "Three fit modes: Cover (crop to fill), Contain (letterbox), Stretch",
            "Download all sizes as a single ZIP",
            "Download individual sizes separately",
            "100% in-browser processing — nothing uploaded",
            "Free, no signup required",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What image formats can I upload?",
              answer:
                "You can upload any browser-supported image format: JPG, PNG, WebP, GIF, BMP, or SVG.",
            },
            {
              question: "What does the Cover fit mode do?",
              answer:
                "Cover scales and crops your image to fill the target dimensions exactly, similar to CSS object-fit: cover. Use it when you want no white bars.",
            },
            {
              question: "Will my image be uploaded to a server?",
              answer:
                "No. All resizing happens inside your browser using the HTML Canvas API. Your image never leaves your device.",
            },
          ],
        })}
      />
      <PageHeader
        title="Social Media Image Resizer"
        subtitle="Resize once, download for every platform — Instagram, LinkedIn, YouTube and more."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Social Media Image Resizer" },
        ]}
      />
      <div className="mt-8">
        <SocialImageResizeForm />
      </div>
    </main>
  );
}
