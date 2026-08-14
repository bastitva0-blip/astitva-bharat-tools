import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { BusinessCardMakerForm } from "./business-card-maker-form";

const PAGE_TITLE = "Business Card Maker — Design & Download PDF or PNG Free";
const PAGE_DESCRIPTION =
  "Design a professional business card online and download it as a high-quality PDF or PNG. Standard 3.5×2 inch size, 3 templates, custom colors, and logo upload — no account required.";
const PAGE_KEYWORDS = [
  "business card maker",
  "business card generator",
  "business card design online",
  "free business card maker",
  "business card download pdf",
  "business card png",
  "visiting card maker",
  "business card template",
  "professional card design",
  "printable business card",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/business-card-maker",
    languages: {
      "en-IN": "/business-card-maker",
      "hi-IN": "/business-card-maker",
      "x-default": "/business-card-maker",
    },
  },
  openGraph: {
    type: "website",
    url: "/business-card-maker",
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

export default async function BusinessCardMakerPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Business Card Maker",
          description:
            "Design a professional business card and download it as PDF or PNG. Choose from 3 templates, pick custom colors, upload a logo, and export at print-ready quality.",
          path: "/business-card-maker",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Business Card Maker" },
          ],
          steps: [
            {
              name: "Fill in your details",
              text: "Enter your name, designation, company, email, phone, website, and address.",
            },
            {
              name: "Customise the design",
              text: "Choose a template (Minimal, Classic, or Modern), pick background and text colors, and optionally upload your logo.",
            },
            {
              name: "Download your card",
              text: "Preview the live card and download it as a high-resolution PNG or a print-ready PDF at 3.5×2 inch size.",
            },
          ],
          featureList: [
            "3 card templates: Minimal, Classic, and Modern",
            "Custom background and text color pickers",
            "Optional logo image upload",
            "Live preview at correct business card proportions",
            "Download as PNG (3x scale for crisp quality)",
            "Download as PDF at standard 3.5×2 inch print size",
            "Runs entirely in browser — no data uploaded",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What is the standard business card size?",
              answer:
                "The standard business card size in most countries is 3.5 inches wide by 2 inches tall (88.9mm × 50.8mm). This tool generates cards at exactly that size.",
            },
            {
              question: "Can I print the downloaded card?",
              answer:
                "Yes. The PDF is generated at exactly 3.5×2 inches and can be printed directly. For best results, use a print shop that accepts digital files. The PNG is generated at 3x resolution for sharp edges.",
            },
            {
              question: "What logo formats are supported?",
              answer:
                "You can upload any image your browser can render — PNG, JPG, SVG, or WebP. PNG with a transparent background works best so the logo blends with your card color.",
            },
            {
              question: "Is my data stored anywhere?",
              answer:
                "No. All card generation happens in your browser using HTML5 Canvas and pdf-lib. Nothing is sent to any server.",
            },
          ],
        })}
      />
      <PageHeader
        title="Business Card Maker"
        subtitle="Design and download a print-ready business card — PDF or PNG, no account needed."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Business Card Maker" },
        ]}
      />
      <div className="mt-8">
        <BusinessCardMakerForm />
      </div>
    </main>
  );
}
