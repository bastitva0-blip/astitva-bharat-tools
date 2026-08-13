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
  "Passport Application & Renewal Guide 2026 — Passport Seva Photo Specs, Appointment & PSK Visit";
const PAGE_DESCRIPTION =
  "Step-by-step walkthrough of the Passport Seva portal (passportindia.gov.in): registration, fresh/renewal/tatkal form, appointment booking, photo spec (2×2 inch, white background), fee payment (₹1500–₹2000), and PSK visit. Free in-browser tools — nothing leaves your device.";

const PAGE_KEYWORDS = [
  "passport application guide",
  "passport renewal India 2026",
  "how to apply for passport India",
  "passportindia.gov.in registration",
  "Passport Seva portal",
  "PSK appointment booking",
  "passport photo size India",
  "passport photo 2x2 inch",
  "passport photo white background",
  "fresh passport form",
  "tatkal passport fee",
  "passport renewal fee 2026",
  "पासपोर्ट के लिए आवेदन कैसे करें",
  "पासपोर्ट फोटो साइज़",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/passport",
    languages: {
      "en-IN": "/form-guides/passport",
      "hi-IN": "/form-guides/passport",
      "x-default": "/form-guides/passport",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/passport",
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
    title: "Step 1 — Register on Passport Seva",
    text: "Open passportindia.gov.in and click 'Register Now'. Enter your name, date of birth, email ID, and set a login ID and password. Verify your email via the activation link sent to your inbox. Log in to the Passport Seva portal.",
  },
  {
    title: "Step 2 — Fill the application form",
    text: "Click 'Apply for Fresh Passport/Re-issue of Passport'. Select the appropriate form: fresh passport, renewal (re-issue), tatkal (urgent), or lost/damaged. Fill all tabs: personal details (name, DOB, place of birth, father/mother/spouse name), family details, present and permanent address, and emergency contact. For renewal, enter your current passport number, issue date, and issuing authority.",
  },
  {
    title: "Step 3 — Schedule appointment at PSK",
    text: "After saving the form, click 'Schedule Appointment'. Select your nearest Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK). Choose an available date and time slot. Appointment availability varies by city — metro PSKs have longer wait times; POPSK centres often have shorter queues.",
  },
  {
    title: "Step 4 — Pay the fee",
    text: "Pay the application fee online: ₹1500 for Normal fresh 36-page passport; ₹2000 for Tatkal fresh 36-page; ₹2000 for fresh 60-page booklet. Renewal fees differ — check the current fee schedule at passportindia.gov.in. Payment via debit/credit card, net banking, or SBI Challan.",
  },
  {
    title: "Step 5 — Visit the PSK with documents",
    text: "Carry the printed application receipt, original documents with self-attested copies: Aadhaar (proof of identity + address), Date of birth proof (birth certificate or Class 10 certificate), and two recent passport-size photographs (2×2 inch, white background). At the PSK, go through counters A, B, and C in sequence — document verification, biometric capture, and officer interview if required.",
  },
  {
    title: "Step 6 — Track dispatch and collect",
    text: "After PSK visit, the application moves to police verification (normal passports) or is dispatched directly (tatkal). Track status on the Passport Seva portal or via SMS. The passport is delivered by Speed Post to your registered address. Track the consignment via India Post tracking.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the passport photo specification for India?",
    answer:
      "The Indian passport photo must be 2×2 inches (51×51 mm), in colour, with a plain white background. Your face must cover 70–80% of the frame — chin to crown. Eyes should be open and looking directly at the camera. Neutral expression, no smiling with teeth. No glasses (MEA updated this in 2016). No hats or head coverings except for religious reasons. The photo must be recent (taken within the last six months). At the PSK you must carry physical printed photos — the online upload is also required on the portal.",
  },
  {
    question: "Do I need to upload a photo on the Passport Seva portal?",
    answer:
      "Yes — the Passport Seva portal requires a digital photo upload as part of the online application. Additionally, you must carry two physical printed passport-size photographs (2×2 inch, white background) when you visit the PSK. Both digital upload and physical photos are required. Use BharatTools Image Compressor to resize your photo for the portal upload; get the same photo printed at a photo studio for the physical copies.",
  },
  {
    question: "What documents do I need at the PSK for a fresh passport?",
    answer:
      "For a fresh passport: (1) Aadhaar card as proof of identity and address — recommended as it covers both in one document; (2) Date of birth proof — birth certificate issued by municipal authority, or Class 10 marksheet with DOB printed on it; (3) Two recent passport-size photographs. Also carry self-attested photocopies of each original. If your name/address on Aadhaar differs from the application, carry additional proof.",
  },
  {
    question: "What is the difference between Normal and Tatkal passport?",
    answer:
      "Normal passport processing takes 30–45 working days including police verification. Tatkal processing takes 1–3 working days at the PSK step but still requires police verification for certain cases. Tatkal costs ₹2000 vs ₹1500 for Normal (36-page booklet). Not all application types qualify for Tatkal — check the eligibility criteria. For genuinely urgent travel needs, Tatkal is the route; otherwise Normal saves ₹500.",
  },
  {
    question: "What is a POPSK and how is it different from a PSK?",
    answer:
      "POPSK stands for Post Office Passport Seva Kendra — passport centres operated through post offices. They offer the same services as regular PSKs (Passport Seva Kendras) but typically have shorter appointment queues in smaller cities and towns. If your nearest PSK has a long wait, check if there is a POPSK in your district — both are listed on the appointment booking page.",
  },
  {
    question: "Can I renew my passport before it expires?",
    answer:
      "Yes. You can apply for renewal (re-issue) at any time, but many countries require your passport to be valid for at least six months beyond your travel date. It is advisable to renew 6–12 months before expiry. The renewal process is similar to fresh application — select 'Re-issue' on the Passport Seva portal and enter your current passport details.",
  },
  {
    question: "Are my files uploaded to BharatTools servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. Your passport photo never leaves your device — verify with DevTools Network tab while you process. Zero upload requests. Passport photos contain biometric information; keeping them local is the safest approach.",
  },
];

export default function PassportGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "Passport" },
          ]),
          howToSchema({
            name: "How to apply for an Indian passport online (Passport Seva)",
            description:
              "Six-step walkthrough of the Passport Seva portal — registration, form filling, PSK appointment, fee payment, PSK visit with documents, and passport dispatch tracking.",
            totalTimeIso: "PT60M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Apply for a Passport in India (Passport Seva Guide 2026)"
        subtitle="Complete walkthrough of passportindia.gov.in — Registration, fresh/renewal/tatkal form, PSK appointment, fee payment (₹1500–₹2000), and PSK visit with documents. Photo: 2×2 inch, white background, face 70–80% of frame."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "Passport" },
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
              <strong>Recent colour photograph</strong> — plain white background, face 70–80% of frame, 2×2 inch, JPG for digital upload. <em>Also carry two printed physical copies to the PSK.</em>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Aadhaar card</strong> (original + self-attested copy) — covers both identity and address proof in a single document.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Date of birth proof</strong> — birth certificate (municipal) or Class 10 marksheet/certificate with DOB printed on it.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Current passport</strong> (original + copy) — if applying for renewal. Note the passport number, issue date, and issuing authority before starting.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Active email ID and mobile number</strong> — for registration, OTP verification, and appointment reminders.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Debit card / credit card / net banking</strong> — ₹1500 Normal (36-page), ₹2000 Tatkal, ₹2000 fresh 60-page. Renewal fees differ.
            </span>
          </li>
        </ul>
      </section>

      {/* File spec table */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">Passport photo specification (India)</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The same specification applies to both the digital upload on the portal and the physical printed photos you carry to the PSK.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Attribute</th>
                <th className="px-4 py-2 font-semibold">Requirement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Size</td>
                <td className="px-4 py-2">2×2 inches (51×51 mm)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Format (digital)</td>
                <td className="px-4 py-2">JPG, 20–50 KB</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Background</td>
                <td className="px-4 py-2">Plain white — no patterns, no shadows, no grey tones</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Face coverage</td>
                <td className="px-4 py-2">70–80% of the frame — chin to crown</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Expression</td>
                <td className="px-4 py-2">Neutral, mouth closed, eyes open and looking at camera</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Glasses</td>
                <td className="px-4 py-2">Not permitted (MEA 2016 rule — even prescription glasses)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Head covering</td>
                <td className="px-4 py-2">Not permitted except for religious reasons</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Recency</td>
                <td className="px-4 py-2">Taken within the last 6 months</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Fee table */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">Passport fee schedule 2026</h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Application type</th>
                <th className="px-4 py-2 font-semibold">Booklet</th>
                <th className="px-4 py-2 font-semibold">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2">Fresh / Normal</td>
                <td className="px-4 py-2">36-page</td>
                <td className="px-4 py-2 font-medium">₹1,500</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Fresh / Normal</td>
                <td className="px-4 py-2">60-page</td>
                <td className="px-4 py-2 font-medium">₹2,000</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Fresh / Tatkal</td>
                <td className="px-4 py-2">36-page</td>
                <td className="px-4 py-2 font-medium">₹2,000</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Fresh / Tatkal</td>
                <td className="px-4 py-2">60-page</td>
                <td className="px-4 py-2 font-medium">₹2,000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-body-xs text-surface-fg-muted">Renewal fees vary by scenario. Check passportindia.gov.in fee calculator for your specific case.</p>
      </section>

      {/* Warning */}
      <section className="mt-10 rounded-md border border-surface-border-subtle border-l-4 border-l-warning-9 bg-warning-3/30 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Carry physical printed photos to the PSK — digital upload alone is not enough</h3>
            <p className="mt-1 text-body-sm">
              The Passport Seva portal requires a digital photo upload, but you must also carry two physical passport-size prints (2×2 inch, white background) to the PSK appointment. Applications without physical photos can be delayed or asked to return. Get the same photo printed at a photo studio using the digital file — confirm the studio prints to 51×51 mm.
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
                description: "Register on Passport Seva",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 1 — Register on Passport Seva</h3>
                    <p className="text-body-md">
                      Open <strong>passportindia.gov.in</strong> and click <em>Register Now</em>. Enter your name, date of birth, email ID, and set a login ID (username) and password. Click Submit and check your email — click the activation link to verify your email address.
                    </p>
                    <p className="text-body-md">
                      Log in to the Passport Seva portal using your login ID and password. The home page shows all services — fresh passport, renewal, police clearance certificate, and more.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 2",
                description: "Fill the application form",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 2 — Fill the application form</h3>
                    <p className="text-body-md">
                      Click <em>Apply for Fresh Passport / Re-issue of Passport</em>. Select the application type: Fresh (first-time applicant), Re-issue (renewal of expired or about-to-expire passport), Tatkal (urgent processing), or Lost/Damaged.
                    </p>
                    <p className="text-body-md">
                      Fill the form across multiple tabs — each tab must be saved before moving to the next:
                    </p>
                    <ol className="ml-5 list-decimal space-y-1 text-body-md">
                      <li><strong>Applicant Details</strong> — name, DOB, place of birth, gender, marital status.</li>
                      <li><strong>Family Details</strong> — father&apos;s, mother&apos;s, and spouse&apos;s name (if married).</li>
                      <li><strong>Present Residential Address</strong> — match exactly to your Aadhaar address.</li>
                      <li><strong>Emergency Contact</strong> — name, relationship, phone number.</li>
                      <li><strong>Previous Passport Details</strong> — if renewal, enter current passport number, issue date, and issuing authority.</li>
                      <li><strong>Other Details</strong> — employment type, educational qualification, any visible distinguishing marks.</li>
                    </ol>

                    <div className="space-y-3 mt-4">
                      <ToolCallout
                        href="/image-compress/50kb"
                        title="Photo: resize for portal upload"
                        reason="Portal accepts JPG under 50 KB. Use Image Compressor with a 50 KB target to bring your passport photo to spec for the digital upload."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                      <ToolCallout
                        href="/jpg-to-pdf"
                        title="Convert document scans to PDF if required"
                        reason="Some document uploads (e.g. supporting annexures for Tatkal) may require PDFs. Convert JPG scans to a single PDF here."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>
                  </>
                ),
              },
              {
                label: "Step 3",
                description: "Schedule PSK appointment",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 3 — Schedule appointment at PSK or POPSK</h3>
                    <p className="text-body-md">
                      After saving the form, click <em>Schedule Appointment</em>. Select your nearest <strong>Passport Seva Kendra (PSK)</strong> or <strong>Post Office Passport Seva Kendra (POPSK)</strong>. PSKs are in major cities; POPSKs are at post offices in smaller towns and often have shorter queues.
                    </p>
                    <p className="text-body-md">
                      Choose an available date and time slot. Metro PSK slots fill 2–4 weeks ahead — if you need an early date, check POPSK availability in nearby districts. After selecting the slot, save the appointment details and proceed to fee payment.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 4",
                description: "Pay fee",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 4 — Pay the application fee</h3>
                    <p className="text-body-md">
                      Pay the fee online — ₹1500 for Normal fresh 36-page, ₹2000 for Tatkal or 60-page booklet. Payment via debit/credit card, net banking, or SBI Challan (offline bank payment — adds 2–3 working days).
                    </p>
                    <p className="text-body-md">
                      After payment, download and print the <strong>Application Receipt</strong>. This receipt contains your Application Reference Number (ARN) and the appointment details — it is your entry document at the PSK. Carry the printed copy; a photo on your phone is not accepted at most PSKs.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 5",
                description: "PSK visit",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 5 — Visit the PSK with documents</h3>
                    <p className="text-body-md">
                      Arrive at the PSK 10–15 minutes before your appointment. Carry:
                    </p>
                    <ul className="ml-5 list-disc space-y-1 text-body-md">
                      <li>Printed Application Receipt</li>
                      <li>Aadhaar card — original and self-attested photocopy</li>
                      <li>Date of birth proof — original and self-attested copy</li>
                      <li>Two physical passport-size photographs (2×2 inch, white background)</li>
                      <li>Current passport (original + copy) if renewal</li>
                    </ul>
                    <p className="text-body-md mt-3">
                      The PSK process has three counters in sequence:
                    </p>
                    <ol className="ml-5 list-decimal space-y-1 text-body-md">
                      <li><strong>Counter A</strong> — Document verification. An officer checks all originals against copies and validates the form details.</li>
                      <li><strong>Counter B</strong> — Biometric capture — fingerprints and photograph taken.</li>
                      <li><strong>Counter C</strong> — Granting officer (for Normal passports, usually a formality; for Tatkal, a brief interview may occur).</li>
                    </ol>
                  </>
                ),
              },
              {
                label: "Step 6",
                description: "Track and collect",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 6 — Track dispatch and collect</h3>
                    <p className="text-body-md">
                      After your PSK visit the application moves to police verification for Normal passports (2–4 weeks), or proceeds directly to printing for Tatkal if no verification is required. Track your application at <strong>passportindia.gov.in</strong> using your ARN, or via the Passport Seva mobile app. You also receive SMS updates at each stage.
                    </p>
                    <p className="text-body-md">
                      The passport is dispatched by Speed Post to your registered address. You receive a tracking number via SMS — use India Post&apos;s tracking at indiapost.gov.in to follow the consignment. Someone must be available at your address to receive the registered Speed Post delivery.
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
            description: "Compress passport photo for portal upload under 50 KB.",
          },
          {
            href: "/jpg-to-pdf",
            title: "JPG / Image to PDF",
            description: "Convert document scans to PDF for annexure uploads.",
          },
          {
            href: "/pdf-compress",
            title: "PDF Compressor",
            description: "Reduce PDF size if supporting document scans exceed portal limits.",
          },
        ]}
      />

      <section className="mt-12 rounded-md border-l-4 border-l-success-9 border border-surface-border-subtle bg-success-3/30 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">Why use BharatTools for passport photo preparation?</h3>
            <p className="mt-1 text-body-sm">
              Your passport photo is biometric data — it must not be processed by third-party servers. Every BharatTools tool runs locally in your browser — your photo never leaves your device. Open DevTools Network tab while you compress: zero upload requests. You can also transfer your processed photo to your phone for printing without WhatsApp using{" "}
              <Link href="/quick-send" className="font-medium underline">Quick Send</Link>, a peer-to-peer transfer that stores nothing.
            </p>
          </div>
        </div>
      </section>

      <FaqAccordion faqs={FAQS} />

      <section className="mt-12 rounded-md border border-surface-border-subtle p-6 text-center">
        <h2 className="text-heading-md font-semibold">Ready to prepare your passport photo?</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          Compress your passport photo for the Passport Seva portal digital upload — stays under 50 KB, runs in your browser.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/image-compress/50kb">Open Image Compressor →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Specifications and fees based on the Ministry of External Affairs Passport Seva guidelines as of {LAST_UPDATED_LABEL}. Always cross-check the current fee schedule and document requirements at passportindia.gov.in before your PSK appointment — requirements may be revised.
      </p>
    </main>
  );
}

void LAST_UPDATED;
