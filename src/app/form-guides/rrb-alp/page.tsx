import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
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

const LAST_UPDATED = "2026-06-12";
const LAST_UPDATED_LABEL = "Updated June 2026";

const PAGE_TITLE =
  "RRB ALP Application Form Filling Guide 2026 — Photo, Signature & KB Specs";
const PAGE_DESCRIPTION =
  "Step-by-step guide to filling the RRB Assistant Loco Pilot (ALP) application on the centralized rrbapply.gov.in portal: Aadhaar-linked registration, RRB zone selection, education and CBT-2 trade, photo (20–50 KB), signature (20–50 KB), SC/ST certificate (50–100 KB), fee payment with refund-setup, and confirmation. Free in-browser tools, nothing uploaded.";

const PAGE_KEYWORDS = [
  "RRB ALP form filling",
  "Railway ALP application form 2026",
  "how to fill RRB ALP form",
  "rrbapply.gov.in registration",
  "RRB ALP photo size",
  "RRB ALP photo 50 KB",
  "RRB ALP signature size",
  "RRB ALP signature 50 KB",
  "Railway ALP photo specification",
  "Railway ALP signature specification",
  "RRB Assistant Loco Pilot form steps",
  "RRB ALP document upload",
  "RRB ALP fee refund",
  "RRB ALP SC ST certificate upload",
  "रेलवे एएलपी फॉर्म कैसे भरें",
  "रेलवे एएलपी फोटो साइज़",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/rrb-alp",
    languages: {
      "en-IN": "/form-guides/rrb-alp",
      "hi-IN": "/form-guides/rrb-alp",
      "x-default": "/form-guides/rrb-alp",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/rrb-alp",
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

// Steps surfaced as HowTo schema + page body. Keep aligned with the
// centralized rrbapply.gov.in flow — RRB occasionally tweaks the wizard
// between notifications.
const STEPS: { title: string; text: string }[] = [
  {
    title: "Register on the centralized RRB portal",
    text: "Open rrbapply.gov.in, click Apply and select Create an Account. Enter basic demographics matching your Class 10 certificate (full name, DOB, gender, parents' names), verify your Aadhaar via OTP, then verify mobile and email via separate OTPs, set a password, and submit. Name, DOB, mobile, and email cannot be changed later — even during the correction window.",
  },
  {
    title: "Open the ALP application and pick your RRB zone",
    text: "Log back in, find the Assistant Loco Pilot notification under ongoing recruitments and click Apply Now. Select one RRB regional zone (Mumbai, Chandigarh, Bhopal, etc.) — only one zone is permitted; submitting to multiple results in rejection. Enter category (UR/OBC/SC/ST/EWS), religion, marital status, mother tongue, and present and permanent addresses.",
  },
  {
    title: "Fill education and CBT-2 trade",
    text: "Add Matriculation (Class 10) details first and save. Then add your technical qualification — ITI trade, CCAA apprenticeship, Diploma, or Engineering degree — with college details. Finally choose the technical trade subject you want to be tested on for Part B of the CBT-2 second-stage exam.",
  },
  {
    title: "Upload photo, signature, and certificate",
    text: "Photo: recent colour passport-style, white background, no caps or sunglasses, JPG/JPEG between 20 KB and 50 KB. Signature: running-hand signature on plain white paper in black or blue ink, JPG/JPEG between 20 KB and 50 KB. SC/ST candidates opting for the free travel pass also upload a community certificate as JPG/JPEG between 50 KB and 100 KB.",
  },
  {
    title: "Pay the fee with refund-setup",
    text: "Fee is ₹500 for General/OBC/EWS (₹400 refunded after appearing in CBT-1) and ₹250 for SC/ST/Female/Ex-SM/Minority/EBC (fully refunded after CBT-1). Enter your bank account holder name, account number, and IFSC — the refund is credited there. Pay via UPI, Net Banking, or Debit/Credit Card. Do not refresh until you see Payment Successful.",
  },
  {
    title: "Final review, declarations, and confirmation page",
    text: "Review every field on the preview screen. Tick declarations confirming you meet the physical, A-1 medical (vision) and educational standards. Click Final Submit, then download the Confirmation Page as PDF and print a hard copy for your records.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the RRB ALP photo size limit?",
    answer:
      "The RRB ALP photo must be a JPG/JPEG between 20 KB and 50 KB on a white background — no caps, no sunglasses, recent colour, face clearly visible. Use the BharatTools Railway Photo Resizer — it crops to the right aspect, sets the white background, and lands the file inside the 20–50 KB band in one pass, entirely in your browser.",
  },
  {
    question: "What is the RRB ALP signature size limit?",
    answer:
      "The signature must be a JPG/JPEG between 20 KB and 50 KB — sign in running hand on plain white paper using a black or blue pen, then scan or photograph it. If your scan is bigger than 50 KB or smaller than 20 KB, the BharatTools Image Compressor with a custom KB target lands the file inside the band.",
  },
  {
    question: "What is the RRB ALP SC/ST certificate upload spec?",
    answer:
      "Mandatory only if you're applying under SC or ST category and have opted for the free rail travel authority. Format: JPG/JPEG, file size between 50 KB and 100 KB. Use the BharatTools Image Compressor with a custom KB target of 100 — it binary-searches JPEG quality to land within ±5%, comfortably inside the band.",
  },
  {
    question: "Can I apply to more than one RRB zone for ALP?",
    answer:
      "No. The notification explicitly states you can apply to only one RRB regional zone. Submitting applications to multiple zones results in all of them being rejected. Pick the zone where you'd most prefer to be posted before you start the form — the choice cannot be changed after submission.",
  },
  {
    question: "How does the RRB ALP fee refund work?",
    answer:
      "After you appear in CBT-1, RRB refunds part of the application fee to the bank account you entered on the form. General/OBC/EWS candidates get ₹400 back out of the ₹500 paid. SC/ST/Female/Ex-Servicemen/Minority/EBC candidates get the entire ₹250 back. Make sure your account holder name, account number, and IFSC are correct — wrong details delay the refund.",
  },
  {
    question: "What does Aadhaar verification do during RRB registration?",
    answer:
      "RRB pulls your name, DOB, gender, and parents' names from the Aadhaar database after you complete the OTP step. This is highly recommended — it speeds up biometric authentication at the exam hall and reduces the chance of a name-mismatch rejection at document verification. Without Aadhaar linking you can still apply, but be ready for stricter manual checks.",
  },
  {
    question: "Why does the RRB portal reject my photo?",
    answer:
      "Three common reasons: (1) wrong format — must be JPG/JPEG, not PNG/HEIC/WebP; (2) outside the 20–50 KB band — too small or too large; (3) wrong background or composition — RRB rejects coloured backgrounds, caps, sunglasses, or photos where the face isn't clearly visible. The Railway Photo Resizer handles all three in a single in-browser step.",
  },
  {
    question: "Are my photos uploaded to BharatTools' servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. Your photo, signature, and certificate never leave your device — open DevTools Network tab while you compress and you'll see zero requests. We don't see your file. We don't store it. We don't need to.",
  },
];

export default function RrbAlpGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "RRB ALP" },
          ]),
          howToSchema({
            name: "How to fill the RRB Assistant Loco Pilot application form",
            description:
              "Six-phase guide to registering on the centralized rrbapply.gov.in portal with Aadhaar verification, picking an RRB zone, filling education and CBT-2 trade details, uploading photo, signature and certificate at the correct KB spec, paying the fee with refund-setup, and downloading the confirmation page.",
            totalTimeIso: "PT35M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Fill the RRB ALP Application Form"
        subtitle="Step-by-step guide to the centralized rrbapply.gov.in portal — Aadhaar-linked registration, RRB zone, education and CBT-2 trade, photo (20–50 KB), signature (20–50 KB), SC/ST certificate (50–100 KB), and fee payment with refund setup. Use the in-browser tools we link inline; nothing leaves your device."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "RRB ALP" },
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
              <strong>Active mobile number and email ID</strong> — kept live through the
              whole recruitment cycle; OTPs and exam updates land here.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Aadhaar number</strong> — strongly recommended for OTP-based KYC during
              registration and faster biometric verification at the exam hall.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Class 10 (Matriculation) details</strong> — roll number, board, year
              of passing. Plus your ITI trade / CCAA apprenticeship / Diploma / Engineering
              degree details with college name.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Recent passport-size photo</strong> — colour, white background, no caps
              or sunglasses, JPG between 20 KB and 50 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Signature scan</strong> — running hand in black/blue ink on plain white
              paper, JPG between 20 KB and 50 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>SC/ST community certificate</strong> as JPG between 50 KB and 100 KB —
              only if applying under SC/ST and opting for the free rail travel pass.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Bank details for refund</strong> — account holder name, account number,
              and IFSC. Most of the fee is refunded after you appear in CBT-1.
            </span>
          </li>
        </ul>
      </section>

      {/* The official spec — high keyword density, table format */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">RRB ALP 2026 photo, signature and certificate specifications</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The portal rejects uploads that miss any of these — wrong format, wrong size, wrong
          background. Match the spec exactly.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Field</th>
                <th className="px-4 py-2 font-semibold">Photo</th>
                <th className="px-4 py-2 font-semibold">Signature</th>
                <th className="px-4 py-2 font-semibold">SC/ST cert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Format</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">JPG / JPEG</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">File size</td>
                <td className="px-4 py-2">20 KB – 50 KB</td>
                <td className="px-4 py-2">20 KB – 50 KB</td>
                <td className="px-4 py-2">50 KB – 100 KB</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Background</td>
                <td className="px-4 py-2">White</td>
                <td className="px-4 py-2">White paper</td>
                <td className="px-4 py-2">As scanned</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Composition</td>
                <td className="px-4 py-2">Face clear, no caps / sunglasses</td>
                <td className="px-4 py-2">Black or blue ink, running hand</td>
                <td className="px-4 py-2">Mandatory only for SC/ST + free travel</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* The six phases — one shown at a time via the stepper */}
      <section className="mt-12">
        <h2 className="text-heading-md font-semibold">Six phases to submit the form</h2>

        <div className="mt-6">
          <FormGuideSteps
            steps={[
              {
                label: "Phase 1",
                description: "Register on the RRB portal",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Phase 1 — Register on the centralized RRB portal</h3>
                    <p className="text-body-md">
                      Open <strong>rrbapply.gov.in</strong> and click <em>Apply</em> at the top right,
                      then <em>Create an Account</em>. Enter your demographics exactly as they appear
                      on your Class 10 certificate: nationality, full name (and whether your name has
                      been changed), date of birth, gender, father&apos;s name, and mother&apos;s name.
                      A mismatch with the Class 10 marksheet is the most common reason applications get
                      held up at document verification later.
                    </p>
                    <p className="text-body-md">
                      Enter your Aadhaar number and click <em>Verify Using Aadhaar</em> to complete
                      OTP-based KYC — RRB strongly recommends this because it speeds up biometric
                      authentication at the exam hall. Then enter your email and mobile, generate
                      separate OTPs for each, type them into the verification boxes, set a secure
                      password, and hit <em>Preview and Create Account</em>.
                    </p>
                    <div className="rounded-md border-l-4 border-l-warning-9 border border-surface-border-subtle bg-warning-3/30 p-4 text-body-sm">
                      <strong className="text-warning-12">Critical:</strong> once your account is created,
                      your <strong>name, date of birth, mobile number, and email ID cannot be changed</strong> —
                      not even during the correction window. Cross-check character-by-character before submit.
                    </div>
                  </>
                ),
              },
              {
                label: "Phase 2",
                description: "Pick your RRB zone",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Phase 2 — Open the ALP form and pick an RRB zone</h3>
                    <p className="text-body-md">
                      Log back in with your mobile or email and password. Under the ongoing notifications
                      panel, click <em>Apply Now</em> next to the Assistant Loco Pilot recruitment link.
                      The first major choice is your <strong>RRB regional zone</strong> — Mumbai,
                      Chandigarh, Bhopal, Secunderabad, and so on. You can apply to <strong>only one
                      zone</strong>; submitting to multiple results in all applications being rejected.
                      Pick the zone where you&apos;d most prefer to be posted before you click.
                    </p>
                    <p className="text-body-md">
                      On the personal details page enter your category (UR, OBC, SC, ST, EWS), religion,
                      marital status, mother tongue, and your present and permanent postal addresses.
                      If the two addresses are the same, most portals offer a copy-down toggle — use it
                      to avoid typos.
                    </p>
                  </>
                ),
              },
              {
                label: "Phase 3",
                description: "Education & CBT-2 trade",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Phase 3 — Fill education and CBT-2 trade</h3>
                    <p className="text-body-md">
                      Fill <strong>Matriculation (Class 10)</strong> first — board, roll number, year of
                      passing — and click save. Then add your technical qualification from the dropdown:
                      ITI trade, CCAA (Course Completed Act Apprenticeship), Diploma, or Engineering
                      degree. Enter the college / institute name and click <em>Add</em>.
                    </p>
                    <p className="text-body-md">
                      Finally select the <strong>CBT-2 Part B technical trade subject</strong> you want
                      to be tested on for the second-stage exam. This choice flows from your ITI /
                      Diploma / Degree stream — most candidates pick the trade closest to what they
                      studied, because the syllabus depth assumes that background.
                    </p>
                  </>
                ),
              },
              {
                label: "Phase 4",
                description: "Upload photo, signature & certificate",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Phase 4 — Upload photo, signature, and certificate</h3>
                    <p className="text-body-md">
                      This is where most rejections happen. The portal enforces strict format and KB
                      limits — wrong format, wrong size band, or missing white background and the
                      upload bounces. Prepare each file using the right tool below — every tool runs
                      in your browser, so your photo, signature, and certificate never leave your device.
                    </p>

                    <div className="space-y-3">
                      <ToolCallout
                        href="/photo-resize/railway"
                        title="Photo: resize to Railway/RRB spec (20–50 KB, white background)"
                        reason="Crops to the right aspect, replaces the background with white, and lands inside the KB band — one upload, all three requirements."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-compress/50kb"
                        title="Signature: compress to 50 KB"
                        reason="One-click 50 KB preset — binary-search JPEG that lands within ±5% of the cap, comfortably inside the 20–50 KB band."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-compress/100kb"
                        title="SC/ST certificate: compress to 100 KB"
                        reason="One-click 100 KB preset — lands inside the 50–100 KB band. Use only if applying under SC/ST with free rail travel."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/document-photo"
                        title="Need to fix background or remove a coloured studio backdrop?"
                        reason="On-device background removal sets clean white behind the face — no upload, no waiting, no watermark."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>

                    <p className="text-body-md">
                      A note on the signature: sign in running hand with a thicker black or blue pen on
                      plain white paper. Thin felt-tip strokes scan faintly and the upload tool often
                      reads them as a near-blank image. If you have to redo it, take the scan with even,
                      indirect lighting — no shadow across the page.
                    </p>
                  </>
                ),
              },
              {
                label: "Phase 5",
                description: "Pay the fee (refund setup)",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Phase 5 — Pay the fee (with refund setup)</h3>
                    <p className="text-body-md">
                      Enter your bank account holder name, account number, and IFSC before you pay —
                      this is the account RRB will refund into after you appear in CBT-1. Wrong details
                      delay the refund by months.
                    </p>
                    <div className="overflow-x-auto rounded-md border border-surface-border-subtle">
                      <table className="w-full text-body-sm">
                        <thead className="bg-surface-2">
                          <tr className="text-left">
                            <th className="px-4 py-2 font-semibold">Category</th>
                            <th className="px-4 py-2 font-semibold">Application fee</th>
                            <th className="px-4 py-2 font-semibold">Refund after CBT-1</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border-subtle">
                          <tr>
                            <td className="px-4 py-2 font-medium">General / OBC / EWS</td>
                            <td className="px-4 py-2">₹500</td>
                            <td className="px-4 py-2">₹400</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-medium">SC / ST / Female / Ex-SM / Minority / EBC</td>
                            <td className="px-4 py-2">₹250</td>
                            <td className="px-4 py-2">₹250 (full)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-body-md">
                      Pay via <strong>UPI</strong>, <strong>Net Banking</strong>, or
                      <strong> Debit/Credit Card</strong>. UPI is fastest and avoids 3-D-secure timeouts
                      common on Indian bank cards. Do not refresh or hit back until the page redirects
                      with a <em>Payment Successful</em> confirmation — refreshing mid-transaction
                      sometimes deducts money without registering payment on the portal, and recovery
                      takes a week.
                    </p>
                  </>
                ),
              },
              {
                label: "Phase 6",
                description: "Final review & confirmation",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Phase 6 — Final review and confirmation page</h3>
                    <p className="text-body-md">
                      The preview screen is the last chance to catch typos. <strong>Read every field</strong> —
                      name spelling, DOB, category, RRB zone, education board, trade — then tick the
                      declaration boxes confirming you meet the physical, A-1 medical (vision) and
                      educational standards. Click <em>Final Submit</em>.
                    </p>
                    <p className="text-body-md">
                      Download the <strong>Confirmation Page</strong> as PDF and keep a hard copy.
                      You&apos;ll need it for CBT-1 admit-card download, exam-hall verification, and the
                      document-verification round later.
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
            href: "/photo-resize/railway",
            title: "Railway / RRB Photo Resizer",
            description: "20–50 KB, white background. Done in one step.",
          },
          {
            href: "/image-compress/50kb",
            title: "Image Compressor — 50 KB",
            description: "Signature preset — binary-search JPEG that lands at or under 50 KB.",
          },
          {
            href: "/image-compress/100kb",
            title: "Image Compressor — 100 KB",
            description: "SC/ST certificate preset — lands at or under 100 KB.",
          },
          {
            href: "/document-photo",
            title: "Document Photo Maker",
            description: "Removes background on-device and sets clean white for portal uploads.",
          },
          {
            href: "/quick-send",
            title: "Quick Send",
            description: "Move prepared files between your phone and laptop peer-to-peer.",
          },
        ]}
      />

      {/* Privacy nudge */}
      <section className="mt-12 rounded-md border-l-4 border-l-success-9 border border-surface-border-subtle bg-success-3/30 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Why use BharatTools instead of uploading to a generic compressor?</h3>
            <p className="mt-1 text-body-sm">
              Every tool above runs locally in your browser — your photo, signature, and
              certificate never touch a server. Open DevTools Network tab while you compress:
              zero requests. If you need to move the prepared files from your phone to a
              cybercafé laptop, use{" "}
              <Link href="/quick-send" className="font-medium underline">Quick Send</Link> —
              peer-to-peer, also no upload.
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
          The Railway Photo Resizer handles dimensions, KB target, and white background in one pass.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/photo-resize/railway">Open Railway Photo Resizer →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Specifications based on the centralized RRB ALP notification on rrbapply.gov.in.{" "}
        {LAST_UPDATED_LABEL}. Always cross-check the current notification on rrbapply.gov.in
        before submitting — RRB occasionally revises file-size bands and the refundable
        portion of the fee between cycles.
      </p>
    </main>
  );
}

// Keep ESLint from complaining about the date string when it's unused in
// future variants of this page (e.g. a localized hi version).
void LAST_UPDATED;
