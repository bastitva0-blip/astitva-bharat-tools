import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { SvgViewerForm } from "./svg-viewer-form";

const PAGE_TITLE = "SVG Viewer & Editor — View and Edit SVG Online Free";
const PAGE_DESCRIPTION =
  "View and edit SVG code side-by-side with a live preview. Upload an SVG file or paste SVG markup, edit the code, and download the result. Works entirely in your browser.";
const PAGE_KEYWORDS = [
  "svg viewer",
  "svg editor online",
  "view svg online",
  "svg preview",
  "svg code editor",
  "svg live preview",
  "edit svg online free",
  "svg inspector",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/svg-viewer",
    languages: {
      "en-IN": "/svg-viewer",
      "hi-IN": "/svg-viewer",
      "x-default": "/svg-viewer",
    },
  },
  openGraph: {
    type: "website",
    url: "/svg-viewer",
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

export default async function SvgViewerPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "SVG Viewer & Editor",
          description:
            "View and edit SVG markup with a live side-by-side preview. Upload or paste SVG code, make changes, and download the result.",
          path: "/svg-viewer",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "SVG Viewer" }],
          steps: [
            {
              name: "Load SVG",
              text: "Upload an SVG file or paste SVG markup directly into the code editor.",
            },
            {
              name: "Edit and preview",
              text: "Edit the SVG code in the left panel and see the live preview update in real time on the right.",
            },
            {
              name: "Download or copy",
              text: "Copy the SVG code to clipboard or download it as a .svg file.",
            },
          ],
          featureList: [
            "Side-by-side SVG code editor and live preview",
            "Upload SVG files or paste SVG markup",
            "Script tag sanitisation for safe preview",
            "Copy code to clipboard",
            "Download edited SVG file",
            "Displays SVG dimensions from viewBox or attributes",
            "100% in-browser — nothing uploaded to server",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is the SVG preview safe?",
              answer:
                "Yes. Before rendering, the tool strips all <script> tags from the SVG to prevent any scripted content from executing in the preview area.",
            },
            {
              question: "Can I edit the SVG and download the changes?",
              answer:
                "Yes. Edit the SVG code directly in the left panel, then click Download SVG to save the current code as a .svg file.",
            },
          ],
        })}
      />
      <PageHeader
        title="SVG Viewer & Editor"
        subtitle="Edit SVG code and see the live preview side-by-side. Upload, paste, copy, or download."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "SVG Viewer" }]}
      />
      <div className="mt-8">
        <SvgViewerForm />
      </div>
    </main>
  );
}
