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
  "CAT Application Form Guide 2026 — Photo and Signature Specs, IIM Preferences & Fee";
const PAGE_DESCRIPTION =
  "Step-by-step walkthrough of the CAT online application at iimcat.ac.in: registration, photo (10–50 KB, 3.5×4.5 cm), signature (10–50 KB, 3.5×1.5 cm), IIM preferences, test city selection, and fee payment (₹2400 General, ₹1200 SC/ST/PwD). Free in-browser tools — nothing leaves your device.";

const PAGE_KEYWORDS = [
  "CAT form filling",
  "CAT application form 2026",
  "how to fill CAT form",
  "iimcat.ac.in registration",
  "CAT photo size",
  "CAT photo specification",
  "CAT signature size",
  "CAT application fee",
  "CAT IIM preferences",
  "CAT test cities",
  "MBA entrance form",
  "Common Admission Test form",
  "CAT फ़ॉर्म कैसे भरें",
  "कैट फोटो साइज़",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/cat",
    languages: {
      "en-IN": "/form-guides/cat",
      "hi-IN": "/form-guides/cat",
      "x-default": "/form-guides/cat",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/cat",
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
    text: "Open iimcat.ac.in and click 'Register'. Enter your name, email ID, and mobile number. Verify your email via OTP and your mobile via a separate OTP. Set a password. The system creates your CAT candidate account — save the registration ID.",
  },
  {
    title: "Step 2 — Personal details",
    text: "Log in and fill personal information: full name (as on certificates), date of birth, gender, category (General/NC-OBC/SC/ST/PwD), nationality, state of domicile, communication address, and parent/guardian details.",
  },
  {
    title: "Step 3 — Academic history",
    text: "Enter your educational qualifications: Class 10, Class 12, and graduation details (stream, university, year, percentage/CGPA). Candidates in their final year of graduation are eligible — select 'Appearing'. Work experience (if any) can also be entered here for IIM application purposes.",
  },
  {
    title: "Step 4 — Choose IIMs and test cities",
    text: "Select up to six IIMs you wish to apply to (each IIM runs its own admissions process; CAT score is the entry point). Choose up to four test cities in order of preference — the system allocates a slot at one of your preferred cities. Popular metros fill quickly, so apply early.",
  },
  {
    title: "Step 5 — Upload photo and signature",
    text: "Upload your colour photograph: JPG, 10–50 KB, 3.5×4.5 cm proportion, recent, white or light background. Upload your signature: JPG, 10–50 KB, 3.5×1.5 cm proportion, black or dark-blue ink on white paper. Both files must be within the KB limit — the portal validates on upload.",
  },
  {
    title: "Step 6 — Fee payment",
    text: "Pay the application fee: ₹2400 for General and NC-OBC candidates; ₹1200 for SC/ST/PwD candidates. There are no other fee exemptions. Payment via debit/credit card, net banking, or UPI. Keep the payment receipt. After payment, download and save the application PDF.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the CAT photo size and specification?",
    answer:
      "The CAT photo must be a JPG between 10 KB and 50 KB, proportional to 3.5×4.5 cm (roughly a passport-size photo — taller than wide). It should be a recent colour photograph with a plain white or light background, face clearly visible with both eyes open, taken in good natural light. Avoid studio filters or edited backgrounds. Use BharatTools Image Compressor with a 50 KB target if your photo exceeds the limit.",
  },
  {
    question: "What is the CAT signature size and spec?",
    answer:
      "The CAT signature must be a JPG between 10 KB and 50 KB, proportional to 3.5×1.5 cm (wider than tall — landscape orientation). Sign on plain white paper with black or dark-blue ink. The signature should match what you will use on the admit card and answer sheet at the exam centre. Use BharatTools Image Compressor to bring an oversized scan under 50 KB.",
  },
  {
    question: "What is the CAT application fee and are there exemptions?",
    answer:
      "CAT 2026 charges ₹2400 for General and NC-OBC candidates, and ₹1200 for SC, ST, and PwD candidates. There are no other fee waivers or exemptions — EWS candidates pay the General fee of ₹2400. The fee is non-refundable. Payment is accepted via debit/credit card, net banking, or UPI.",
  },
  {
    question: "How many IIMs can I apply to in a single CAT form?",
    answer:
      "The CAT application itself allows you to select up to six IIMs. However, each IIM runs its own separate admissions process — shortlisting criteria (WAT, PI), weightage on academic background, and final selection vary by IIM. Your CAT score is the common denominator. Apply to IIMs whose criteria align with your profile; each selected IIM may send you a separate application form or shortlist notification after CAT results.",
  },
  {
    question: "How are test cities allocated for CAT?",
    answer:
      "You select up to four test cities in order of preference. The CAT convening IIM allocates you a slot at one of your preferred cities based on availability. Popular cities (Delhi-NCR, Mumbai, Bangalore, Chennai, Kolkata) are over-subscribed and candidates who apply close to the deadline often get their third or fourth choice. Apply as early as possible to improve city allocation odds.",
  },
  {
    question: "Can I change my CAT IIM preferences or test city after submission?",
    answer:
      "CAT typically opens a correction window after the initial registration period. During this window, limited fields can be modified — IIM preferences and city choices may or may not be editable depending on the year. Photo and signature cannot be changed after final submission. Always check the official CAT notification for the current year's correction window dates.",
  },
  {
    question: "Are my files uploaded to BharatTools servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. Your photo and signature never leave your device — verify with DevTools Network tab while you compress. Zero upload requests. This matters especially for candidacy documents that link to your identity.",
  },
];

export default function CatGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "CAT" },
          ]),
          howToSchema({
            name: "How to fill the CAT application form",
            description:
              "Six-step walkthrough of the CAT application on iimcat.ac.in — registration, personal details, academic history, IIM preferences and test city selection, photo and signature uploads, and fee payment.",
            totalTimeIso: "PT40M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Fill the CAT Application Form 2026"
        subtitle="Complete walkthrough of iimcat.ac.in — Registration, personal and academic details, IIM and test city preferences, photo/signature uploads, and fee payment. ₹2400 for General/NC-OBC, ₹1200 for SC/ST/PwD."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "CAT" },
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
              <strong>Recent colour photograph</strong> — plain white/light background, face clearly visible, JPG between <strong>10 KB and 50 KB</strong>, 3.5×4.5 cm proportions.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Signature on white paper</strong> — black or dark-blue ink, JPG between <strong>10 KB and 50 KB</strong>, 3.5×1.5 cm proportions (landscape).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Class 10, 12, and graduation marksheets</strong> — percentage/CGPA and year of passing for each.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Work experience details</strong> — if applicable, employer name, designation, and period (in months).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Category certificate</strong> — if applying under NC-OBC/SC/ST/PwD, keep the certificate number and issuing authority handy.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>List of preferred IIMs and test cities</strong> — research IIM shortlisting criteria before applying to maximise the value of your selections.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Debit card / credit card / net banking / UPI</strong> — ₹2400 fee (General/NC-OBC) or ₹1200 fee (SC/ST/PwD).
            </span>
          </li>
        </ul>
      </section>

      {/* File spec table */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">CAT 2026 file specifications</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          Only two uploads required. Both are validated on the portal — out-of-spec files are rejected at upload.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Upload</th>
                <th className="px-4 py-2 font-semibold">Format</th>
                <th className="px-4 py-2 font-semibold">File size</th>
                <th className="px-4 py-2 font-semibold">Dimensions / proportions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Photograph</td>
                <td className="px-4 py-2">JPG</td>
                <td className="px-4 py-2">10–50 KB</td>
                <td className="px-4 py-2">3.5×4.5 cm (portrait)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Signature</td>
                <td className="px-4 py-2">JPG</td>
                <td className="px-4 py-2">10–50 KB</td>
                <td className="px-4 py-2">3.5×1.5 cm (landscape)</td>
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
            <h3 className="text-body-md font-semibold">IIM preferences matter — research before selecting</h3>
            <p className="mt-1 text-body-sm">
              Each IIM has its own shortlisting formula that weights CAT score, academic background (Class 10, 12, graduation percentage), gender diversity, and work experience differently. Selecting IIMs without checking their criteria wastes application slots. Review the previous year&apos;s shortlisting norms for each IIM on their official websites before finalising your list.
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
                      Open <strong>iimcat.ac.in</strong> and click <em>Register</em>. Enter your name (as on certificates), email ID, and mobile number. Verify your email via OTP and your mobile via a separate SMS OTP. Set a password and complete registration.
                    </p>
                    <p className="text-body-md">
                      Use an email address you actively monitor — CAT sends admit card download links, result notifications, and IIM shortlist emails to this address. A Gmail or institutional email works equally well; avoid disposable addresses.
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
                      Fill in your full name (as on your certificate), date of birth, gender, category (General/NC-OBC/SC/ST/PwD), nationality, state of domicile, communication address, and parent/guardian details.
                    </p>
                    <p className="text-body-md">
                      Category selection is critical — NC-OBC requires a valid non-creamy layer OBC certificate. SC/ST and PwD candidates pay the reduced fee. EWS candidates are classified as General for CAT fee purposes.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 3",
                description: "Academic history",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 3 — Academic history</h3>
                    <p className="text-body-md">
                      Enter Class 10 (board, year, percentage), Class 12 (board, year, percentage, stream), and graduation details (university, stream, year of passing, percentage/CGPA and conversion scale if CGPA). If you are in your final year of graduation, select <em>Appearing</em> — you will need to present your degree at IIM admission time.
                    </p>
                    <p className="text-body-md">
                      Work experience (if any) can also be entered — duration in months, employer name, and designation. IIMs like IIM-A, B, C weight work experience in their shortlisting formula.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 4",
                description: "IIM preferences & test cities",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 4 — IIM preferences and test cities</h3>
                    <p className="text-body-md">
                      Select up to six IIMs you wish to apply to. Research each IIM&apos;s shortlisting criteria on their website before selecting — criteria vary significantly. Applying to an IIM whose academic cutoffs are far from your profile wastes a slot.
                    </p>
                    <p className="text-body-md">
                      Choose up to four test cities in order of preference. The CAT convening IIM allocates you a slot based on availability. Apply as early as possible to maximise your chance of getting your first-preference city.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 5",
                description: "Photo and signature",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 5 — Upload photo and signature</h3>
                    <p className="text-body-md">
                      Upload your passport-size photograph and signature. Both must be JPG within 10–50 KB. The portal validates file size on upload — oversized files are rejected immediately.
                    </p>

                    <div className="space-y-3 mt-4">
                      <ToolCallout
                        href="/image-compress/50kb"
                        title="Photo or signature: compress to 50 KB"
                        reason="Binary-search JPEG lands at or under 50 KB. Works for both photo and signature — use the same tool with a 50 KB target."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>

                    <p className="text-body-md mt-4">
                      <strong>Photo tip:</strong> Take the photo in good natural light against a plain white wall. Avoid heavy studio filters — the photo is used at the exam centre for identity verification. A recent, unfiltered, clearly lit photograph is best.
                    </p>
                    <p className="text-body-md">
                      <strong>Signature tip:</strong> Sign on plain white paper in black or dark-blue ink. Photograph in landscape orientation. Crop tightly around the signature so proportions are close to 3.5×1.5 cm (wider than tall).
                    </p>
                  </>
                ),
              },
              {
                label: "Step 6",
                description: "Fee payment",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 6 — Fee payment</h3>
                    <p className="text-body-md">
                      <strong>Fee:</strong> ₹2400 for General and NC-OBC candidates. ₹1200 for SC, ST, and PwD candidates. No other exemptions. Pay via debit/credit card, net banking, or UPI.
                    </p>
                    <p className="text-body-md">
                      After successful payment, the portal generates a confirmation PDF with your CAT registration number. Download and save it — you will need it to download the admit card. The application is locked after payment; no further edits are possible outside the correction window.
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
            title: "Image Compressor — 50 KB",
            description: "Compress CAT photo and signature to ≤50 KB. One tool handles both uploads.",
          },
        ]}
      />

      <section className="mt-12 rounded-md border-l-4 border-l-success-9 border border-surface-border-subtle bg-success-3/30 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Why use BharatTools for CAT document preparation?</h3>
            <p className="mt-1 text-body-sm">
              Every BharatTools tool runs locally in your browser — your photo and signature never leave your device. Open DevTools Network tab while you compress: zero upload requests. Your candidacy documents are yours alone. You can also transfer files between your phone and laptop without WhatsApp using{" "}
              <Link href="/quick-send" className="font-medium underline">Quick Send</Link>, a peer-to-peer transfer that stores nothing.
            </p>
          </div>
        </div>
      </section>

      <FaqAccordion faqs={FAQS} />

      <section className="mt-12 rounded-md border border-surface-border-subtle p-6 text-center">
        <h2 className="text-heading-md font-semibold">Ready to prepare your CAT photo?</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The Image Compressor brings your photo and signature under the 50 KB limit in one step — no quality settings to fiddle with.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/image-compress/50kb">Open Image Compressor →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Specifications based on the CAT notification as of {LAST_UPDATED_LABEL}. Always cross-check the current year&apos;s notification at iimcat.ac.in before submitting — upload limits and fee amounts may change between cycles.
      </p>
    </main>
  );
}

void LAST_UPDATED;
