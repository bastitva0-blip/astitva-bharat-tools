import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Image as ImageIcon, ShieldCheck } from "lucide-react";
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
  "GATE Application Form Guide 2026 — Photo, Signature Specs & GOAPS Walkthrough";
const PAGE_DESCRIPTION =
  "Step-by-step walkthrough of the GATE Online Application Processing System (GOAPS) at goaps.iisc.ac.in: registration, photo (5–200 KB, 240×320 px min), signature (4–30 KB, 160×560 px min), paper and exam city selection, and fee payment. Free in-browser tools — nothing leaves your device.";

const PAGE_KEYWORDS = [
  "GATE form filling",
  "GATE application form 2026",
  "how to fill GATE form",
  "goaps.iisc.ac.in registration",
  "GATE photo size",
  "GATE photo specification",
  "GATE signature size",
  "GATE application fee",
  "GATE exam city",
  "GATE paper selection",
  "GOAPS registration",
  "Graduate Aptitude Test Engineering",
  "GATE फ़ॉर्म कैसे भरें",
  "गेट फोटो साइज़",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/gate",
    languages: {
      "en-IN": "/form-guides/gate",
      "hi-IN": "/form-guides/gate",
      "x-default": "/form-guides/gate",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/gate",
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
    title: "Step 1 — Registration on GOAPS",
    text: "Open goaps.iisc.ac.in (GATE Online Application Processing System). Click 'Register'. Enter your name, email ID, and mobile number. Verify via OTP. Set a password and note your enrollment ID — this is your login for the entire GATE cycle including admit card and scorecard download.",
  },
  {
    title: "Step 2 — Personal details",
    text: "Log in and fill personal information: full name (exactly as on your qualifying degree), date of birth, gender, category (General/OBC-NCL/SC/ST/PwD), nationality, state of eligibility, and communication address with PIN code.",
  },
  {
    title: "Step 3 — Choose paper and exam city",
    text: "Select your GATE paper (e.g. CS, EC, ME, CE) — note that some paper combinations are allowed and some are not; check the current notification. Choose up to three exam city preferences in order — GATE allocates a centre based on availability. Popular cities fill quickly; apply early.",
  },
  {
    title: "Step 4 — Upload photo and signature",
    text: "Upload your colour photograph: JPG, 5–200 KB, minimum 240×320 px, plain light background. Upload your signature: JPG, 4–30 KB, minimum 160×560 px, black ink on white paper. Both files are validated on upload. The photo is printed on your admit card — use a clear, recent, unfiltered image.",
  },
  {
    title: "Step 5 — Pay fee and submit",
    text: "Pay the application fee: ₹1800 for General and OBC-NCL candidates; ₹900 for SC, ST, PwD, and female candidates. Payment via debit/credit card, net banking, or UPI. After payment the application is locked — preview the preview page carefully before paying. Download the confirmation PDF.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the GATE photo size and specification?",
    answer:
      "The GATE photo must be a JPG between 5 KB and 200 KB, at least 240×320 pixels (portrait orientation). It should be a recent colour photograph with a plain light background, face clearly visible, taken in good light without heavy filters. The photo is printed on your GATE admit card — a passport-style photo taken at a studio works well. Use BharatTools Image Compressor if your photo exceeds 200 KB.",
  },
  {
    question: "What is the GATE signature size and spec?",
    answer:
      "The GATE signature must be a JPG between 4 KB and 30 KB, at least 160×560 pixels (wide landscape orientation). Sign on plain white paper with black ink. Photograph or scan in landscape orientation and crop tightly. Use BharatTools Image Compressor with a custom 30 KB target if the file is too large.",
  },
  {
    question: "What is the GATE application fee?",
    answer:
      "General and OBC-NCL candidates pay ₹1800. SC, ST, PwD, and female candidates of all categories pay ₹900. Payment is online via debit/credit card, net banking, or UPI. The fee is non-refundable once submitted. For international candidates (appearing at centres outside India), a different fee applies — check the current notification.",
  },
  {
    question: "Can I appear for two papers in the same GATE cycle?",
    answer:
      "GATE allows certain combinations of two papers in the same cycle. The allowed combinations are listed in the official GATE notification each year. If you choose two papers, you pay a higher fee and sit two separate 3-hour exams. Not all paper combinations are permitted — check the current notification's list of allowed two-paper combinations before selecting.",
  },
  {
    question: "What is the GOAPS enrollment ID?",
    answer:
      "GOAPS (GATE Online Application Processing System) generates an enrollment ID when you complete registration. This ID (along with your password) is your login for the entire GATE cycle — application editing during the correction window, admit card download, scorecard download, and result access. Save it and do not lose it; account recovery requires your registered email.",
  },
  {
    question: "How are GATE exam cities allocated?",
    answer:
      "You select up to three city preferences in order. GATE allocates a centre at one of your preferred cities based on availability. Metros and large cities are over-subscribed — candidates who apply early get better city allocation. If all three choices are exhausted, GATE assigns the nearest available city. You cannot change the city after final submission.",
  },
  {
    question: "Are my files uploaded to BharatTools servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. Your photo and signature never leave your device — verify with DevTools Network tab while you compress. Zero upload requests. This is important for documents linked to your identity and exam candidacy.",
  },
];

export default function GateGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "GATE" },
          ]),
          howToSchema({
            name: "How to fill the GATE application form on GOAPS",
            description:
              "Five-step walkthrough of GOAPS (goaps.iisc.ac.in) — registration, personal details, paper and exam city selection, photo and signature uploads, and fee payment.",
            totalTimeIso: "PT35M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Fill the GATE Application Form 2026 (GOAPS)"
        subtitle="Complete walkthrough of the GATE Online Application Processing System at goaps.iisc.ac.in — Registration, personal details, paper and city selection, photo/signature uploads, and fee payment. ₹1800 for General/OBC-NCL, ₹900 for SC/ST/PwD/Female."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "GATE" },
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
              <strong>Recent colour photograph</strong> — plain light background, face clearly visible, JPG between <strong>5 KB and 200 KB</strong>, minimum 240×320 px.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Signature on white paper</strong> — black ink, JPG between <strong>4 KB and 30 KB</strong>, minimum 160×560 px (landscape).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Qualifying degree details</strong> — degree name, university, year of passing or expected year, percentage/CGPA.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Category certificate</strong> — if applying under OBC-NCL/SC/ST/PwD, keep the certificate number and issuing authority handy.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>GATE paper choice</strong> — decide which paper(s) to appear for. Check allowed two-paper combinations in the current notification before selecting.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Debit card / credit card / net banking / UPI</strong> — ₹1800 fee (General/OBC-NCL) or ₹900 fee (SC/ST/PwD/Female).
            </span>
          </li>
        </ul>
      </section>

      {/* File spec table */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">GATE 2026 file specifications</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          Both uploads are validated immediately on the GOAPS portal. Minimum dimensions and KB limits are both enforced.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Upload</th>
                <th className="px-4 py-2 font-semibold">Format</th>
                <th className="px-4 py-2 font-semibold">File size</th>
                <th className="px-4 py-2 font-semibold">Minimum dimensions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Photograph</td>
                <td className="px-4 py-2">JPG</td>
                <td className="px-4 py-2">5–200 KB</td>
                <td className="px-4 py-2">240×320 px (portrait)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Signature</td>
                <td className="px-4 py-2">JPG</td>
                <td className="px-4 py-2">4–30 KB</td>
                <td className="px-4 py-2">160×560 px (landscape)</td>
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
            <h3 className="text-body-md font-semibold">Application is locked after fee payment</h3>
            <p className="mt-1 text-body-sm">
              GATE opens a correction window for a limited period after the submission deadline, but key fields (paper, centre city, category) are typically locked after payment. Review every detail on the preview page carefully before clicking Pay — especially the paper code and category, as mistakes here affect eligibility and fee calculation.
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
                description: "GOAPS registration",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 1 — Registration on GOAPS</h3>
                    <p className="text-body-md">
                      Open <strong>goaps.iisc.ac.in</strong> and click <em>Register</em>. Enter your name (as on your qualifying degree), email ID, and mobile number. Complete OTP verification for both. Set a strong password and note your <strong>Enrollment ID</strong> — it is generated after successful registration.
                    </p>
                    <p className="text-body-md">
                      The Enrollment ID is your login for the entire GATE cycle — admit card, scorecard, and result access all use it. Use a long-term email address you will have access to even after completing your degree.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 2",
                description: "Personal details",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 2 — Personal details</h3>
                    <p className="text-body-md">
                      Fill in your full name (as on your degree), date of birth, gender, category (General/OBC-NCL/SC/ST/PwD), nationality, state of eligibility, and communication address.
                    </p>
                    <p className="text-body-md">
                      Category determines your fee amount — SC/ST/PwD and female candidates pay ₹900 instead of ₹1800. If you are applying under OBC-NCL, you need a valid Non-Creamy Layer certificate; ensure it is current (not expired) at the time of application.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 3",
                description: "Paper and exam city",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 3 — Choose paper and exam city</h3>
                    <p className="text-body-md">
                      Select your GATE paper from the list. If appearing in two papers (allowed combinations only — check the current notification), select both. Choose up to three exam city preferences in order.
                    </p>
                    <p className="text-body-md">
                      Cities are allocated on a first-come, first-served basis within capacity constraints. Apply early in the registration window to maximise the chance of your first-preference city. You cannot change the city after submission.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 4",
                description: "Photo and signature upload",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 4 — Upload photo and signature</h3>
                    <p className="text-body-md">
                      Upload your photograph and signature. The portal validates both on upload — out-of-spec files are rejected with a descriptive error.
                    </p>

                    <div className="space-y-3 mt-4">
                      <ToolCallout
                        href="/image-compress/50kb"
                        title="Photo: compress if over 200 KB"
                        reason="Use a custom 200 KB target. GATE's upper limit is generous — most phone photos will be fine. Use this tool only if your photo exceeds 200 KB."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                      <ToolCallout
                        href="/image-compress/20kb"
                        title="Signature: compress to 30 KB"
                        reason="Binary-search JPEG lands at or under 30 KB. Sign on white paper in black ink, photograph in landscape, crop tightly, then compress."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>

                    <p className="text-body-md mt-4">
                      <strong>Signature orientation:</strong> GATE requires the signature to be at least 160×560 px — much wider than tall. Photograph your signature in landscape mode and crop tightly around it. If your cropped image is narrower than 560 px horizontally, widen the crop slightly to include a small margin.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 5",
                description: "Fee payment",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 5 — Fee payment and submission</h3>
                    <p className="text-body-md">
                      <strong>Fee:</strong> ₹1800 for General and OBC-NCL candidates. ₹900 for SC, ST, PwD, and female candidates of all categories. The fee is calculated automatically based on your category selection.
                    </p>
                    <p className="text-body-md">
                      Before clicking Pay, open the <em>Preview Application</em> — confirm your paper code, category, exam city preferences, photo, and signature all appear correctly. After payment the application locks; corrections require the official GATE correction window (limited fields).
                    </p>
                    <p className="text-body-md">
                      Pay via debit/credit card, net banking, or UPI. Download and save the payment confirmation PDF — it contains your GOAPS enrollment ID and payment receipt, both needed for any correspondence with GATE organisers.
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
            href: "/image-compress/50kb",
            title: "Image Compressor — custom KB",
            description: "Compress GATE photo under 200 KB. Use a custom target for any KB limit.",
          },
          {
            href: "/image-compress/20kb",
            title: "Image Compressor — 20 KB",
            description: "Compress GATE signature to ≤30 KB. Binary-search JPEG.",
          },
        ]}
      />

      <section className="mt-12 rounded-md border-l-4 border-l-success-9 border border-surface-border-subtle bg-success-3/30 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Why use BharatTools for GATE document preparation?</h3>
            <p className="mt-1 text-body-sm">
              Every BharatTools tool runs locally in your browser — your photo and signature never leave your device. Open DevTools Network tab while you compress: zero upload requests. This is especially relevant for exam documents that link to your academic identity. You can also move files between devices without WhatsApp using{" "}
              <Link href="/quick-send" className="font-medium underline">Quick Send</Link>, a peer-to-peer transfer that stores nothing.
            </p>
          </div>
        </div>
      </section>

      <FaqAccordion faqs={FAQS} />

      <section className="mt-12 rounded-md border border-surface-border-subtle p-6 text-center">
        <h2 className="text-heading-md font-semibold">Ready to compress your GATE signature?</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The GATE signature limit is tight at 30 KB. The Image Compressor binary-searches JPEG quality to land exactly at your target.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/image-compress/20kb">Open Image Compressor →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Specifications based on the GATE notification as of {LAST_UPDATED_LABEL}. Always cross-check the current year&apos;s notification at goaps.iisc.ac.in before submitting — upload limits and fee amounts may change between cycles.
      </p>
    </main>
  );
}

void LAST_UPDATED;
