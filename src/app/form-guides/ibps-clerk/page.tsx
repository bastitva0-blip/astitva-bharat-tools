import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, faqPageSchema, howToSchema } from "@/lib/seo/schema";
import { ToolCallout } from "@/components/form-guides/tool-callout";
import { ToolsUsedSection } from "@/components/form-guides/tools-used-section";
import { FormGuideSteps } from "@/components/form-guides/form-guide-steps";
import { FaqAccordion } from "@/components/form-guides/faq-accordion";

const LAST_UPDATED = "2026-08-13";
const LAST_UPDATED_LABEL = "Updated August 2026";

const PAGE_TITLE =
  "IBPS Clerk Application Form Guide 2026 — Photo, Signature, Thumb Impression & Declaration Specs";
const PAGE_DESCRIPTION =
  "Complete walkthrough of the IBPS Clerk online application at ibps.in: registration, photo (20–50 KB, 200×230 px), signature (10–20 KB, 140×60 px), left thumb impression (20–50 KB, 240×240 px), hand-written declaration (50–100 KB), and fee payment. Free in-browser tools — nothing leaves your device.";

const PAGE_KEYWORDS = [
  "IBPS Clerk form filling",
  "IBPS Clerk application 2026",
  "how to fill IBPS Clerk form",
  "ibps.in clerk registration",
  "IBPS Clerk photo size",
  "IBPS Clerk photo 50 KB",
  "IBPS Clerk signature size",
  "IBPS Clerk thumb impression",
  "IBPS Clerk hand written declaration",
  "IBPS Clerk fee payment",
  "IBPS CRP Clerk application",
  "आईबीपीएस क्लर्क फ़ॉर्म कैसे भरें",
  "आईबीपीएस क्लर्क फोटो साइज़",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/ibps-clerk",
    languages: {
      "en-IN": "/form-guides/ibps-clerk",
      "hi-IN": "/form-guides/ibps-clerk",
      "x-default": "/form-guides/ibps-clerk",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/ibps-clerk",
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
    title: "Step 1 — Registration",
    text: "Open ibps.in and click the active IBPS Clerk Common Recruitment Process (CRP) notification link. Click 'Click here for New Registration'. Enter your name, mobile number, and email ID exactly as on your certificates. The system sends OTPs to both — enter them to confirm. Submit to receive your provisional Registration Number and system-generated Password. Save the confirmation page immediately.",
  },
  {
    title: "Step 2 — Fill personal and educational details",
    text: "Log in with your registration number and password. Fill in personal details (name, DOB, gender, category, nationality, marital status, state of domicile, address), educational qualifications (graduation stream, university, year of passing, percentage/CGPA — or 'Appearing' if in final year), and language proficiency details. Double-check all entries carefully before proceeding.",
  },
  {
    title: "Step 3 — Upload photo, signature, thumb impression, and declaration",
    text: "Upload four files in specified formats. Photo: JPG, 20–50 KB, 200×230 px, plain white or light background, colour photograph. Signature: JPG, 10–20 KB, 140×60 px, black or dark-blue ink on white paper. Left thumb impression: JPG, 20–50 KB, 240×240 px, stamp pad ink on white paper. Hand-written declaration: JPG, 50–100 KB, 800×400 px — copy the exact text from the portal instructions, write in black ink on white paper.",
  },
  {
    title: "Step 4 — Select exam centre and pay fee",
    text: "Select your preferred exam centre from the available city list. Pay the application fee: ₹175 for SC/ST/PwBD candidates, ₹850 for all others (General/OBC/EWS). Payment via debit card, credit card, or net banking. Keep the transaction ID. After payment, preview your complete application — all uploaded images should render clearly. Click Final Submit, download, and print the PDF confirmation.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the IBPS Clerk photo size and specification?",
    answer:
      "The IBPS Clerk photo must be a JPG/JPEG between 20 KB and 50 KB, exactly 200×230 pixels. It must be a recent colour photograph with a plain white or light-coloured background, face clearly visible, ears visible, no cap or hat, no dark glasses. Phone camera photos are typically 2–5 MB — use BharatTools Image Compressor with a 50 KB target to bring them to spec. The tool runs entirely in your browser.",
  },
  {
    question: "What is the IBPS Clerk signature size and spec?",
    answer:
      "The IBPS Clerk signature must be a JPG between 10 KB and 20 KB, 140×60 pixels. Sign on plain white paper with a black or dark-blue ink pen. The signature should be clear and must not touch the edges of the frame. Photograph or scan it, then use BharatTools Image Compressor with a custom 20 KB target to hit the upper limit.",
  },
  {
    question: "How do I give the left thumb impression for IBPS Clerk?",
    answer:
      "Press your left thumb on a clean stamp pad (blue or black ink) and press it clearly on a plain white sheet of paper. The impression should be complete — all ridges visible, no smudging. Photograph or scan it as JPG (20–50 KB, 240×240 px). Do not use your right thumb. Female candidates also use the left thumb. Use BharatTools Image Compressor with a 50 KB target if the file is too large.",
  },
  {
    question: "What is the IBPS Clerk hand-written declaration?",
    answer:
      "IBPS requires candidates to write a specific declaration paragraph in their own handwriting. The exact text is provided on the application portal's instructions page. Write it on plain white paper with black ink. Photograph in landscape orientation in good light for a wider aspect ratio closer to 800×400 px. The portal specifically requires genuine handwriting — printed and signed declarations are rejected.",
  },
  {
    question: "What is the IBPS Clerk application fee?",
    answer:
      "SC, ST, and PwBD candidates pay ₹175. All other candidates (General, OBC, EWS) pay ₹850. Payment is online only — debit card, credit card, or net banking. No cash option. The fee is non-refundable once the application is submitted.",
  },
  {
    question: "Is IBPS Clerk different from IBPS PO in terms of the form?",
    answer:
      "The upload specifications are identical: same photo dimensions (200×230 px, 20–50 KB), same signature (140×60 px, 10–20 KB), same thumb impression (240×240 px, 20–50 KB), same declaration (800×400 px, 50–100 KB). The fees are also the same. The main differences are the post applied for, the exam pattern (no interview for Clerk), and the score requirements. The form-filling process on ibps.in follows the same four-step flow.",
  },
  {
    question: "Can I edit my IBPS Clerk application after submission?",
    answer:
      "IBPS opens a correction window for a few days after the initial registration period closes. During this window you can edit certain fields, but uploaded documents — photo, signature, thumb impression, declaration — are typically locked at final submission. Prepare all files correctly before beginning the upload step.",
  },
  {
    question: "Are my files uploaded to BharatTools servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. Your photo, signature, thumb impression, and declaration image never leave your device — verify with DevTools Network tab while you process. This is especially important for biometric data like thumb impressions.",
  },
];

export default function IbpsClerkGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "IBPS Clerk" },
          ]),
          howToSchema({
            name: "How to fill the IBPS Clerk application form",
            description:
              "Four-step walkthrough of the IBPS Clerk CRP application — registration, personal/educational details, photo/signature/thumb/declaration uploads, exam centre selection, and fee payment.",
            totalTimeIso: "PT30M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Fill the IBPS Clerk Application Form 2026"
        subtitle="Complete walkthrough of ibps.in — Registration, personal details, photo/signature/thumb impression/declaration uploads at exact pixel and KB specs, exam centre selection, and fee payment. ₹850 for General/OBC/EWS, ₹175 for SC/ST/PwBD."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "IBPS Clerk" },
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
              <strong>Recent colour photograph</strong> — plain white/light background, face clearly visible, JPG between <strong>20 KB and 50 KB</strong>, 200×230 px.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Signature on white paper</strong> — black or dark-blue ink pen, JPG between <strong>10 KB and 20 KB</strong>, 140×60 px.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Left thumb impression</strong> — stamp-pad ink on white paper, JPG between <strong>20 KB and 50 KB</strong>, 240×240 px.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Hand-written declaration</strong> — exact text from portal, black ink, JPG between <strong>50 KB and 100 KB</strong>, 800×400 px.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Educational certificates</strong> — graduation degree/marksheet, year of passing, percentage/CGPA.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Category certificate</strong> — if applying under SC/ST/OBC/PwBD, keep certificate number and issuing authority handy.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Debit card / credit card / net banking</strong> — ₹850 fee (General/OBC/EWS) or ₹175 fee (SC/ST/PwBD).
            </span>
          </li>
        </ul>
      </section>

      {/* File spec table */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">IBPS Clerk 2026 file specifications</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          All four uploads are validated automatically. Outside these bounds = rejected with no clear error.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Upload</th>
                <th className="px-4 py-2 font-semibold">Format</th>
                <th className="px-4 py-2 font-semibold">File size</th>
                <th className="px-4 py-2 font-semibold">Dimensions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Photograph</td>
                <td className="px-4 py-2">JPG</td>
                <td className="px-4 py-2">20–50 KB</td>
                <td className="px-4 py-2">200×230 px</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Signature</td>
                <td className="px-4 py-2">JPG</td>
                <td className="px-4 py-2">10–20 KB</td>
                <td className="px-4 py-2">140×60 px</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Left thumb impression</td>
                <td className="px-4 py-2">JPG</td>
                <td className="px-4 py-2">20–50 KB</td>
                <td className="px-4 py-2">240×240 px</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Hand-written declaration</td>
                <td className="px-4 py-2">JPG</td>
                <td className="px-4 py-2">50–100 KB</td>
                <td className="px-4 py-2">800×400 px</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Warning */}
      <section className="mt-10 rounded-md border border-surface-border-subtle border-l-4 border-l-warning-9 bg-warning-3/30 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Uploads cannot be changed after final submission</h3>
            <p className="mt-1 text-body-sm">
              IBPS allows editing during a correction window, but uploaded images are locked at final submission. Prepare all four files before you begin the upload step — wrong dimensions or file size causes rejection with no opportunity to fix until the correction window opens.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mt-12">
        <h2 className="text-heading-md font-semibold">Step-by-step walkthrough</h2>
        <div className="mt-6">
          <FormGuideSteps
            steps={[
              {
                label: "Step 1",
                description: "Registration",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 1 — Registration</h3>
                    <p className="text-body-md">
                      Open <strong>ibps.in</strong> and click the active CRP Clerk notification link. Click <em>Click here for New Registration</em>. Enter your name (exactly as on Class 10 certificate), mobile number, and email ID. The system sends OTPs to both — enter them to confirm. Submit to receive your provisional Registration Number and system-generated Password.
                    </p>
                    <p className="text-body-md">
                      Save the registration confirmation page. The Registration Number is your login ID for the rest of the application process. You can change the system-generated password after your first login.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 2",
                description: "Personal and educational details",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 2 — Personal and educational details</h3>
                    <p className="text-body-md">
                      Log in and fill in: personal details (full name, DOB, gender, category, nationality, marital status, state of domicile, address), educational qualifications (graduation stream, university, year, percentage/CGPA), and language proficiency for the state you are applying in. Final-year students select <em>Appearing</em>.
                    </p>
                    <p className="text-body-md">
                      Double-check name spelling and DOB — they feed through to the admit card and appointment letter. Category errors (claiming OBC when you are General) result in disqualification at document verification.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 3",
                description: "Document uploads",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 3 — Upload photo, signature, thumb, declaration</h3>
                    <p className="text-body-md">
                      This is where most applications stall. The portal validates all four uploads against pixel and KB limits silently — an out-of-spec file shows a generic error. Prepare all files before starting the upload step.
                    </p>

                    <div className="space-y-3 mt-4">
                      <ToolCallout
                        href="/photo-resize/ibps"
                        title="Photo: resize to IBPS spec (200×230 px, 20–50 KB)"
                        reason="Crops to exactly 200×230 px with white background, hits 20–50 KB. Phone photos at 2–5 MB are resized to spec in one step."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                      <ToolCallout
                        href="/image-compress/20kb"
                        title="Signature: compress to 20 KB"
                        reason="Binary-search JPEG compression lands at or under 20 KB. Scan the signature on plain white paper and drop it here."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                      <ToolCallout
                        href="/image-compress/50kb"
                        title="Thumb impression or declaration: compress to 50 KB / 100 KB"
                        reason="Use custom KB target. Thumb impression needs ≤50 KB; declaration needs ≤100 KB. One tool handles both targets."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>

                    <p className="text-body-md mt-4">
                      <strong>Hand-written declaration tip:</strong> The exact text is on the IBPS portal instructions page. Write it on A4 paper in landscape orientation, photograph in good light — this naturally gives a wider aspect ratio closer to 800×400 when cropped. The portal requires genuine handwriting; printed and signed declarations are rejected.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 4",
                description: "Exam centre and fee",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 4 — Exam centre and fee payment</h3>
                    <p className="text-body-md">
                      Select your preferred exam centre from the available city list. IBPS allocates centres on availability — popular metros fill faster. Shortlist 2–3 options in order of preference.
                    </p>
                    <p className="text-body-md">
                      <strong>Fee:</strong> SC/ST/PwBD candidates pay <strong>₹175</strong>. All others (General, OBC-NCL, EWS) pay <strong>₹850</strong>. Pay via debit card, credit card, or net banking. Keep the transaction ID — it appears on your confirmation PDF.
                    </p>
                    <p className="text-body-md">
                      After payment, preview the complete application — all uploaded images should render clearly in their boxes. Click <em>Final Submit</em>. Download and print the application PDF. You will need the registration number on it to download your admit card later.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </div>
      </section>

      <ToolsUsedSection
        tools={[
          {
            href: "/photo-resize/ibps",
            title: "IBPS Photo Resizer",
            description: "200×230 px, 20–50 KB JPG, white background. Exact IBPS Clerk spec in one step.",
          },
          {
            href: "/image-compress/20kb",
            title: "Image Compressor — 20 KB",
            description: "Compress signature scan to ≤20 KB. Binary-search JPEG.",
          },
          {
            href: "/image-compress/50kb",
            title: "Image Compressor — 50 KB",
            description: "Compress thumb impression. Use custom target for 100 KB declaration.",
          },
        ]}
      />

      <section className="mt-12 rounded-md border-l-4 border-l-success-9 border border-surface-border-subtle bg-success-3/30 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Why use BharatTools for IBPS document preparation?</h3>
            <p className="mt-1 text-body-sm">
              Your thumb impression and signature are biometric data. Every BharatTools tool runs locally in your browser — your files never touch a server. Open DevTools Network tab while you compress: zero upload requests. For IBPS Clerk, this matters especially for thumb impressions and the hand-written declaration containing your name and signature. You can also transfer files between devices without WhatsApp using{" "}
              <Link href="/quick-send" className="font-medium underline">Quick Send</Link>, a peer-to-peer transfer that stores nothing.
            </p>
          </div>
        </div>
      </section>

      <FaqAccordion faqs={FAQS} />

      <section className="mt-12 rounded-md border border-surface-border-subtle p-6 text-center">
        <h2 className="text-heading-md font-semibold">Ready to prepare your IBPS Clerk photo?</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The IBPS Photo Resizer crops to 200×230 px, sets white background, and lands inside 20–50 KB — exact spec, one step.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/photo-resize/ibps">Open IBPS Photo Resizer →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Specifications based on the IBPS CRP Clerk notification as of {LAST_UPDATED_LABEL}. Always cross-check the current notification at ibps.in before submitting — IBPS occasionally revises upload limits between recruitment cycles.
      </p>
    </main>
  );
}

void LAST_UPDATED;
