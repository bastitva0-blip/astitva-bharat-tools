import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ZipToolForm } from "./zip-tool-form";

const PAGE_TITLE = "ZIP Tool — Create & Extract ZIP Files Free, In Browser";
const PAGE_DESCRIPTION =
  "Create a ZIP from any files or extract an existing ZIP — all inside your browser. No upload, no signup, no software needed. Free ZIP tool for India.";
const PAGE_KEYWORDS = [
  "zip file online",
  "create zip browser",
  "extract zip online free",
  "zip tool india",
  "zip files without software",
  "make zip file online",
  "open zip file browser",
  "zip extractor india",
  "compress files zip",
  "free zip tool no upload",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/zip-tool",
  },
  openGraph: {
    type: "website",
    url: "/zip-tool",
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

export default function ZipToolPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "ZIP Tool",
          description:
            "Create a ZIP archive from any files, or extract files from a ZIP — entirely in your browser. No upload, no signup, no software required.",
          path: "/zip-tool",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "ZIP Tool" }],
          steps: [
            {
              name: "Choose a mode",
              text: "Select 'Create ZIP' to bundle files, or 'Extract ZIP' to unpack an existing archive.",
            },
            {
              name: "Add your files",
              text: "Drop files into the zone (create mode) or drop a .zip file (extract mode).",
            },
            {
              name: "Download",
              text:
                "Click 'Create ZIP' to download your archive, or 'Extract All' to download the contents.",
            },
          ],
          featureList: [
            "Create ZIP archives from any files — no size limit beyond device memory",
            "Optional folder prefix inside the ZIP",
            "Custom ZIP filename",
            "Extract any ZIP and preview its full file tree",
            "Download all files or individual entries",
            "100% on-device — nothing ever uploaded to a server",
            "Free, no signup, works on mobile",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "How do I create a ZIP file in the browser?",
              answer:
                "Open the ZIP Tool, stay on the 'Create ZIP' tab, drop your files into the zone, optionally set a folder name and ZIP filename, then click 'Create ZIP'. The archive downloads immediately — nothing is uploaded.",
            },
            {
              question: "How do I extract a ZIP file without software?",
              answer:
                "Open the ZIP Tool, switch to the 'Extract ZIP' tab, and drop your .zip file. The tool lists every file inside. Click 'Extract All' to download all contents, or click the download icon next to any individual file.",
            },
            {
              question: "Is there a file size limit?",
              answer:
                "There is no server-imposed limit — processing runs entirely in your browser. The practical limit is your device's available RAM.",
            },
          ],
        })}
      />
      <PageHeader
        title="ZIP Tool"
        subtitle="Create or extract ZIP archives — free, in your browser, nothing uploaded."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "ZIP Tool" }]}
      />
      <div className="mt-8">
        <ZipToolForm />
      </div>
    </main>
  );
}
