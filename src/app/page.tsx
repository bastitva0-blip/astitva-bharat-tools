import { Footer } from "@/components/footer";
import { HeroAurora } from "@/components/hero-aurora";
import { JsonLd } from "@/components/json-ld";
import { ToolsBrowser } from "@/components/tools-browser";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { faqPageSchema, softwareAppSchema } from "@/lib/seo/schema";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME } from "@/lib/seo/site";

const HOME_FAQS = [
  {
    question: "How do I resize a photo for UPSC, SSC or NEET?",
    answer:
      "Open the Exam Photo Resizer on BharatTools, pick UPSC, SSC, NEET, JEE, IBPS or RRB, upload your photo and it auto-fits the exam's exact pixel size, KB target and white background. Download the portal-ready JPG. Everything runs in your browser - your photo is never uploaded.",
  },
  {
    question: "How can I compress a photo to 20 KB / 50 KB / 200 KB?",
    answer:
      "Use Image Compressor. Pick a preset (20 KB, 50 KB, 100 KB, 200 KB, 500 KB, 1 MB, 2 MB) or enter a custom KB target. The tool hits within ±5 KB of your goal so government portals accept the upload first try.",
  },
  {
    question: "How do I combine my photo and signature for SSC or IBPS?",
    answer:
      "Open Photo + Signature Joiner, upload both files, choose side-by-side or stacked layout and the tool outputs a single image at portal-standard dimensions ready for SSC, IBPS and other exam upload portals.",
  },
  {
    question: "How can I compress a PDF below 200 KB for a sarkari portal?",
    answer:
      "Open PDF Compressor, drop your PDF, pick Light / Recommended / Stronger compression. The tool re-encodes embedded photos and strips metadata. Works best when the PDF was made by scanning or contains photos - perfect for filled-up government forms with attached photographs.",
  },
  {
    question: "How do I merge or split a PDF?",
    answer:
      "Open PDF Merge & Split. Merge mode combines multiple PDFs into one in the order you choose. Split mode breaks a PDF into separate files by page ranges like '1-3, 5, 7-9' - exactly what most portals expect.",
  },
  {
    question: "How do I convert JPG or images to PDF for a form?",
    answer:
      "Open JPG / Image to PDF, drop one or many images, reorder and rotate, pick A4 or Letter, portrait or landscape. The tool combines them into a single PDF ready to upload.",
  },
  {
    question: "Is BharatTools free? Do I need to sign up?",
    answer:
      "Yes, BharatTools is completely free. No login, no signup, no credit card. Just open bharattools.app in any browser - desktop or mobile - and start using any tool.",
  },
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. Every tool runs 100% in your browser using JavaScript. Your files never leave your device - they are never uploaded to any server, never stored, never seen by us. This is privacy-first by design, especially important for documents like Aadhaar, PAN, exam photos and signatures.",
  },
  {
    question: "Does BharatTools work on mobile?",
    answer:
      "Yes. BharatTools works on any modern mobile browser - Chrome on Android, Safari on iPhone, etc. The tools are designed for the typical Indian student/applicant flow of submitting government and exam forms from a phone.",
  },
  {
    question: "What tools does BharatTools have?",
    answer:
      "Exam Photo Resizer (UPSC, SSC, NEET, JEE, IBPS, RRB), Image Compressor (target any KB), Document Photo Maker (Aadhaar, PAN, Passport, OCI, Voter ID), Photo + Signature Joiner, Print Sheet Generator (6-8 passport photos on a 4x6 inch or A4 sheet), JPG / Image to PDF, PDF Compressor, PDF Merge & Split, Print Job Slip and Quick Send (browser-to-browser P2P file transfer to a print shop, no app needed).",
  },
];

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <>
      <JsonLd
        data={[
          softwareAppSchema({
            name: SITE_NAME,
            description: SITE_DESCRIPTION,
            path: "/",
            applicationSubCategory: "UtilitiesApplication",
            keywords: SITE_KEYWORDS,
            featureList: [
              "Resize exam photos to UPSC, SSC, NEET, JEE, IBPS, RRB specs",
              "Compress images to exact KB targets (20 KB, 50 KB, 200 KB, custom)",
              "Combine photo and signature for portal uploads",
              "Make Aadhaar, PAN, Passport, OCI, Voter ID document photos",
              "Compress PDFs below upload limits",
              "Merge PDFs into one or split by page ranges",
              "Convert JPG / images to PDF",
              "Print-sheet layout for 6-8 passport photos",
              "Print Job Slip bundle for print shops",
              "Quick Send peer-to-peer file transfer (no app, no signup)",
              "100% on-device - files never leave the browser",
              "Free, no signup, works on mobile and desktop",
            ],
          }),
          faqPageSchema(HOME_FAQS),
        ]}
      />
      <HeroAurora
        eyebrow={dict.home.badge}
        title={
          <>
            {dict.home.titleLead}{" "}
            <span className="bg-linear-to-r from-accent-11 to-accent-9 bg-clip-text text-transparent">
              {dict.home.titleAccent}
            </span>
            .
          </>
        }
        subtitle={
          <>
            {dict.home.subtitleMain}{" "}
            <span className="text-surface-fg-subtle">{dict.home.subtitleMuted}</span>
          </>
        }
      />
      <main className="mx-auto w-full max-w-6xl px-page-x pb-20">
        <ToolsBrowser />
      </main>
      <Footer />
    </>
  );
}
