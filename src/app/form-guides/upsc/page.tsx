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

const LAST_UPDATED = "2026-06-06";
const LAST_UPDATED_LABEL = "Updated June 2026";

const PAGE_TITLE =
  "UPSC Application Form Filling Guide 2026 — URN, Photo, Signature & ID Specs";
const PAGE_DESCRIPTION =
  "Step-by-step walk-through of the UPSC online portal (upsconline.nic.in): account creation, Universal Registration Number (URN), the Common Application Form with live photo capture, exam centre and fee. Photo 20–200 KB, triple-signature 20–100 KB, ID PDF 50–300 KB. Free in-browser tools — nothing leaves your device.";

const PAGE_KEYWORDS = [
  "UPSC form filling",
  "UPSC application form 2026",
  "how to fill UPSC CSE form",
  "upsconline.nic.in registration",
  "UPSC URN",
  "Universal Registration Number UPSC",
  "UPSC photo size",
  "UPSC photo 200 KB",
  "UPSC signature size",
  "UPSC triple signature",
  "UPSC signature 100 KB",
  "UPSC ID proof PDF",
  "UPSC live photo capture",
  "UPSC face authentication",
  "UPSC CSE photo specification",
  "UPSC 4 card system",
  "Common Application Form UPSC",
  "यूपीएससी फॉर्म कैसे भरें",
  "यूपीएससी फोटो साइज़",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/upsc",
    languages: {
      "en-IN": "/form-guides/upsc",
      "hi-IN": "/form-guides/upsc",
      "x-default": "/form-guides/upsc",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/upsc",
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

// HowTo schema steps — map to the 4-card portal flow on upsconline.nic.in.
const STEPS: { title: string; text: string }[] = [
  {
    title: "Card 1 — Create your account",
    text: "Open upsconline.nic.in, click Create Account, enter your email and verify with the OTP, enter your mobile number and verify with a separate OTP, then set a password. The account is your login for every UPSC exam — keep credentials safe.",
  },
  {
    title: "Card 2 — Generate your Universal Registration Number (URN)",
    text: "Log in and open the Universal Registration module. Enter your full name, gender, date of birth and parents' names exactly as on your Class 10 certificate; enter your Class 10 board roll number; pick two security questions. Preview, then submit — submission locks the URN and you only get one lifetime edit afterwards.",
  },
  {
    title: "Card 3 — Fill the Common Application Form (CAF) and upload documents",
    text: "Enter personal profile, parents' profile, social category (with category certificate if applicable), educational profile, previous attempts, and previous employment. Upload photo.jpg (20–200 KB), signature.jpg (20–100 KB, triple vertical signatures, 350×350 to 500×500 px) and a scanned photo ID as PDF (50–300 KB). Complete the live photo checkpoint via webcam or mobile QR — the portal's AI compares it to your uploaded photo.",
  },
  {
    title: "Card 4 — Exam-specific module: choose centres, pay, submit",
    text: "Select your target exam (e.g. Civil Services Examination), pick preferred Prelims and Mains centres (first-apply-first-allot — popular cities fill fast), pay the ₹100 application fee if applicable (female, SC, ST and PwBD candidates are exempt) via UPI/Net Banking/Card/SBI Challan, preview the application and click I Agree. Download the system-generated confirmation PDF.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the UPSC photo size limit?",
    answer:
      "The UPSC photo must be a JPG/JPEG between 20 KB and 200 KB. The file must be named exactly photo.jpg — the URN portal checks the filename. Your face has to cover at least 75% of the frame on a plain white background, both ear lobes visible, eyes open, neutral expression. Use the UPSC Photo Resizer on BharatTools — it crops to spec, sets white background, lands inside the 20–200 KB band, and names the output photo.jpg automatically.",
  },
  {
    question: "What is the UPSC triple signature requirement?",
    answer:
      "UPSC's URN system requires three vertical signatures on a single image. Take a plain white sheet (no lines), use a black ink pen, sign three times one below the other with distinct gaps, then scan all three together. The resulting JPG must be between 20 KB and 100 KB, dimensions between 350×350 and 500×500 pixels, and named signature.jpg. If your scan is too large, use BharatTools Image Compressor with a custom 100 KB target.",
  },
  {
    question: "What is the URN and why is it irreversible?",
    answer:
      "URN stands for Universal Registration Number. It is the permanent ID UPSC issues you when you first complete Card 2. Once generated, you are only allowed one lifetime opportunity to edit your URN profile fields (name spellings, DOB, parents' names, Class 10 roll number, security questions). Triple-check every field on the preview screen before clicking submit — typos here haunt every UPSC exam you ever sit for.",
  },
  {
    question: "What is the UPSC live photo capture step?",
    answer:
      "During Card 3 the portal asks you to take a live photograph — either via your laptop's webcam or by scanning an on-screen QR code on your phone. The portal's AI then cross-references this live photo against the photo.jpg you uploaded. If the system flags a visual mismatch (different person, heavy filter, wildly different lighting) it halts your application. Sit in a well-lit space against a plain wall, look directly at the camera, and keep the lens at face level.",
  },
  {
    question: "What ID proof PDF do I need for UPSC?",
    answer:
      "A single PDF between 50 KB and 300 KB containing Aadhaar, Voter ID, PAN, Passport, or Driving Licence. Aadhaar is the recommended option for smoother downstream processing (DigiLocker fetch, e-KYC). If your scan is a JPG, use BharatTools JPG to PDF first; if the PDF exceeds 300 KB, follow it with PDF Compressor — both run locally in your browser.",
  },
  {
    question: "Who is exempt from the UPSC application fee?",
    answer:
      "Female candidates and candidates from SC, ST and PwBD categories are entirely exempt from the ₹100 application fee. Male candidates from General, OBC and EWS categories pay ₹100 via UPI, Net Banking, Credit/Debit Card, or by generating an offline SBI Cash Challan. The Card 4 module computes your fee automatically based on category data entered in the CAF (Card 3).",
  },
  {
    question: "Are my UPSC documents uploaded to BharatTools servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. Your photo, triple-signature scan, and ID proof PDF never leave your device — you can verify by opening DevTools Network tab while you process. We don't see your file. We don't store it. We don't need to. This matters especially for UPSC where the ID PDF contains Aadhaar/PAN.",
  },
  {
    question: "Why does the UPSC portal reject my photo?",
    answer:
      "Common reasons: (1) filename is not exactly photo.jpg — the URN portal is filename-strict; (2) outside the 20–200 KB band; (3) background not pure white, or visible shadows; (4) face less than 75% of the frame, or ear lobes hidden; (5) the live-photo step flagged a mismatch with your uploaded photo. The UPSC Photo Resizer fixes 1–3 in one pass; 4–5 need a fresh shot in better lighting.",
  },
];

export default function UpscGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "UPSC" },
          ]),
          howToSchema({
            name: "How to fill the UPSC application form (URN + CAF)",
            description:
              "Four-card walkthrough of upsconline.nic.in — account creation, Universal Registration Number (URN), Common Application Form with photo/signature/ID uploads and live photo capture, then exam-specific centre selection and fee payment.",
            totalTimeIso: "PT45M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Fill the UPSC Application Form (URN System)"
        subtitle="Step-by-step guide to the 4-card portal at upsconline.nic.in — Account, URN, Common Application Form, Exam Module. Photo 20–200 KB, triple-signature 20–100 KB, ID PDF 50–300 KB. Use the in-browser tools we link inline; nothing leaves your device."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "UPSC" },
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
              <strong>Class 10 certificate</strong> — for name spellings, DOB, board roll number (must match exactly; URN is one-shot editable).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Recent passport-style photo</strong> — colour, plain white background, JPG between <strong>20 KB and 200 KB</strong>, named <code className="rounded bg-surface-1 px-1.5 py-0.5 text-body-xs">photo.jpg</code>, face covers 75% of frame, both ear lobes visible.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Triple-signature scan</strong> — three vertical signatures in black ink on plain white paper, JPG between <strong>20 KB and 100 KB</strong>, 350×350 to 500×500 px, named <code className="rounded bg-surface-1 px-1.5 py-0.5 text-body-xs">signature.jpg</code>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Photo ID proof as PDF</strong> — Aadhaar (recommended), Voter ID, PAN, Passport, or Driving Licence, PDF between <strong>50 KB and 300 KB</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Category / Income certificate</strong> — if applying under reservation (OBC, SC, ST, EWS), keep the certificate number, issuing authority and issue date handy.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Working mobile number and email</strong> — both verified by OTP during Card 1.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>UPI / debit card / net banking</strong> — for the ₹100 application fee (male General/OBC/EWS only; female, SC, ST, PwBD are exempt).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Webcam or phone</strong> — for the mandatory live photo capture during Card 3. A well-lit spot against a plain wall.
            </span>
          </li>
        </ul>
      </section>

      {/* The official spec — high keyword density, table format */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">UPSC 2026 file specifications</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The URN portal filters out anything that misses these — wrong format, wrong size, wrong filename. Match the spec exactly.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Field</th>
                <th className="px-4 py-2 font-semibold">Photo</th>
                <th className="px-4 py-2 font-semibold">Signature</th>
                <th className="px-4 py-2 font-semibold">ID proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">Format</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">JPG / JPEG</td>
                <td className="px-4 py-2">PDF</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">File size</td>
                <td className="px-4 py-2">20 KB – 200 KB</td>
                <td className="px-4 py-2">20 KB – 100 KB</td>
                <td className="px-4 py-2">50 KB – 300 KB</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Dimensions</td>
                <td className="px-4 py-2">Square, face 75% of frame</td>
                <td className="px-4 py-2">350×350 to 500×500 px</td>
                <td className="px-4 py-2">—</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Filename</td>
                <td className="px-4 py-2"><code className="rounded bg-surface-1 px-1.5 py-0.5 text-body-xs">photo.jpg</code></td>
                <td className="px-4 py-2"><code className="rounded bg-surface-1 px-1.5 py-0.5 text-body-xs">signature.jpg</code></td>
                <td className="px-4 py-2">Any</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Background / paper</td>
                <td className="px-4 py-2">Plain white, no shadow</td>
                <td className="px-4 py-2">White paper, no lines</td>
                <td className="px-4 py-2">—</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Other</td>
                <td className="px-4 py-2">Both ear lobes visible; wear glasses/beard if you wear them daily</td>
                <td className="px-4 py-2">Three signatures, vertical, black ink, distinct gaps</td>
                <td className="px-4 py-2">Aadhaar recommended</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* URN warning — surfaces the most expensive mistake */}
      <section className="mt-10 rounded-md border-l-4 border-l-warning-9 border border-surface-border-subtle bg-warning-3/30 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">The URN is permanent. Edit window is one-shot.</h3>
            <p className="mt-1 text-body-sm">
              Card 2 generates your Universal Registration Number. Until you click submit on that card you can edit freely. After submission, UPSC allows <strong>one</strong> lifetime modification to your URN profile — and that&apos;s it. Your name spelling, parents&apos; names, DOB, Class 10 roll number and security questions carry through every UPSC exam you ever sit for. Cross-check every character on the preview screen before submitting Card 2.
            </p>
          </div>
        </div>
      </section>

      {/* The four steps mirror the 4-card portal — one shown at a time via the stepper */}
      <section className="mt-12">
        <h2 className="text-heading-md font-semibold">The 4-card portal walkthrough</h2>

        <div className="mt-6">
          <FormGuideSteps
            steps={[
              {
                label: "Card 1",
                description: "Account creation",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Card 1 — Account creation</h3>
                    <p className="text-body-md">
                      Go to <strong>upsconline.nic.in</strong>. You will see four distinct cards on the homepage — complete them in sequence. Click <em>Create Account</em>. Enter your active email ID, click <em>Send OTP</em>, retrieve the code from your inbox and confirm. Repeat for your mobile number using the separate SMS OTP. Set a password and answer the security prompt.
                    </p>
                    <p className="text-body-md">
                      Use credentials you will still have access to in five years — UPSC keeps your candidate record indefinitely against your URN, and password recovery routes back through this email and mobile.
                    </p>
                  </>
                ),
              },
              {
                label: "Card 2",
                description: "Universal Registration Number (URN)",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Card 2 — Universal Registration Number (URN)</h3>
                    <p className="text-body-md">
                      Log in to the URN module. Enter your full name, gender, date of birth and your father&apos;s and mother&apos;s names <strong>exactly as they appear on your Class 10 certificate</strong>. Enter your Class 10 board roll number. Pick two distinct security questions (these are your password-reset lifeline — choose questions whose answers won&apos;t change over the years).
                    </p>
                    <p className="text-body-md">
                      On the preview screen you can edit any field freely — that freedom ends at submit. Once you click submit, the system generates a permanent <strong>URN</strong> and emails it to you. From here, the URN is your identity across every UPSC exam — CSE, IFS, CDS, NDA, CAPF — and you only get <strong>one</strong> lifetime edit opportunity afterwards. Treat the preview screen like a final.
                    </p>
                  </>
                ),
              },
              {
                label: "Card 3",
                description: "Common Application Form (CAF)",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Card 3 — Common Application Form (CAF)</h3>
                    <p className="text-body-md">
                      The CAF is your master application record. Fill it once, link it to every UPSC exam you write later. You can save and return — it doesn&apos;t need to be finished in one sitting.
                    </p>
                    <ol className="ml-5 list-decimal space-y-2 text-body-md">
                      <li><strong>Personal profile</strong> — Nationality, religion, mother tongue, state of domicile, marital status, place of birth (country/state/district).</li>
                      <li><strong>Parents&apos; profile</strong> — Professions, educational background, contact details.</li>
                      <li><strong>Social category</strong> — General, OBC, SC, ST, or EWS. If reserved, upload the caste/income certificate (PDF) and enter its number, issuing authority, and issue date.</li>
                      <li><strong>Educational profile</strong> — Graduation/academic stream, university, year of passing, marks/CGPA. Final-year candidates select <em>Appeared/Appearing</em>.</li>
                      <li><strong>Work experience &amp; prior attempts</strong> — Previous employment (if any) and explicit list of past UPSC CSE attempts with year and roll number.</li>
                      <li><strong>Document upload</strong> — photo.jpg, signature.jpg, and the photo-ID PDF.</li>
                      <li><strong>Live photo checkpoint</strong> — capture a fresh photo via webcam or by scanning the on-screen QR code with your phone. The portal&apos;s face authentication compares it to your uploaded photo.jpg.</li>
                    </ol>

                    <p className="text-body-md mt-4">
                      This is where most upload rejections happen. The portal enforces strict format, size and filename rules, and its error messages are terse. Prepare each file using the right tool below — every tool runs in your browser, so your documents never leave your device.
                    </p>

                    <div className="space-y-3">
                      <ToolCallout
                        href="/photo-resize/upsc"
                        title="Photo: resize to UPSC spec (face 75%, 20–200 KB, white background)"
                        reason="Crops to a square so your face fills 75% of the frame, replaces the background with pure white, and lands inside the 20–200 KB band — output named photo.jpg."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-compress/100kb"
                        title="Triple signature: compress to 100 KB"
                        reason="Scan the three vertical signatures together, drop the file here — binary-search JPEG that lands at or under 100 KB, comfortably inside UPSC's 20–100 KB band."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/jpg-to-pdf"
                        title="ID proof: combine scans into a single PDF"
                        reason="Drop your Aadhaar / PAN / Voter ID scans, reorder if needed, download one PDF. Use this before compressing if you have multiple JPGs."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/pdf-compress"
                        title="ID PDF too large? Compress it under 300 KB"
                        reason="Re-encodes embedded scan images and strips metadata to fit UPSC's 50–300 KB band. Recommended setting clears most Aadhaar/PAN scans in one pass."
                        icon={<FileText className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>

                    <p className="text-body-md">
                      <strong>About the live photo:</strong> the portal&apos;s AI flags visual mismatches against your uploaded photo.jpg — different person, very different lighting, heavy filters, glasses present in one but not the other. Sit in a well-lit space against a plain wall, eye-level camera, no filter. If you flagged glasses or a beard in your passport photo, wear them here too — the venue face-authentication check uses the same image.
                    </p>
                  </>
                ),
              },
              {
                label: "Card 4",
                description: "Exam module, centres & fee",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Card 4 — Exam-specific module (e.g. UPSC CSE)</h3>
                    <p className="text-body-md">
                      Card 4 binds your CAF to a live exam cycle. Select your target exam — Civil Services Examination, IFS, CDS, NDA, CAPF as published in the current notification.
                    </p>
                    <p className="text-body-md">
                      <strong>Centre allocation</strong> — pick your preferred Prelims and Mains centres. UPSC distributes centres on a <em>first-apply-first-allot</em> basis. Popular Tier-1 centres (Delhi, Bangalore, Hyderabad, Mumbai) freeze quickly once capacity hits. If you can submit within the first week of the form opening, you almost always get your first preference; closer to the deadline, expect to land your third or fourth choice.
                    </p>
                    <p className="text-body-md">
                      <strong>Fee payment</strong> — male candidates from General, OBC and EWS pay ₹100 via UPI, Net Banking, Credit/Debit Card, or by generating an offline SBI Cash Challan. Female, SC, ST and PwBD candidates are entirely exempt. UPI is the fastest path and avoids 3-D-secure timeouts that occasionally trip Indian banks.
                    </p>
                    <p className="text-body-md">
                      <strong>Final declaration</strong> — click <em>Preview Application</em>. The preview shows your uploaded photo, signature and ID inside their boxes — confirm they render clearly (a black square or a stretched image means the upload was malformed and needs to be redone). Scroll to the bottom, tick the declaration acknowledgement, and click <em>I Agree</em>. The application locks; you cannot edit after this click.
                    </p>
                    <p className="text-body-md">
                      UPSC instantly emails and SMSes you a final transaction and registration confirmation. <strong>Download the system-generated PDF copy</strong> — you may need it for centre slip download later in the cycle.
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
            href: "/photo-resize/upsc",
            title: "UPSC Photo Resizer",
            description: "Square crop, 20–200 KB JPG, pure white background. Outputs photo.jpg ready for the URN portal.",
          },
          {
            href: "/image-compress/100kb",
            title: "Image Compressor — 100 KB",
            description: "Drop the triple-signature scan; binary-search JPEG lands at or under 100 KB.",
          },
          {
            href: "/jpg-to-pdf",
            title: "JPG / Image to PDF",
            description: "Combine Aadhaar / PAN scans into one PDF. Reorder, rotate, A4 or Letter.",
          },
          {
            href: "/pdf-compress",
            title: "PDF Compressor",
            description: "Shrink ID-proof PDFs under UPSC's 300 KB cap. Browser-only.",
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
              Every tool linked above runs locally in your browser — your photo, signature, and Aadhaar/PAN PDF never touch a server. Open DevTools Network tab while you compress: zero requests. For UPSC this matters more than usual — the ID proof PDF contains Aadhaar or PAN, and you do not want a copy of that sitting on a third-party host. You can also send files between your phone and a print shop without WhatsApp using <Link href="/quick-send" className="font-medium underline">Quick Send</Link>, a peer-to-peer transfer that doesn&apos;t store anything either.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqAccordion faqs={FAQS} />

      {/* Final nudge */}
      <section className="mt-12 rounded-md border border-surface-border-subtle p-6 text-center">
        <h2 className="text-heading-md font-semibold">Ready to prepare your UPSC photo?</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          The UPSC Photo Resizer handles the square crop, KB target, and white background in one pass — output named photo.jpg, ready for the URN portal.
        </p>
        <div className="mt-4">
          <Button asChild variant="solid" size="lg">
            <Link href="/photo-resize/upsc">Open UPSC Photo Resizer →</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Specifications based on the UPSC URN portal notification (upsconline.nic.in) as of {LAST_UPDATED_LABEL}. Always cross-check the current exam notification at upsconline.nic.in before submitting — UPSC occasionally revises file-size bands and filename rules between cycles.
      </p>
    </main>
  );
}

void LAST_UPDATED;
