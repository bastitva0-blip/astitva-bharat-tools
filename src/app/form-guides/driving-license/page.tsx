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
  "Driving Licence Application Guide 2026 — Sarathi Portal, Learner Licence & DL Steps";
const PAGE_DESCRIPTION =
  "Complete walkthrough of the Sarathi portal (sarathi.parivahan.gov.in): registration, learner licence form, LL test booking, driving test, and final DL. Upload Aadhaar, photo, and address proof. Fees vary by state. Free in-browser tools — nothing leaves your device.";

const PAGE_KEYWORDS = [
  "driving licence application India",
  "how to apply for driving licence",
  "sarathi.parivahan.gov.in registration",
  "Sarathi portal driving licence",
  "learner licence online apply",
  "LL test India",
  "driving licence photo size",
  "driving licence photo specification",
  "DL application documents",
  "learner licence to DL process",
  "ड्राइविंग लाइसेंस कैसे बनाएं",
  "सारथी पोर्टल",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/driving-license",
    languages: {
      "en-IN": "/form-guides/driving-license",
      "hi-IN": "/form-guides/driving-license",
      "x-default": "/form-guides/driving-license",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/driving-license",
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
    title: "Step 1 — Register on Sarathi",
    text: "Open sarathi.parivahan.gov.in and select your state. Click 'Apply for Learner Licence'. Create an account using your Aadhaar number — the portal uses Aadhaar for identity verification. Complete OTP verification on your Aadhaar-linked mobile number. Set a password to access your Sarathi account.",
  },
  {
    title: "Step 2 — Fill the Learner Licence (LL) form",
    text: "Fill in personal details (name, DOB, address, contact), select vehicle categories you want the licence for (e.g. Motor Cycle without gear, Light Motor Vehicle, both), and upload documents: Aadhaar (identity + address), a recent colour photograph (JPG, plain white background), and date of birth proof if different from Aadhaar.",
  },
  {
    title: "Step 3 — Pay fee and book LL test slot",
    text: "Pay the learner licence application fee (varies by state and vehicle categories selected — typically ₹200–₹500). After payment, book a slot at your nearest Regional Transport Office (RTO) for the Learner Licence theory test. The test is a computer-based multiple-choice exam on traffic rules and road signs.",
  },
  {
    title: "Step 4 — Pass the LL test at RTO",
    text: "Visit the RTO on your test date. Carry your printed application receipt, Aadhaar original, and any other documents specified. The LL test is typically 15–20 questions on traffic rules and signs. Pass mark is usually 57–60%. On passing, the LL is generated electronically and linked to your Aadhaar/DigiLocker — physical card may be posted or can be downloaded from DigiLocker.",
  },
  {
    title: "Step 5 — Apply for Permanent Driving Licence (DL)",
    text: "After holding your LL for at least 30 days (and up to 180 days), apply for the permanent DL on the Sarathi portal. Log in, select 'Apply for Driving Licence', fill the DL form, and upload the LL number, photo, and Aadhaar. Pay the DL application fee.",
  },
  {
    title: "Step 6 — Book driving test and get DL",
    text: "Book a driving test slot at your RTO. Appear with your vehicle on the test date — a driving inspector evaluates your driving on a designated test track. On passing, the permanent DL is issued and dispatched by post to your registered address, or available on DigiLocker within a few working days.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the driving licence photo specification for Sarathi?",
    answer:
      "The Sarathi portal requires a recent colour photograph in JPG format with a plain white background. The face should be clearly visible, frontal, eyes open. No glasses, no headwear (except for religious reasons). Exact pixel dimensions are not published, but most RTOs accept any clear colour photo in the 20–100 KB range. Use BharatTools Image Compressor to resize your photo if the portal rejects it.",
  },
  {
    question: "What documents do I need to upload on Sarathi?",
    answer:
      "For a learner licence application on Sarathi: (1) Aadhaar card — covers identity and address proof in one document; (2) Recent colour photograph — JPG, plain white background; (3) Date of birth proof — Aadhaar itself works, or Class 10 certificate if Aadhaar DOB is not accepted for some reason. Some states also require a medical certificate (Form 1A) for certain LMV categories.",
  },
  {
    question: "How long does it take to get a permanent driving licence?",
    answer:
      "The minimum timeline is about 30–35 days: you must hold your Learner Licence for at least 30 days before applying for the permanent DL. After the driving test at the RTO, the DL is issued within 7–15 working days and dispatched by Speed Post. Total: 45–60 days from starting the application to receiving the DL. Tatkal processing may be available at some RTOs for a higher fee.",
  },
  {
    question: "What vehicle categories can I apply for on the same application?",
    answer:
      "Sarathi allows you to select multiple vehicle categories on the same application: Motorcycle without gear (MCWOG), Motorcycle with gear (MCWG), Light Motor Vehicle (LMV), and more. You pay a fee for each category. You can hold a combined LL and DL for multiple categories. Most people apply for MCWG and LMV together to cover both two-wheelers with gear and cars.",
  },
  {
    question: "What is the Sarathi learner licence test format?",
    answer:
      "The LL test is a computer-based multiple-choice exam at the RTO. There are 15–20 questions covering traffic rules, road signs, and safe driving practices. The pass mark is typically 57–60% (state-dependent). If you fail, you can reattempt after a waiting period specified by your state RTO. Practice using the NeSL mock test available on the Sarathi portal under 'Study Material'.",
  },
  {
    question: "Can I download my driving licence from DigiLocker?",
    answer:
      "Yes. After issuance, your Learner Licence and permanent DL are linked to your Aadhaar and available on DigiLocker as official digital documents. The DigiLocker DL is legally valid for traffic stops under the Motor Vehicles Act (2019 amendment). Many RTOs no longer post a physical card — DigiLocker is the primary issuance channel. You can also request a physical card through the Sarathi portal.",
  },
  {
    question: "Are my files uploaded to BharatTools servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. Your photo and Aadhaar scan never leave your device — verify with DevTools Network tab while you process. Zero upload requests. Aadhaar in particular must not be uploaded to untrusted third-party servers; BharatTools processes nothing server-side.",
  },
];

export default function DrivingLicenseGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "Driving Licence" },
          ]),
          howToSchema({
            name: "How to apply for a driving licence in India (Sarathi portal)",
            description:
              "Six-step walkthrough of the Sarathi portal — registration with Aadhaar, learner licence form, LL test, permanent DL application, driving test, and DL dispatch.",
            totalTimeIso: "PT60M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Apply for a Driving Licence in India (Sarathi Guide 2026)"
        subtitle="Complete walkthrough of sarathi.parivahan.gov.in — Aadhaar-based registration, learner licence form and LL test, permanent DL application and driving test. Upload photo, Aadhaar, and address proof. Fee varies by state."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "Driving Licence" },
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
              <strong>Aadhaar card</strong> — linked to an active mobile number (OTP verification required during registration). Covers identity and address proof.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Recent colour photograph</strong> — plain white background, face clearly visible, JPG. No glasses, no headwear.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Date of birth proof</strong> — Aadhaar usually suffices; alternatively a Class 10 marksheet or birth certificate.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Vehicle categories decided</strong> — MCWOG (two-wheeler without gear / scooter), MCWG (motorcycle with gear), LMV (car), or a combination.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Debit card / UPI / net banking</strong> — fee varies by state and number of vehicle categories. Expect ₹200–₹600 for LL; similar for DL.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Vehicle for driving test</strong> — bring your own vehicle (motorcycle or car, as applicable) for the permanent DL driving test at the RTO.
            </span>
          </li>
        </ul>
      </section>

      {/* Overview table */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">Photo and document uploads on Sarathi</h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Upload</th>
                <th className="px-4 py-2 font-semibold">Format</th>
                <th className="px-4 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Photograph</td>
                <td className="px-4 py-2">JPG, colour</td>
                <td className="px-4 py-2">Plain white background, recent, face clearly visible, no glasses</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Aadhaar (identity + address)</td>
                <td className="px-4 py-2">JPG or PDF</td>
                <td className="px-4 py-2">Both sides of Aadhaar card; front and back as a single PDF</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">DOB proof (if separate)</td>
                <td className="px-4 py-2">JPG or PDF</td>
                <td className="px-4 py-2">Class 10 marksheet or birth certificate; not required if Aadhaar DOB is accepted</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-body-xs text-surface-fg-muted">Exact file size limits vary by state RTO and Sarathi portal version. Keep files under 100 KB for photos and under 300 KB for PDFs to avoid upload errors.</p>
      </section>

      {/* Warning */}
      <section className="mt-10 rounded-md border border-surface-border-subtle border-l-4 border-l-warning-9 bg-warning-3/30 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Hold your LL for at least 30 days before applying for the permanent DL</h3>
            <p className="mt-1 text-body-sm">
              The Motor Vehicles Act requires a minimum 30-day gap between the Learner Licence issue date and the Permanent DL application. The Sarathi portal enforces this automatically — it will not allow you to apply for the DL before 30 days have elapsed. Use this period to practise driving under the supervision of a licensed driver.
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
                description: "Register on Sarathi",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 1 — Register on Sarathi</h3>
                    <p className="text-body-md">
                      Open <strong>sarathi.parivahan.gov.in</strong> and select your state from the dropdown. Click <em>Apply for Learner Licence</em>. The portal will prompt you to enter your Aadhaar number and complete Aadhaar-based OTP authentication — the OTP goes to your Aadhaar-linked mobile number.
                    </p>
                    <p className="text-body-md">
                      After successful Aadhaar verification, create your Sarathi account with a username and password. If your Aadhaar mobile number is not active, you will need to update it at an Aadhaar Seva Kendra before proceeding — Sarathi does not offer an alternate verification method.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 2",
                description: "Fill LL form and upload documents",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 2 — Fill LL form and upload documents</h3>
                    <p className="text-body-md">
                      Log in to Sarathi and fill the Learner Licence application form. Your Aadhaar data may be pre-filled — verify name, DOB, and address for accuracy. Select vehicle categories (MCWOG, MCWG, LMV, or any combination).
                    </p>
                    <p className="text-body-md">
                      Upload the required documents:
                    </p>

                    <div className="space-y-3 mt-3">
                      <ToolCallout
                        href="/image-compress/50kb"
                        title="Photo: compress for portal upload"
                        reason="Keep photo under 100 KB. Use Image Compressor with a 50 KB target — clear, recent colour photo with white background."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                      <ToolCallout
                        href="/jpg-to-pdf"
                        title="Aadhaar: combine front and back into one PDF"
                        reason="Photograph or scan the front and back of your Aadhaar card, then combine them into a single PDF for the document upload field."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                      <ToolCallout
                        href="/pdf-compress"
                        title="PDF too large? Compress under 300 KB"
                        reason="If your Aadhaar or DOB proof PDF exceeds the portal limit, compress here. Runs entirely in your browser — Aadhaar data never leaves your device."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>
                  </>
                ),
              },
              {
                label: "Step 3",
                description: "Pay fee and book LL test",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 3 — Pay fee and book LL test slot</h3>
                    <p className="text-body-md">
                      After uploading documents, proceed to fee payment. The fee depends on your state and the vehicle categories selected — typically ₹200–₹600 for the LL application. Pay via debit card, net banking, or UPI.
                    </p>
                    <p className="text-body-md">
                      After payment, book a slot for the Learner Licence theory test at your nearest RTO. Sarathi shows available dates and times. Print the appointment confirmation — carry it to the RTO.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 4",
                description: "LL test at RTO",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 4 — Pass the LL test at RTO</h3>
                    <p className="text-body-md">
                      Visit the RTO on your test date with your printed appointment receipt and original Aadhaar. The LL test is a 15–20 question computer-based multiple-choice exam covering traffic rules, road signs, and safe driving. Pass mark is typically 57–60%.
                    </p>
                    <p className="text-body-md">
                      Practise using the mock test available under <em>Study Material</em> on the Sarathi portal — the real exam draws from the same question bank. On passing, the LL is generated digitally and available on DigiLocker. A physical LL card may be posted separately depending on your state.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 5",
                description: "Apply for permanent DL",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 5 — Apply for permanent Driving Licence</h3>
                    <p className="text-body-md">
                      After holding your LL for <strong>at least 30 days</strong> (and within 180 days of LL issue), log in to Sarathi and click <em>Apply for Driving Licence</em>. Select your LL number and fill the DL application. Upload a fresh photo and any updated documents if required. Pay the DL application fee.
                    </p>
                    <p className="text-body-md">
                      Book a driving test slot at your RTO. Popular RTOs have 2–4 week waits — shortlist nearby RTOs for earlier slots.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 6",
                description: "Driving test and DL dispatch",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 6 — Driving test and DL dispatch</h3>
                    <p className="text-body-md">
                      Appear at the RTO driving test with your vehicle. A motor vehicle inspector evaluates your driving on a designated test track — typically an 8-shaped path and slope test for two-wheelers, or a slalom and lane-change exercise for LMV. The test usually lasts 5–10 minutes.
                    </p>
                    <p className="text-body-md">
                      On passing, the DL is issued within 7–15 working days and dispatched by Speed Post to your registered address. You also receive the DL on DigiLocker. The DigiLocker DL is legally valid under the Motor Vehicles Act for traffic stops.
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
            description: "Compress driving licence photo for Sarathi portal upload.",
          },
          {
            href: "/jpg-to-pdf",
            title: "JPG / Image to PDF",
            description: "Combine Aadhaar front and back into a single PDF for document upload.",
          },
          {
            href: "/pdf-compress",
            title: "PDF Compressor",
            description: "Reduce Aadhaar or DOB proof PDF size under portal limits.",
          },
        ]}
      />

      <section className="mt-12 rounded-md border-l-4 border-l-success-9 border border-surface-border-subtle bg-success-3/30 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Why use BharatTools for driving licence document preparation?</h3>
            <p className="mt-1 text-body-sm">
              Every BharatTools tool runs locally in your browser — your Aadhaar, photo, and address proof never leave your device. Open DevTools Network tab while you process: zero upload requests. Aadhaar must not be uploaded to untrusted third-party servers; BharatTools processes everything client-side. You can also move files between your phone and laptop without WhatsApp using{" "}
              <Link href="/quick-send" className="font-medium underline">Quick Send</Link>, a peer-to-peer transfer that stores nothing.
            </p>
          </div>
        </div>
      </section>

      <FaqAccordion faqs={FAQS} />

      <section className="mt-12 rounded-md border border-surface-border-subtle p-6 text-center">
        <h2 className="text-heading-md font-semibold">Ready to prepare your Sarathi documents?</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          Combine your Aadhaar front and back into one PDF — ready for the Sarathi document upload step. Runs entirely in your browser.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/jpg-to-pdf">Open JPG to PDF →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Steps and fees based on the Sarathi portal (sarathi.parivahan.gov.in) and Motor Vehicles Act guidelines as of {LAST_UPDATED_LABEL}. Fees and exact document requirements vary by state — cross-check with your state RTO before applying.
      </p>
    </main>
  );
}

void LAST_UPDATED;
