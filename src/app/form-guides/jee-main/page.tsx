import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, faqPageSchema, howToSchema } from "@/lib/seo/schema";
import { ToolCallout } from "@/components/form-guides/tool-callout";
import { ToolsUsedSection } from "@/components/form-guides/tools-used-section";
import { FormGuideSteps } from "@/components/form-guides/form-guide-steps";
import { FaqAccordion } from "@/components/form-guides/faq-accordion";

const LAST_UPDATED = "2026-06-04";
const LAST_UPDATED_LABEL = "Updated June 2026";

const PAGE_TITLE =
  "JEE Main Application Form Filling Guide 2026 — Photo, Signature & KB Specs";
const PAGE_DESCRIPTION =
  "Step-by-step guide to filling the JEE Main 2026 application form on the NTA portal: registration, personal & academic details, photo (10–200 KB), signature (4–30 KB), document uploads, and fee payment. Free in-browser tools to resize and compress — no upload.";

const PAGE_KEYWORDS = [
  "JEE Main form filling",
  "JEE Main application form 2026",
  "how to fill JEE Main form",
  "JEE Main online registration",
  "JEE Main photo size",
  "JEE Main photo 200 KB",
  "JEE Main signature size",
  "JEE Main signature 30 KB",
  "JEE Main photo specification",
  "JEE Main signature specification",
  "NTA JEE Main form filling steps",
  "JEE Main document upload",
  "JEE Main 200x230 photo",
  "JEE Main JPG size",
  "जेईई मेन फॉर्म कैसे भरें",
  "जेईई मेन फोटो साइज़",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/jee-main",
    languages: {
      "en-IN": "/form-guides/jee-main",
      "hi-IN": "/form-guides/jee-main",
      "x-default": "/form-guides/jee-main",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/jee-main",
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

// Steps surfaced as HowTo schema + page body. Keep these aligned with the
// official NTA portal — flag for revision when the next session's exam
// notification drops.
const STEPS: { title: string; text: string }[] = [
  {
    title: "Register on the NTA JEE Main portal",
    text: "Open jeemain.nta.nic.in, click New Registration, enter basic details (name, parents' names, DOB, gender) exactly as on Class 10 marksheet, verify mobile and email via OTP, set a password, and note down the system-generated Application Number.",
  },
  {
    title: "Fill personal and academic details",
    text: "Log in with your Application Number and password, fill category, nationality, state of eligibility, PwD status, choose paper(s) — B.E./B.Tech, B.Arch, B.Planning — pick medium of question paper, select up to four exam cities, and enter Class 10 and Class 12 qualification details.",
  },
  {
    title: "Upload photo, signature, and documents",
    text: "Photo: recent colour passport-style, 80% face visible on white background, JPG/JPEG between 10 KB and 200 KB. Signature: black/blue ink on white paper, JPG/JPEG between 4 KB and 30 KB. Class 10 certificate as PDF for DOB proof. Category/PwD certificate as PDF if applicable.",
  },
  {
    title: "Pay the fee and submit",
    text: "Review every field on the verification page — incorrect details lead to rejection. Click Final Submit, pay the application fee via UPI, Debit Card, Credit Card or Net Banking, then download and print the Confirmation Page for your records.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the JEE Main photo size limit?",
    answer:
      "The JEE Main photo must be a JPG/JPEG between 10 KB and 200 KB, on a white or light background, with the face occupying about 80% of the frame. Standard pixel dimension is 200×230. Use the JEE Photo Resizer on BharatTools — it crops to the exact aspect, sets the white background, and lands the file inside the KB band, all in your browser.",
  },
  {
    question: "What is the JEE Main signature size limit?",
    answer:
      "The JEE Main signature must be a JPG/JPEG between 4 KB and 30 KB, with the signature in black or blue ink on plain white paper. If your scan is larger, compress it to a 30 KB target using BharatTools Image Compressor — set a custom KB target of 30 and it will binary-search JPEG quality to land within ±5%.",
  },
  {
    question: "What background colour does the JEE Main photo require?",
    answer:
      "The official NTA spec asks for a white or light background. Coloured backgrounds — green, blue, red, beige — are rejected by the portal. If your photo has a different background, use BharatTools Document Photo Maker, which removes the background on-device using a neural model and replaces it with clean white before exporting.",
  },
  {
    question: "Can I upload a HEIC photo from my iPhone to the JEE Main portal?",
    answer:
      "No. The NTA portal accepts JPG/JPEG only. iPhone photos taken in HEIC format need to be converted to JPG first. Most BharatTools image tools accept HEIC as input and output JPG, so a single pass through the Photo Resizer is enough — no separate conversion step needed.",
  },
  {
    question: "Why does the JEE Main portal reject my photo?",
    answer:
      "Three common reasons: (1) wrong format — must be JPG/JPEG, not PNG/HEIC/WebP; (2) outside the KB band — under 10 KB or over 200 KB; (3) background not white or too much shadow on face. The Photo Resizer for JEE handles all three: exact dimensions, white background, and KB target inside the 10–200 KB band.",
  },
  {
    question: "Are my photos uploaded to BharatTools' servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. The photo, signature, and PDF you process never leave your device — you can verify this by opening DevTools and watching the Network tab while you compress. We don't see your file. We don't store it. We don't need to.",
  },
  {
    question: "How do I combine multiple document scans into one PDF for upload?",
    answer:
      "Use BharatTools JPG to PDF: drop one or many scans, reorder pages, pick A4 or Letter, and download a single PDF. If the resulting PDF is over the portal's limit, follow it with PDF Compressor to shrink it without re-uploading anywhere.",
  },
];

export default function JeeMainGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "JEE Main" },
          ]),
          howToSchema({
            name: "How to fill the JEE Main application form",
            description:
              "Four-step guide to registering on the NTA JEE Main portal, filling personal and academic details, uploading photo/signature/documents at the correct KB spec, and paying the fee.",
            totalTimeIso: "PT30M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Fill the JEE Main Application Form"
        subtitle="Step-by-step guide to the NTA portal — registration, photo (10–200 KB), signature (4–30 KB), document uploads, fee payment. Use the in-browser tools we link inline; nothing leaves your device."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "JEE Main" },
        ]}
      />

      <p className="mt-2 text-body-xs text-surface-fg-muted">{LAST_UPDATED_LABEL}</p>

      {/* What you'll need — snippet-friendly checklist at the top */}
      <section className="mt-8 rounded-md border border-surface-border-subtle bg-surface-2 p-5">
        <h2 className="text-heading-sm font-semibold">What you&apos;ll need before you start</h2>
        <ul className="mt-3 space-y-2 text-body-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Class 10 marksheet</strong> — for DOB and name spellings (must match exactly).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Recent passport-size photo</strong> — colour, white background, JPG between 10 KB and 200 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Signature scan</strong> — black/blue ink on white paper, JPG between 4 KB and 30 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Class 10 certificate</strong> as PDF, plus category/PwD certificate as PDF if applicable.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Working mobile number and email</strong> — both verified by OTP during registration.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>UPI / debit card / net banking</strong> — for the application fee (₹1,000 for general, lower for reserved categories; check the official notification for current values).
            </span>
          </li>
        </ul>
      </section>

      {/* The official spec — high keyword density, table format */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">JEE Main 2026 photo and signature specifications</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          NTA rejects uploads that miss any of these — wrong format, wrong size, wrong background. Match the spec exactly.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Field</th>
                <th className="px-4 py-2 font-semibold">Photo</th>
                <th className="px-4 py-2 font-semibold">Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Format</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">JPG / JPEG</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">File size</td>
                <td className="px-4 py-2">10 KB – 200 KB</td>
                <td className="px-4 py-2">4 KB – 30 KB</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Dimensions</td>
                <td className="px-4 py-2">200 × 230 px</td>
                <td className="px-4 py-2">Aspect roughly 3.5:1.5</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Background</td>
                <td className="px-4 py-2">White / light</td>
                <td className="px-4 py-2">White paper</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Face / ink</td>
                <td className="px-4 py-2">~80% of frame, front-facing</td>
                <td className="px-4 py-2">Black or blue ink</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* The four steps — one shown at a time via the stepper */}
      <section className="mt-12">
        <h2 className="text-heading-md font-semibold">Four steps to submit the form</h2>

        <div className="mt-6">
          <FormGuideSteps
            steps={[
              {
                label: "Step 1",
                description: "Register on the NTA portal",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 1 — Register on the NTA portal</h3>
                    <p className="text-body-md">
                      Open the official JEE Main portal at jeemain.nta.nic.in and click <em>New Registration</em>. Enter your full name, your father&apos;s and mother&apos;s names, your date of birth, and gender — <strong>exactly as they appear on your Class 10 marksheet</strong>. A mismatch here is the most common cause of late-stage rejection, so cross-check character-by-character before you submit.
                    </p>
                    <p className="text-body-md">
                      Verify your mobile number and email ID using the one-time passwords NTA sends. Create a secure password, answer the security question, and submit. NTA emails and SMSes you an <strong>Application Number</strong> — note it down immediately. You&apos;ll need it for every step that follows, and there is no smooth way to recover it if lost.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 2",
                description: "Personal & academic details",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 2 — Fill personal and academic details</h3>
                    <p className="text-body-md">
                      Log back in with the Application Number and password you just created. Enter your category, nationality, state of eligibility, and PwD status. Choose which paper(s) you want to sit for — <strong>B.E./B.Tech</strong>, <strong>B.Arch</strong>, <strong>B.Planning</strong>, or a combination — and select the medium of the question paper (English, Hindi, or one of the regional languages NTA supports that session).
                    </p>
                    <p className="text-body-md">
                      Pick up to four preferred exam cities. Tier-2 candidates often benefit from listing cities ranked by travel time rather than preference — NTA assigns based on availability, and you&apos;ll attend whichever city comes through. Finish by filling Class 10 and Class 12 academic details: board, roll number, year, and marks (or expected for current Class 12 students).
                    </p>
                  </>
                ),
              },
              {
                label: "Step 3",
                description: "Upload photo, signature & documents",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 3 — Upload photo, signature, and documents</h3>
                    <p className="text-body-md">
                      This is where most rejections happen. The portal enforces strict format and size limits, and the upload page shows technical errors that don&apos;t always explain what&apos;s wrong. Prepare each file using the right tool below — every tool runs in your browser, so your photo and signature never leave your device.
                    </p>

                    <div className="space-y-3">
                      <ToolCallout
                        href="/photo-resize/jee"
                        title="Photo: resize to JEE Main spec (200×230 px, 10–200 KB, white background)"
                        reason="Crops to the right aspect, replaces the background with white, and lands inside the KB band — one upload, all three requirements."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-compress/custom"
                        title="Signature: compress to 30 KB"
                        reason="Set a custom KB target of 30 — binary-search JPEG that lands within ±5% of the cap, comfortably inside NTA's 4–30 KB band."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/jpg-to-pdf"
                        title="Class 10 certificate / PwD docs: combine scans into one PDF"
                        reason="Drop one or many JPG/PNG scans, reorder, and download a single PDF. Reuses the order you set; no quality loss."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/pdf-compress"
                        title="If your PDF is over the portal's limit: compress it"
                        reason="Re-encodes embedded photos and strips metadata to fit form-portal upload caps. Light / Recommended / Stronger — your call."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>

                    <p className="text-body-md">
                      A note on the signature: if you&apos;re signing on plain A4 with a thin black pen, the scan often comes out as a faint signature on a slightly off-white background. Some portals accept this; some don&apos;t. If yours bounces, take a clearer scan with better lighting, or use the Image Compressor at higher quality before resizing — readability beats file size.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 4",
                description: "Pay the fee & submit",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 4 — Pay the fee and submit</h3>
                    <p className="text-body-md">
                      Before you pay, the portal shows a verification page summarising everything you&apos;ve entered. <strong>Read every field</strong>. Specific things to recheck: spelling of your name and parents&apos; names, date of birth, category, exam cities in the order you wanted them, and the paper(s) you chose. After Final Submit, most corrections require a separate correction window NTA opens later — and not every field is editable there.
                    </p>
                    <p className="text-body-md">
                      Pay via UPI, debit card, credit card, or net banking. UPI is usually fastest and avoids 3-D-secure timeouts on Indian banks. Once the payment is confirmed, download the <strong>Confirmation Page</strong> — this is the proof you submitted. Print one copy and save the PDF; you may need it for centre allotment slip download later.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* Tools used — consolidated, directly below the step wizard */}
      <ToolsUsedSection
        tools={[
          {
            href: "/photo-resize/jee",
            title: "JEE Photo Resizer",
            description: "200×230 px, 10–200 KB, white background. Done in one step.",
          },
          {
            href: "/image-compress",
            title: "Image Compressor",
            description: "Hit any exact KB target with binary-search JPEG. Custom KB input or presets.",
          },
          {
            href: "/jpg-to-pdf",
            title: "JPG / Image to PDF",
            description: "Combine many scans into one PDF. Reorder, rotate, A4 or Letter.",
          },
          {
            href: "/pdf-compress",
            title: "PDF Compressor",
            description: "Shrink PDFs to fit form-portal upload caps. Browser-only.",
          },
        ]}
      />

      {/* Privacy nudge */}
      <section className="mt-12 rounded-md border-l-4 border-l-success-9 border border-surface-border-subtle bg-success-3/30 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Why use BharatTools instead of uploading to a PDF site?</h3>
            <p className="mt-1 text-body-sm">
              Every tool above runs locally in your browser — your photo, signature, and PDFs never touch a server. Open DevTools Network tab while you compress: zero requests. You can also share files between your phone and a print shop without WhatsApp using <Link href="/quick-send" className="font-medium underline">Quick Send</Link>, a peer-to-peer transfer that doesn&apos;t store anything either.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqAccordion faqs={FAQS} />

      {/* Final nudge */}
      <section className="mt-12 rounded-md border border-surface-border-subtle p-6 text-center">
        <h2 className="text-heading-md font-semibold">Ready to prepare your photo?</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The JEE Photo Resizer handles dimensions, KB target, and white background in one pass.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/photo-resize/jee">Open JEE Photo Resizer →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Specifications based on the NTA JEE Main 2026 information bulletin. {LAST_UPDATED_LABEL}. Always cross-check the current notification at jeemain.nta.nic.in before submitting — NTA occasionally revises file-size bands between sessions.
      </p>
    </main>
  );
}

// Keep ESLint from complaining about the date string when it's unused in
// future variants of this page (e.g. a localized hi version).
void LAST_UPDATED;
