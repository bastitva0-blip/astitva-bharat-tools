import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { BharatHero } from "@/components/landing/bharat-hero";
import { ExamWizard } from "@/components/landing/exam-wizard";
import { Footer } from "@/components/footer";
import { HowItWorks } from "@/components/how-it-works";
import { JsonLd } from "@/components/json-ld";
import { ToolsGrid } from "@/components/landing/tools-grid";
import { TrustStrip } from "@/components/trust-strip";
import { UspStrip } from "@/components/usp-strip";
import { devanagari } from "@/lib/fonts";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { formGuides } from "@/lib/form-guides";
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
  const langClass = locale === "hi" ? `bt-hi ${devanagari.variable}` : "";
  return (
    <div className={`bt-landing ${langClass}`}>
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
      <BharatHero dict={dict} />
      <main className="mx-auto w-full max-w-6xl px-page-x pb-20">
        <div className="mt-16">
          <UspStrip dict={dict} />
        </div>

        {/* "For My Exam" wizard — pick exam, get curated tool list */}
        <div className="mt-12">
          <ExamWizard />
        </div>

        <section className="mt-20">
          <ToolsGrid />
        </section>

        <HowItWorks dict={dict} />

        <section className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="inline-flex items-center gap-2 text-heading-md font-semibold">
                <BookOpen className="size-5 text-[var(--bt-saffron-ink)]" aria-hidden />
                {dict.home.guides.heading}
              </h2>
              <p className="mt-2 max-w-2xl text-body-md text-surface-fg-muted">
                {dict.home.guides.description}
              </p>
            </div>
            <Link
              href="/form-guides"
              className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-body-sm font-medium text-accent-11 hover:underline sm:inline-flex"
            >
              {dict.home.guides.seeAll}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...formGuides]
              .sort((a, b) => a.order - b.order)
              .slice(0, 3)
              .map((guide) => (
                <Link key={guide.slug} href={`/form-guides/${guide.slug}`} className="block">
                  <Card variant="outline" interactive className="h-full">
                    <CardHeader>
                      <CardTitle>{guide.examName}</CardTitle>
                      <CardDescription>{guide.fullName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border border-surface-border-subtle bg-surface-2 px-3 py-2 text-body-xs font-medium">
                        {guide.specSummary}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link
              href="/form-guides"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-11 hover:underline"
            >
              {dict.home.guides.seeAll}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>
      <TrustStrip dict={dict} />
      <Footer />
    </div>
  );
}
