import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  Fingerprint,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, faqPageSchema, howToSchema } from "@/lib/seo/schema";
import { ToolCallout } from "@/components/form-guides/tool-callout";
import { ToolsUsedSection } from "@/components/form-guides/tools-used-section";
import { FormGuideSteps } from "@/components/form-guides/form-guide-steps";
import { FaqAccordion } from "@/components/form-guides/faq-accordion";

const LAST_UPDATED_LABEL = "Updated June 2026";

const PAGE_TITLE =
  "NEET UG Application Form Filling Guide 2026 — Photo, Signature, Thumb Impressions";
const PAGE_DESCRIPTION =
  "Step-by-step guide to filling the NEET UG 2026 application on the NTA portal: registration, personal & academic details, photo (10–200 KB), signature (4–30 KB), postcard photo, finger and thumb impressions, address proof PDF, and category-specific fee payment. Free in-browser tools to resize and compress — no upload.";

const PAGE_KEYWORDS = [
  "NEET form filling",
  "NEET UG application form 2026",
  "how to fill NEET form",
  "NEET online registration",
  "NEET photo size",
  "NEET photo 200 KB",
  "NEET signature size",
  "NEET postcard photo",
  "NEET thumb impression upload",
  "NEET form filling steps",
  "NTA NEET form",
  "NEET document upload",
  "NEET application fee",
  "NEET photo specification",
  "नीट फॉर्म कैसे भरें",
  "नीट फोटो साइज़",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/neet",
    languages: {
      "en-IN": "/form-guides/neet",
      "hi-IN": "/form-guides/neet",
      "x-default": "/form-guides/neet",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/neet",
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

const STEPS: { title: string; text: string }[] = [
  {
    title: "Register on the NTA NEET portal",
    text: "Open neet.nta.nic.in, click New Registration, enter name, DOB, email, and mobile number — exactly as they appear on your Class 10 certificate. Set a password, choose a security question, complete OTP verification on mobile and email, and note the system-generated Application Number that NTA emails and texts you.",
  },
  {
    title: "Fill personal, exam-city, and academic details",
    text: "Log back in with your Application Number and password. Fill personal info (gender, category, nationality, place of birth), choose question paper medium from the 13 supported languages, select up to two exam cities in order of preference, and enter academic details for Class 10, 11, and 12 (or mark Class 12 as 'Appearing').",
  },
  {
    title: "Upload photo, signature, postcard photo, and thumb impressions",
    text: "Photo: passport-size on white background, JPG 10–200 KB. Postcard photo: 4×6 inch JPG, typically 50–300 KB. Signature: running handwriting in black ink on white paper, JPG 4–30 KB. Left and right hand finger plus thumb impressions: JPG 10–50 KB each. Category and PwBD certificates plus a unified address-proof PDF if applicable.",
  },
  {
    title: "Pay the application fee",
    text: "Review the full application breakdown on the verification page — spelling, DOB, category. Then pay via UPI, Debit Card, Credit Card, or Net Banking. Fee: ₹1,700 General, ₹1,600 EWS/OBC-NCL, ₹1,000 SC/ST/PwBD/Third Gender.",
  },
  {
    title: "Download and save the Confirmation Page",
    text: "After payment confirmation, download the auto-generated Confirmation Page and the fee receipt. Save multiple copies. You do NOT need to post or email a physical copy to NTA — the digital submission is complete.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the NEET photo size limit?",
    answer:
      "The NEET passport-size photo must be a JPG/JPEG between 10 KB and 200 KB, taken on a white or light background with the face clearly visible. The standard dimension is 200×230 pixels. Use the NEET Photo Resizer on BharatTools — it crops to the right aspect, sets the white background, and lands the file inside the KB band in one pass.",
  },
  {
    question: "What is the NEET signature size limit?",
    answer:
      "The NEET signature must be a JPG/JPEG between 4 KB and 30 KB, with the signature in black ink on plain white paper, written in running handwriting. If your scan is larger, open BharatTools Image Compressor, set a custom KB target of 30, and it will binary-search JPEG quality to land within ±5%.",
  },
  {
    question: "What is the postcard-size photo for NEET?",
    answer:
      "NEET requires a separate 4×6 inch postcard-size photograph in addition to the passport-size photo. It should also be on a white background, clearly showing your face. Typical file size is 50–300 KB as JPG. Use BharatTools Image Compressor to hit a 200 KB target if your scan is over the upper limit.",
  },
  {
    question: "How do I upload my finger and thumb impressions for NEET?",
    answer:
      "Take a clear scan of both left and right hand finger and thumb impressions on plain paper using black ink. Each image should be a JPG between 10 KB and 50 KB. Use BharatTools Image Compressor with a custom KB target to bring oversized scans within range without losing clarity.",
  },
  {
    question: "What is the NEET application fee for 2026?",
    answer:
      "General: ₹1,700. General-EWS / OBC-NCL: ₹1,600. SC / ST / PwBD / Third Gender: ₹1,000. Payment is online via UPI, Debit Card, Credit Card, or Net Banking. UPI is usually the most reliable on Indian banks.",
  },
  {
    question: "Do I need to send a physical copy of the NEET form to NTA?",
    answer:
      "No. Once you download the Confirmation Page after successful payment, the submission is complete. NTA does not require you to post or email any physical document. Just save the Confirmation Page and fee receipt for future reference.",
  },
  {
    question: "How do I combine my address proof documents into one PDF?",
    answer:
      "NEET asks for present and permanent address proofs as a single unified PDF. Scan each document, then use BharatTools JPG to PDF — drop the scans, reorder, and download one PDF. If the resulting PDF is too large, follow it with PDF Compressor to fit the portal's upload cap.",
  },
  {
    question: "Are my NEET documents uploaded to BharatTools' servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. Your photo, signature, thumb impressions, and PDFs never leave your device. Open DevTools and watch the Network tab while you compress — zero requests. We don't see your file. We don't store it. We don't need to.",
  },
];

export default function NeetGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "NEET UG" },
          ]),
          howToSchema({
            name: "How to fill the NEET UG application form",
            description:
              "Five-step guide to registering on the NTA NEET portal, filling personal, exam-city and academic details, uploading photo, signature, postcard photo and thumb impressions at the correct spec, paying the category-specific fee, and downloading the Confirmation Page.",
            totalTimeIso: "PT45M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Fill the NEET UG Application Form"
        subtitle="Step-by-step guide to the NTA NEET portal — registration, exam city choices, photo (10–200 KB), signature (4–30 KB), postcard photo, thumb impressions, address proof PDF, and fee payment. Tools we link inline run in your browser; nothing leaves your device."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "NEET UG" },
        ]}
      />

      <p className="mt-2 text-body-xs text-surface-fg-muted">{LAST_UPDATED_LABEL}</p>

      {/* What you'll need */}
      <section className="mt-8 rounded-md border border-surface-border-subtle bg-surface-2 p-5">
        <h2 className="text-heading-sm font-semibold">What you&apos;ll need before you start</h2>
        <ul className="mt-3 space-y-2 text-body-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Active mobile number and personal email</strong> — both must stay active through the entire admissions cycle for NTA OTPs and updates.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Identity proof</strong> — Aadhaar (name/details matching Class 10), Passport, Voter ID, or Class 12 Admit Card with photo.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Class 10 and Class 12 marksheets/certificates</strong> — for academic details and DOB cross-check.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Passport-size photo</strong> — JPG, white background, clear face, 10–200 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Postcard-size photo</strong> — 4×6 inch JPG, typically 50–300 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Signature scan</strong> — running handwriting in black ink on white paper, JPG 4–30 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Left and right hand finger and thumb impressions</strong> — JPG, 10–50 KB each.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Category / PwBD certificate</strong> as PDF (if applicable).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Unified address-proof PDF</strong> — present and permanent address proofs (Aadhaar, Domicile, Voter ID) combined into a single file.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>UPI / debit card / credit card / net banking</strong> — for the category-specific application fee (₹1,000–₹1,700).
            </span>
          </li>
        </ul>
      </section>

      {/* Spec table */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">NEET UG 2026 upload specifications</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The NEET portal rejects files outside these bands, and the upload errors are often vague. Match the spec precisely before you click upload.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Upload</th>
                <th className="px-4 py-2 font-semibold">Format</th>
                <th className="px-4 py-2 font-semibold">Size</th>
                <th className="px-4 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Passport photo</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">10–200 KB</td>
                <td className="px-4 py-2">White background, ~80% face</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Postcard photo</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">50–300 KB</td>
                <td className="px-4 py-2">4 × 6 inches</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Signature</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">4–30 KB</td>
                <td className="px-4 py-2">Black ink, running hand</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Thumb / finger impressions</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">10–50 KB each</td>
                <td className="px-4 py-2">Left and right hand</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Category / PwBD certificate</td>
                <td className="px-4 py-2">PDF</td>
                <td className="px-4 py-2">Within portal cap</td>
                <td className="px-4 py-2">If applicable</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Address proof</td>
                <td className="px-4 py-2">PDF</td>
                <td className="px-4 py-2">Within portal cap</td>
                <td className="px-4 py-2">Present + permanent, combined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Steps — one shown at a time via the stepper */}
      <section className="mt-12">
        <h2 className="text-heading-md font-semibold">Five steps to submit the form</h2>

        <div className="mt-6">
          <FormGuideSteps
            steps={[
              {
                label: "Step 1",
                description: "Register on the NTA portal",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 1 — Register on the NTA NEET portal</h3>
                    <p className="text-body-md">
                      Open the official portal at neet.nta.nic.in and click <em>New Registration</em>. Enter your name, date of birth, email, and mobile number — <strong>exactly as printed on your Class 10 certificate</strong>. A mismatch here is one of the top causes of late-stage rejection during document verification.
                    </p>
                    <p className="text-body-md">
                      Create a strong password, choose a security question, and complete OTP verification on both mobile and email. NTA emails and SMSes you an <strong>Application Number</strong> — note it down immediately. You&apos;ll need it for every step that follows and there is no smooth recovery if you lose it.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 2",
                description: "Personal, exam-city & academic details",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 2 — Fill personal, exam-city, and academic details</h3>
                    <p className="text-body-md">
                      Log back in with the Application Number and password you just created. Fill personal information — gender, category, nationality, place of birth — then move into <strong>exam preferences</strong>:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-body-md">
                      <li>
                        <strong>Question paper medium</strong>: NEET supports 13 languages — English, Hindi, Assamese, Bengali, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, Urdu. Pick the one you&apos;re strongest in for science vocabulary, not just spoken comfort.
                      </li>
                      <li>
                        <strong>Exam cities</strong>: select up to two in order of preference. NTA allots based on availability — listing cities by travel time rather than preference often works better in practice.
                      </li>
                    </ul>
                    <p className="text-body-md">
                      Then enter academic details for <strong>Class 10, Class 11, and Class 12</strong> — roll numbers, board names, school names. If you&apos;re currently writing Class 12 boards, mark Class 12 as &lsquo;Appearing&rsquo; — you can update marks later in the qualification verification window.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 3",
                description: "Upload scanned documents",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 3 — Upload scanned documents</h3>
                    <p className="text-body-md">
                      This is the rejection-heavy step. NEET wants more uploads than most other exams — passport photo, postcard photo, signature, four impression scans (left/right hand + thumbs), category certificate, and a unified address PDF. Each has its own size band. Prepare every file before you start uploading; the portal&apos;s &lsquo;previous&rsquo; button often loses unsaved changes.
                    </p>

                    <div className="space-y-3">
                      <ToolCallout
                        href="/photo-resize/neet"
                        title="Passport photo: resize to NEET spec (10–200 KB, white background)"
                        reason="Crops to the right aspect, replaces the background with white, and lands inside the 10–200 KB band — one pass."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-compress/200kb"
                        title="Postcard photo: compress to 200 KB"
                        reason="Standard postcard photo lands well under the 300 KB upper limit while staying sharp at 4×6 inches."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-compress/custom"
                        title="Signature: compress to 30 KB"
                        reason="Set a custom KB target of 30 — binary-search JPEG that comfortably fits NTA's 4–30 KB band."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-compress/50kb"
                        title="Finger and thumb impressions: compress each scan to 50 KB"
                        reason="Four uploads — left fingers, right fingers, left thumb, right thumb — all in the 10–50 KB band."
                        icon={<Fingerprint className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/jpg-to-pdf"
                        title="Address proof: combine present + permanent scans into one PDF"
                        reason="Drop both scans (or pages), reorder if needed, download one PDF. Portal accepts a single unified file only."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/pdf-compress"
                        title="If your address PDF or category certificate is over the cap"
                        reason="Re-encodes embedded photos and strips metadata to fit form-portal upload caps. Light / Recommended / Stronger."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>

                    <p className="text-body-md">
                      Preview every file on the portal before you advance — blurry impressions or rotated photos are the most common cause of physical-verification day rejections. The portal&apos;s preview is small; cross-check by opening the file directly in your gallery too.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 4",
                description: "Pay the application fee",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 4 — Pay the application fee</h3>
                    <p className="text-body-md">
                      The verification page summarises every field. <strong>Read every line</strong> — spelling of name and parents&apos; names, DOB, category, exam city order. Once you click through to payment, most fields lock; corrections require waiting for NTA&apos;s separate correction window, and not every field is editable there.
                    </p>
                    <div className="overflow-x-auto rounded-md border border-surface-border-subtle">
                      <table className="w-full text-body-sm">
                        <thead className="bg-surface-2">
                          <tr className="text-left">
                            <th className="px-4 py-2 font-semibold">Category</th>
                            <th className="px-4 py-2 font-semibold">Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border-subtle">
                          <tr>
                            <td className="px-4 py-2">General</td>
                            <td className="px-4 py-2 font-medium">₹1,700</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">General-EWS / OBC-NCL</td>
                            <td className="px-4 py-2 font-medium">₹1,600</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">SC / ST / PwBD / Third Gender</td>
                            <td className="px-4 py-2 font-medium">₹1,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-body-md">
                      Pay via UPI, Debit Card, Credit Card, or Net Banking. UPI is usually fastest and avoids 3-D-secure timeouts that some Indian bank cards hit on the NTA gateway.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 5",
                description: "Download confirmation page",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 5 — Download and save the Confirmation Page</h3>
                    <p className="text-body-md">
                      After the payment confirms, the portal auto-generates a <strong>Confirmation Page</strong>. Download it, download the fee receipt, and save both — multiple copies. Print one if you want a physical backup.
                    </p>
                    <div className="rounded-md border-l-4 border-l-warning-9 border border-surface-border-subtle bg-warning-3/30 p-4 text-body-sm">
                      <strong>Important:</strong> you are completely done once you download the Confirmation Page. You do <strong>not</strong> need to post or email a physical copy to NTA. Anyone telling you otherwise is operating on outdated information.
                    </div>
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
            href: "/photo-resize/neet",
            title: "NEET Photo Resizer",
            description: "10–200 KB, 200×230 px, white background. Done in one step.",
          },
          {
            href: "/image-compress",
            title: "Image Compressor",
            description: "Hit any exact KB target — postcard photo, signature, impressions. Custom KB input.",
          },
          {
            href: "/jpg-to-pdf",
            title: "JPG / Image to PDF",
            description: "Combine address proofs or scans into a single PDF. Reorder, rotate, A4 or Letter.",
          },
          {
            href: "/pdf-compress",
            title: "PDF Compressor",
            description: "Shrink the address PDF or category certificate to fit upload caps.",
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
              Every tool above runs locally in your browser — your photo, signature, thumb impressions, and PDFs never touch a server. Open DevTools Network tab while you compress: zero requests. You can also share files between your phone and a print shop without WhatsApp using <Link href="/quick-send" className="font-medium underline">Quick Send</Link>, a peer-to-peer transfer that doesn&apos;t store anything either.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqAccordion faqs={FAQS} />

      {/* Final CTA */}
      <section className="mt-12 rounded-md border border-surface-border-subtle p-6 text-center">
        <h2 className="text-heading-md font-semibold">Start with your photo</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The NEET Photo Resizer handles dimensions, KB target, and white background in one pass.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/photo-resize/neet">Open NEET Photo Resizer →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Specifications based on the NTA NEET UG 2026 information bulletin. {LAST_UPDATED_LABEL}. Always cross-check the current notification at neet.nta.nic.in before submitting — NTA occasionally revises file-size bands and fee amounts between sessions.
      </p>
    </main>
  );
}
