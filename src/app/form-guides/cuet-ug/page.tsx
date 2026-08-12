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

const LAST_UPDATED = "2026-08-12";
const LAST_UPDATED_LABEL = "Updated August 2026";

const PAGE_TITLE =
  "CUET UG Application Form Guide 2026 — Photo, Signature & KB Specs";
const PAGE_DESCRIPTION =
  "Step-by-step guide to the NTA CUET UG application: registration, university and subject choices, photo (10–200 KB), signature (10–50 KB), UDID certificate (50–300 KB) and fee payment. Free in-browser tools to hit every spec — nothing uploaded.";

const PAGE_KEYWORDS = [
  "CUET UG form filling",
  "CUET application form 2026",
  "how to fill CUET form",
  "CUET UG registration",
  "CUET photo size",
  "CUET photo 200 KB",
  "CUET signature size",
  "CUET signature 50 KB",
  "CUET photo specification",
  "CUET document upload",
  "NTA CUET form filling steps",
  "CUET subject selection",
  "CUET application fee",
  "CUET UDID certificate size",
  "सीयूईटी फॉर्म कैसे भरें",
  "सीयूईटी फोटो साइज़",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/cuet-ug",
    languages: {
      "en-IN": "/form-guides/cuet-ug",
      "hi-IN": "/form-guides/cuet-ug",
      "x-default": "/form-guides/cuet-ug",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/cuet-ug",
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

// Steps surfaced as HowTo schema + page body. Sizes below come from the
// CUET (UG) 2026 Information Bulletin — re-check when NTA publishes the next
// session's bulletin, since the signature band in particular differs from
// the 4–30 KB NTA uses for JEE and NEET.
const STEPS: { title: string; text: string }[] = [
  {
    title: "Register on the NTA CUET portal",
    text: "Open cuet.nta.nic.in, click New Registration, and enter your name, parents' names, date of birth and gender exactly as on your Class 10 marksheet. Verify mobile and email by OTP, set a password, and note the Application Number NTA generates.",
  },
  {
    title: "Verify your identity",
    text: "Complete Aadhaar or DigiLocker verification when prompted. If you verify by neither, you must upload another valid photo identity proof as a JPG/JPEG between 10 KB and 200 KB.",
  },
  {
    title: "Choose universities, subjects and exam cities",
    text: "Pick the participating universities you are applying to, then select up to five test subjects — a language, domain subjects, and the General Aptitude Test as required by those universities. Check each university's own subject requirement before you lock this in. Then choose your preferred exam cities.",
  },
  {
    title: "Upload photo, signature and certificates",
    text: "Photo: recent colour passport-size, 80% face including ears, no mask, white background, JPG/JPEG between 10 KB and 200 KB. Signature: JPG/JPEG between 10 KB and 50 KB. PwD/UDID certificate: PDF between 50 KB and 300 KB. Category certificate as specified in the bulletin.",
  },
  {
    title: "Pay the fee and download the confirmation",
    text: "Review every field on the verification page, then pay online by UPI, net banking, debit or credit card. Fees for 2026 were ₹1,000 for General, ₹900 for OBC-NCL/EWS and ₹800 for SC/ST/PwBD/Third Gender for up to three subjects, with a per-subject charge beyond that. Download and print the confirmation page.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the CUET UG photo size limit?",
    answer:
      "The CUET UG photograph must be a JPG/JPEG between 10 KB and 200 KB on a white background, with the face — including the ears — occupying about 80% of the frame and no mask. NTA portals use 200×230 px as the standard pixel size for this photo. The CUET Photo Resizer on BharatTools crops to that aspect, sets a white background, and lands the file inside the KB band in one pass.",
  },
  {
    question: "What is the CUET UG signature size limit?",
    answer:
      "The CUET signature must be a JPG/JPEG between 10 KB and 50 KB. Note that this is not the same as the JEE Main and NEET band of 4–30 KB — a signature file prepared for those exams can be too small for CUET and get rejected. Compress to a 50 KB target with the BharatTools Image Compressor, or draw a fresh signature with the Signature Maker.",
  },
  {
    question: "Why does the CUET portal reject my upload instantly?",
    answer:
      "NTA runs an automatic validation system on every upload that checks file size, format and clarity before the file is accepted. It rejects at the portal, usually without saying which of the three failed. In practice it is almost always one of: the wrong format (PNG, WebP or HEIC instead of JPG), a file outside the KB band, or a blurred scan. Fix all three before re-uploading rather than guessing one at a time.",
  },
  {
    question: "What size should the PwD or UDID certificate be?",
    answer:
      "The disability/UDID certificate is uploaded as a PDF between 50 KB and 300 KB. If you have a photo or a multi-page scan, combine it into a single PDF with BharatTools JPG to PDF, then run PDF Compressor if it lands above 300 KB.",
  },
  {
    question: "Can I upload an iPhone HEIC photo to the CUET form?",
    answer:
      "No. The portal accepts JPG/JPEG only, and an iPhone photo saved as HEIC will fail validation. Convert it first with the BharatTools HEIC to JPG converter, or pass it straight through the CUET Photo Resizer, which accepts HEIC input and outputs JPG.",
  },
  {
    question: "How many subjects can I choose in CUET UG?",
    answer:
      "Up to five test subjects. Which ones you need is decided by the universities you are applying to, not by NTA — a course may require a specific language, one or two domain subjects, and the General Aptitude Test. Check the requirement published by each university before you finalise, because the subject combination cannot always be changed after the correction window closes.",
  },
  {
    question: "Are my photo and certificates uploaded to BharatTools' servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. The photo, signature and PDFs you process never leave your device — open DevTools and watch the Network tab while you compress and you will see no request carrying your file. We don't see it, don't store it, and don't need to.",
  },
  {
    question: "What if I have already submitted and spotted a mistake?",
    answer:
      "NTA opens a correction window after the application deadline in which a defined set of fields can be edited — historically this has included some personal details and subject choices, but not everything. Watch cuet.nta.nic.in for the correction-window dates and read the notice carefully, because fields left out of it stay as submitted.",
  },
];

export default function CuetUgGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "CUET UG" },
          ]),
          howToSchema({
            name: "How to fill the CUET UG application form",
            description:
              "Five-step guide to registering on the NTA CUET UG portal, verifying identity, choosing universities and subjects, uploading photo/signature/certificates at the correct KB spec, and paying the fee.",
            totalTimeIso: "PT40M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Fill the CUET UG Application Form"
        subtitle="Step-by-step guide to the NTA portal — registration, subject choices, photo (10–200 KB), signature (10–50 KB), certificate uploads, fee payment. Every tool linked here runs in your browser."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "CUET UG" },
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
              <strong>Class 10 marksheet</strong> — for date of birth and the exact spelling of your
              name and your parents&apos; names.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Class 12 details</strong> — board, roll number and subjects, whether you have
              appeared or are appearing.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Aadhaar or DigiLocker</strong> — for identity verification. Without either, a
              different photo ID as a JPG between 10 KB and 200 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Passport-size photo</strong> — colour, white background, 80% face including
              ears, no mask, JPG between 10 KB and 200 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Signature</strong> — JPG between 10 KB and 50 KB. Wider band than JEE and NEET
              use, so don&apos;t reuse a 4–30 KB file blindly.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Category and PwD certificates</strong> — UDID certificate as a PDF between
              50 KB and 300 KB if applicable.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>The subject requirement of every university you&apos;re applying to</strong> —
              decide this before you open the form, not while filling it.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>UPI / debit card / net banking</strong> — for the fee. Check the current
              notification for this session&apos;s amounts.
            </span>
          </li>
        </ul>
      </section>

      {/* The official spec — high keyword density, table format */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">CUET UG upload specifications</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          NTA screens every upload with an automatic validation system that checks size, format and
          clarity, and rejects at the portal. Match these exactly.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Upload</th>
                <th className="px-4 py-2 font-semibold">Format</th>
                <th className="px-4 py-2 font-semibold">File size</th>
                <th className="px-4 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Photograph</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">10 KB – 200 KB</td>
                <td className="px-4 py-2">
                  White background, 80% face including ears, no mask. 200×230 px.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Signature</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">10 KB – 50 KB</td>
                <td className="px-4 py-2">Black or blue ink on plain white paper.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">PwD / UDID certificate</td>
                <td className="px-4 py-2">PDF</td>
                <td className="px-4 py-2">50 KB – 300 KB</td>
                <td className="px-4 py-2">Only if you are claiming a PwD provision.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Identity proof</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">10 KB – 200 KB</td>
                <td className="px-4 py-2">
                  Only when you do not verify through Aadhaar or DigiLocker.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-body-sm text-surface-fg-muted">
          The signature band is the trap here. CUET allows 10–50 KB; JEE Main and NEET allow 4–30 KB.
          A signature file that sailed through your JEE form can sit below CUET&apos;s 10 KB floor
          and be rejected for being too small.
        </p>
      </section>

      {/* The five steps — one shown at a time via the stepper */}
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
                    <h3 className="text-heading-sm font-semibold">
                      Step 1 — Register on the NTA CUET portal
                    </h3>
                    <p className="text-body-md">
                      Open the official portal at cuet.nta.nic.in and click{" "}
                      <em>New Registration</em>. Enter your full name, your father&apos;s and
                      mother&apos;s names, date of birth and gender —{" "}
                      <strong>exactly as they appear on your Class 10 marksheet</strong>. A
                      mismatch here is the single most common cause of a late-stage problem, and the
                      correction window does not always cover every field.
                    </p>
                    <p className="text-body-md">
                      Verify your mobile number and email with the OTPs NTA sends, set a password,
                      and note down the <strong>Application Number</strong> it generates. Use a
                      mobile number and email you will still control a year from now — result and
                      counselling notices go to both.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 2",
                description: "Verify your identity",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 2 — Verify your identity</h3>
                    <p className="text-body-md">
                      CUET verifies candidates through <strong>Aadhaar or DigiLocker</strong>. If
                      your Aadhaar name or date of birth does not match your Class 10 marksheet,
                      sort that out before you start — an Aadhaar update takes days, and doing it
                      mid-application is worse than doing it first.
                    </p>
                    <p className="text-body-md">
                      If you verify through neither, the portal asks for another valid photo
                      identity proof as a <strong>JPG/JPEG between 10 KB and 200 KB</strong>. Scan
                      it flat, in colour, with the whole document inside the frame — a cropped
                      corner or a shadow across the ID number is a rejection.
                    </p>

                    <div className="space-y-3">
                      <ToolCallout
                        href="/image-compress/200kb"
                        title="ID proof: compress the scan to fit 10–200 KB"
                        reason="Binary-search JPEG that lands just under 200 KB, so the ID number stays readable instead of being crushed to fit."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                      <ToolCallout
                        href="/image-crop"
                        title="Trim the scan down to just the document"
                        reason="Cropping away the desk and the shadows shrinks the file before you compress it, which means less quality lost."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>
                  </>
                ),
              },
              {
                label: "Step 3",
                description: "Universities, subjects & cities",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">
                      Step 3 — Choose universities, subjects and exam cities
                    </h3>
                    <p className="text-body-md">
                      This is the part of the CUET form that actually decides your admissions, and
                      it is the part candidates rush. You may choose{" "}
                      <strong>up to five test subjects</strong> — typically a language, one or more
                      domain subjects, and the General Aptitude Test. Which combination you need is
                      set by the <strong>universities</strong>, not by NTA.
                    </p>
                    <p className="text-body-md">
                      Before you touch this screen, list every course you are seriously applying to
                      and write down the subjects each one requires. A single course that wants a
                      domain subject you did not select can be lost for the whole year on that one
                      omission. Where two courses want different combinations, choose the subjects
                      that cover the most of your list.
                    </p>
                    <p className="text-body-md">
                      Then pick your exam cities in order of how easily you can actually reach them
                      on exam morning. NTA allocates by availability, and a city you listed
                      optimistically is a city you may have to travel to.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 4",
                description: "Upload photo, signature & certificates",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">
                      Step 4 — Upload photo, signature and certificates
                    </h3>
                    <p className="text-body-md">
                      NTA&apos;s automatic validation checks file size, format and clarity and
                      rejects instantly at the portal, usually without telling you which of the
                      three failed. Prepare each file to spec before you get here — every tool below
                      runs in your browser, so your photo and certificates never leave your device.
                    </p>

                    <div className="space-y-3">
                      <ToolCallout
                        href="/photo-resize/cuet"
                        title="Photo: resize to CUET spec (200×230 px, 10–200 KB, white background)"
                        reason="Crops to the right aspect, sets the white background, and lands inside the KB band — the three things the validator checks, in one pass."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-compress/50kb"
                        title="Signature: compress to the 10–50 KB band"
                        reason="Targets 50 KB and stops there. Check the result is above 10 KB too — CUET rejects a signature that is too small, not just one that is too big."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/signature-maker"
                        title="No scanner? Draw the signature instead"
                        reason="Sign on screen with a finger or mouse and download a clean JPG on white — no paper, no scan, no shadow to compress away."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/jpg-to-pdf"
                        title="UDID / category certificate: combine scans into one PDF"
                        reason="Drop one or many scans, reorder them, and download a single PDF — which is the format the certificate fields expect."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/pdf-compress"
                        title="If the certificate PDF is over 300 KB: compress it"
                        reason="Re-encodes the embedded scans and strips metadata to land inside the 50–300 KB band without re-scanning anything."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>

                    <p className="text-body-md">
                      One thing worth checking before you upload the photo: the rule is 80% face{" "}
                      <em>including the ears</em>. A photo cropped tight to the jawline technically
                      fails, and it is the kind of thing that gets flagged at the exam centre rather
                      than at upload time. Leave the ears in.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 5",
                description: "Pay the fee & submit",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">
                      Step 5 — Pay the fee and download the confirmation
                    </h3>
                    <p className="text-body-md">
                      The verification page summarises everything you entered. Read it in full,
                      slowly. Specifically re-check: the spelling of your name and your
                      parents&apos; names, date of birth, category, the exact list of test subjects,
                      and the order of your exam cities.
                    </p>
                    <p className="text-body-md">
                      Pay online by UPI, net banking, debit or credit card. For the 2026 session the
                      fee was <strong>₹1,000</strong> for General, <strong>₹900</strong> for
                      OBC-NCL and EWS, and <strong>₹800</strong> for SC, ST, PwBD and Third Gender
                      candidates for up to three subjects, with an additional per-subject charge
                      beyond three — check the current bulletin, as NTA revises these between
                      sessions. The fee is non-refundable.
                    </p>
                    <p className="text-body-md">
                      Once payment is confirmed, download the <strong>confirmation page</strong>.
                      Save the PDF and print a copy. If the payment is debited but the confirmation
                      does not appear, do not pay again immediately — wait for the portal to
                      reconcile, which usually takes a few hours, and check your application status
                      before retrying.
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
            href: "/photo-resize/cuet",
            title: "CUET Photo Resizer",
            description: "200×230 px, 10–200 KB, white background. One step, all three checks.",
          },
          {
            href: "/image-compress",
            title: "Image Compressor",
            description: "Hit any exact KB target — 50 KB for the signature, 200 KB for an ID scan.",
          },
          {
            href: "/signature-maker",
            title: "Signature Maker",
            description: "Draw a signature and download it as JPG on white. No scanner needed.",
          },
          {
            href: "/jpg-to-pdf",
            title: "JPG / Image to PDF",
            description: "Turn certificate scans into one PDF. Reorder, rotate, A4 or Letter.",
          },
          {
            href: "/pdf-compress",
            title: "PDF Compressor",
            description: "Shrink a certificate PDF into the 50–300 KB band.",
          },
          {
            href: "/image-crop",
            title: "Image Cropper",
            description: "Trim a scan to the document before compressing, so less quality is lost.",
          },
        ]}
      />

      {/* Privacy nudge */}
      <section className="mt-12 rounded-md border-l-4 border-l-success-9 border border-surface-border-subtle bg-success-3/30 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">
              Why use BharatTools instead of uploading to a photo-resize site?
            </h3>
            <p className="mt-1 text-body-sm">
              Your CUET application carries your photo, your signature and your Aadhaar or ID scan —
              the exact set an identity thief wants. Every tool above runs locally in your browser,
              so none of it touches a server. Open the DevTools Network tab while you compress:
              zero requests. If you need to move files between your phone and a cyber café, use{" "}
              <Link href="/quick-send" className="font-medium underline">
                Quick Send
              </Link>{" "}
              instead of WhatsApp — it is peer-to-peer and stores nothing.
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
          The CUET Photo Resizer handles dimensions, the KB band and the white background in one
          pass.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/photo-resize/cuet">Open CUET Photo Resizer →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Specifications based on the NTA CUET (UG) 2026 Information Bulletin. {LAST_UPDATED_LABEL}.
        Always cross-check the current bulletin at cuet.nta.nic.in before submitting — NTA revises
        file-size bands, subject rules and fees between sessions.
      </p>
    </main>
  );
}

// Keep ESLint from complaining about the date string when it's unused in
// future variants of this page (e.g. a localized hi version).
void LAST_UPDATED;
