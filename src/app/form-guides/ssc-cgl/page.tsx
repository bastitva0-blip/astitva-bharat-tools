import type { Metadata } from "next";
import Link from "next/link";
import { Camera, CheckCircle2, Image as ImageIcon, ShieldCheck } from "lucide-react";
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

const PAGE_TITLE = "SSC CGL Application Form Guide — OTR, Live Photo & Signature Specs";
const PAGE_DESCRIPTION =
  "Step-by-step guide to applying for SSC CGL on ssc.gov.in: One Time Registration, Aadhaar authentication, the live photo capture that replaced photo upload, the 10–20 KB signature, and the ₹100 fee. Free in-browser tools — nothing uploaded.";

const PAGE_KEYWORDS = [
  "SSC CGL form filling",
  "SSC CGL apply online",
  "how to fill SSC CGL form",
  "SSC OTR registration",
  "SSC one time registration",
  "SSC CGL signature size",
  "SSC signature 20 KB",
  "SSC CGL photo size",
  "SSC live photo capture",
  "ssc.gov.in registration",
  "SSC CGL application fee",
  "SSC Aadhaar authentication",
  "SSC CGL document upload",
  "एसएससी सीजीएल फॉर्म कैसे भरें",
  "एसएससी सिग्नेचर साइज़",
  "एसएससी ओटीआर",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides/ssc-cgl",
    languages: {
      "en-IN": "/form-guides/ssc-cgl",
      "hi-IN": "/form-guides/ssc-cgl",
      "x-default": "/form-guides/ssc-cgl",
    },
  },
  openGraph: {
    type: "article",
    url: "/form-guides/ssc-cgl",
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

// Steps surfaced as HowTo schema + page body. Written to the process rather
// than to one cycle's dates — SSC runs CGL annually and the sequence has been
// stable since the move to ssc.gov.in. Re-check when a new notice lands.
const STEPS: { title: string; text: string }[] = [
  {
    title: "Complete One Time Registration on ssc.gov.in",
    text: "OTR is mandatory and separate from the exam application. Register on the current SSC portal, ssc.gov.in, with your name, parents' names, date of birth, Class 10 roll number, mobile and email. Credentials from SSC's old website do not work — if you registered years ago, you still need a fresh OTR here.",
  },
  {
    title: "Complete Aadhaar authentication",
    text: "SSC registration is Aadhaar-enabled. Authenticating with Aadhaar carries a real benefit: your application cannot be rejected on the ground that the photograph or signature does not meet the prescribed standard, and you are not required to carry a photograph or original photo ID to the exam centre. Candidates who do not use Aadhaar upload another valid photo ID instead.",
  },
  {
    title: "Capture your live photograph",
    text: "SSC captures the photograph live through your webcam or phone camera inside the application module. A stored or pre-captured photo cannot be uploaded and using one is grounds for rejection. Sit facing the camera at eye level, in good light, against a plain background, with no cap, mask or spectacles, and keep your face inside the guide box on screen.",
  },
  {
    title: "Upload your signature",
    text: "The signature is still a file upload: JPEG/JPG between 10 KB and 20 KB. Sign on plain white paper with a black ink pen, scan or photograph it, and crop tightly around the signature. A blurred or miniature signature is summarily rejected. Visually handicapped candidates may upload a thumb impression in place of a signature.",
  },
  {
    title: "Fill the CGL application and pay the fee",
    text: "Log in with your OTR credentials, choose the CGL examination, and fill post preferences, educational qualification and exam centre choices. The fee is ₹100 for General and OBC candidates; women, SC, ST, PwBD and eligible ex-servicemen are exempt. Pay by BHIM UPI, net banking or debit/credit card, then download and print the confirmation.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Do I still upload a photo for SSC CGL?",
    answer:
      "No. SSC's application module on ssc.gov.in captures your photograph live through your webcam or phone camera. Uploading an old or pre-existing photograph is not allowed and leads to rejection. This is the single biggest change from how SSC forms used to work, and it is why the photo-resizing advice you will find on older sites no longer applies to SSC.",
  },
  {
    question: "What is the SSC CGL signature size limit?",
    answer:
      "The signature is uploaded as a JPEG/JPG between 10 KB and 20 KB. That is a narrow band — much tighter than most exams — so compressing to a target rather than guessing at quality settings matters. Use the BharatTools Image Compressor with a 20 KB target, then check the result is not under 10 KB.",
  },
  {
    question: "What are the signature dimensions for SSC?",
    answer:
      "SSC's own instructions have long specified an image of about 6.0 cm (width) × 2.0 cm (height); many coaching sites quote 4.0 cm × 2.0 cm instead. What the portal actually enforces is the 10–20 KB JPEG limit and legibility. Crop tightly around the signature at roughly a 3:1 landscape shape, keep it sharp, and you satisfy every version of the rule.",
  },
  {
    question: "Why should I choose Aadhaar authentication?",
    answer:
      "Because it removes a whole category of rejection. SSC has stated that applications of candidates who opt for Aadhaar authentication will not be rejected on the ground that the photograph or signature does not meet prescribed standards, and that such candidates need not carry a recent colour photograph or original photo ID to the exam venue. If you have Aadhaar and it matches your Class 10 records, use it.",
  },
  {
    question: "My old SSC login doesn't work. What happened?",
    answer:
      "SSC moved to a new website, ssc.gov.in, and has clarified that OTR credentials from the previous website do not carry over. You need to complete a fresh One Time Registration on the new portal. Do it before a notification opens rather than on the last day, when the portal is at its busiest.",
  },
  {
    question: "How do I take a good live photo?",
    answer:
      "Sit facing a window or a lamp so the light falls on your face rather than behind you — backlighting turns your face into a silhouette. Put the camera at eye level, not below. Use a plain wall as the background. Remove your cap, mask and spectacles. Fill the guide box on screen: not so close that your ears are cut off, not so far that your face is a small patch.",
  },
  {
    question: "What is the SSC CGL application fee?",
    answer:
      "₹100 for General and OBC candidates. Women candidates, and candidates belonging to SC, ST, PwBD and eligible ex-servicemen categories, are exempt from the fee. Payment is online through BHIM UPI, net banking or a debit/credit card. Check the current notice for this cycle's figure before you pay.",
  },
  {
    question: "Are my documents uploaded to BharatTools' servers?",
    answer:
      "No. Every BharatTools tool runs entirely in your browser. Your signature scan and certificate PDFs never leave your device — open DevTools and watch the Network tab while you compress and you will see no request carrying your file. We don't see it, don't store it, and don't need to.",
  },
];

export default function SscCglGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Form guides", href: "/form-guides" },
            { label: "SSC CGL" },
          ]),
          howToSchema({
            name: "How to apply for SSC CGL",
            description:
              "Five-step guide to SSC CGL on ssc.gov.in: One Time Registration, Aadhaar authentication, live photograph capture, signature upload at 10–20 KB, and fee payment.",
            totalTimeIso: "PT45M",
            steps: STEPS.map((s) => ({ name: s.title, text: s.text })),
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <PageHeader
        title="How to Fill the SSC CGL Application Form"
        subtitle="OTR on ssc.gov.in, Aadhaar authentication, the live photo capture that replaced photo upload, the 10–20 KB signature, and the ₹100 fee — in order, with the traps marked."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Form guides", href: "/form-guides" },
          { label: "SSC CGL" },
        ]}
      />

      <p className="mt-2 text-body-xs text-surface-fg-muted">{LAST_UPDATED_LABEL}</p>

      {/* The single most important change, above everything else */}
      <section className="mt-8 rounded-md border-l-4 border-l-warning-9 border border-surface-border-subtle bg-warning-3/30 p-5">
        <div className="flex items-start gap-3">
          <Camera className="mt-0.5 size-5 shrink-0 text-warning-11" aria-hidden />
          <div>
            <h2 className="text-body-md font-semibold">
              Read this first: SSC no longer accepts an uploaded photograph
            </h2>
            <p className="mt-1 text-body-sm">
              The application module on ssc.gov.in captures your photo{" "}
              <strong>live, through your webcam or phone camera</strong>. You cannot upload a
              studio photo, and using a pre-captured image is grounds for rejection. Most SSC
              &ldquo;photo resizer&rdquo; guides online are written against the old rules. The
              signature is still an upload — that part below still matters.
            </p>
          </div>
        </div>
      </section>

      {/* What you'll need — snippet-friendly checklist */}
      <section className="mt-8 rounded-md border border-surface-border-subtle bg-surface-2 p-5">
        <h2 className="text-heading-sm font-semibold">What you&apos;ll need before you start</h2>
        <ul className="mt-3 space-y-2 text-body-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Class 10 marksheet</strong> — for date of birth, roll number, and the exact
              spelling of your name and your parents&apos; names.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Aadhaar</strong> — with the same name and date of birth as your Class 10
              records. Fix any mismatch before you register, not during.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>A device with a working camera</strong> — the photograph is captured live.
              A phone camera is usually better than a laptop webcam.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Signature on plain white paper</strong> — black ink pen, scanned or
              photographed, saved as JPG between 10 KB and 20 KB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Graduation details</strong> — CGL requires a bachelor&apos;s degree; keep the
              university, year and roll number to hand.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>Category / PwBD / ex-serviceman certificates</strong> — as PDFs, if you are
              claiming a relaxation or a fee exemption.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
            <span>
              <strong>UPI / debit card / net banking</strong> — ₹100 for General and OBC; women,
              SC, ST, PwBD and eligible ex-servicemen pay nothing.
            </span>
          </li>
        </ul>
      </section>

      {/* The official spec — table format */}
      <section className="mt-10">
        <h2 className="text-heading-md font-semibold">SSC CGL photograph and signature rules</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          One is captured, one is uploaded. Treat them as two different problems.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-surface-border-subtle">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-2">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">Field</th>
                <th className="px-4 py-2 font-semibold">Photograph</th>
                <th className="px-4 py-2 font-semibold">Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              <tr>
                <td className="px-4 py-2 font-medium">How it&apos;s provided</td>
                <td className="px-4 py-2">Captured live in the portal</td>
                <td className="px-4 py-2">Uploaded as a file</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Format</td>
                <td className="px-4 py-2">JPEG, produced by the portal</td>
                <td className="px-4 py-2">JPEG / JPG</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">File size</td>
                <td className="px-4 py-2">Not applicable</td>
                <td className="px-4 py-2">10 KB – 20 KB</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Dimensions</td>
                <td className="px-4 py-2">Set by the capture box on screen</td>
                <td className="px-4 py-2">About 6.0 cm × 2.0 cm</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Background / paper</td>
                <td className="px-4 py-2">Plain, well lit</td>
                <td className="px-4 py-2">Plain white paper</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Not allowed</td>
                <td className="px-4 py-2">Cap, mask, spectacles; any stored photo</td>
                <td className="px-4 py-2">Blurred or miniature signatures</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-body-sm text-surface-fg-muted">
          Visually handicapped candidates are permitted to upload a thumb impression in place of a
          signature.
        </p>
      </section>

      {/* The five steps */}
      <section className="mt-12">
        <h2 className="text-heading-md font-semibold">Five steps to submit the form</h2>

        <div className="mt-6">
          <FormGuideSteps
            steps={[
              {
                label: "Step 1",
                description: "One Time Registration",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">
                      Step 1 — Complete One Time Registration on ssc.gov.in
                    </h3>
                    <p className="text-body-md">
                      OTR is a separate, one-off step before any SSC exam application. You create a
                      single profile on <strong>ssc.gov.in</strong> and reuse it for every SSC exam
                      afterwards. Enter your name, your father&apos;s and mother&apos;s names, date
                      of birth, Class 10 roll number, mobile number and email —{" "}
                      <strong>exactly as on your Class 10 marksheet</strong>. Verify the mobile and
                      email by OTP, then log in and complete the remaining profile fields:
                      nationality, category, a visible identification mark, and your permanent and
                      present addresses.
                    </p>
                    <p className="text-body-md">
                      If you registered with SSC years ago and your login fails, that is expected.
                      SSC has confirmed that credentials from the old website do not work on the new
                      portal. Complete a fresh OTR. Do it <em>before</em> a notification opens — on
                      the last day, the portal is slowest and there is no room to fix a mismatch.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 2",
                description: "Aadhaar authentication",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">
                      Step 2 — Complete Aadhaar authentication
                    </h3>
                    <p className="text-body-md">
                      SSC registration is Aadhaar-enabled. Opting for Aadhaar authentication is
                      worth doing for a concrete reason:{" "}
                      <strong>
                        your application cannot then be rejected on the ground that the photograph
                        or signature does not meet prescribed standards
                      </strong>
                      , and you are not required to bring a recent colour photograph or an original
                      photo identity proof to the exam venue.
                    </p>
                    <p className="text-body-md">
                      For this to work, your Aadhaar name and date of birth need to match your
                      Class 10 records. Check that first — an Aadhaar correction takes days and is
                      far easier to do before an application window than during one. Candidates who
                      choose not to provide Aadhaar details upload another valid photo identity
                      proof instead, and keep the standard photo and signature obligations.
                      Visually impaired candidates are given an option to bypass Aadhaar face
                      authentication.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 3",
                description: "Live photo capture",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">
                      Step 3 — Capture your live photograph
                    </h3>
                    <p className="text-body-md">
                      There is no photo upload. The application module opens your camera and takes
                      the picture then and there. This is the step candidates get wrong most often,
                      because there is no second chance to &ldquo;fix it in an app&rdquo; afterwards
                      — so set up properly before you click.
                    </p>
                    <ul className="ml-5 list-disc space-y-1 text-body-md">
                      <li>
                        <strong>Light on your face, not behind you.</strong> Face a window or a
                        lamp. Sitting with a window behind you turns your face into a silhouette,
                        which is the most common reason a live capture looks unusable.
                      </li>
                      <li>
                        <strong>Camera at eye level.</strong> A laptop webcam on a desk shoots
                        upward and distorts the face. Prop it up, or use a phone held at eye height.
                      </li>
                      <li>
                        <strong>Plain background.</strong> A blank wall. Not a bookshelf, not a
                        doorway with people walking through it.
                      </li>
                      <li>
                        <strong>No cap, no mask, no spectacles.</strong> Take them off, including
                        clear glasses.
                      </li>
                      <li>
                        <strong>Fill the guide box.</strong> Your face should sit inside the outline
                        on screen — neither cropped at the ears nor lost in the frame.
                      </li>
                    </ul>
                    <p className="text-body-md">
                      A practical tip: take a test selfie first in the same spot and look at it at
                      full size. If you cannot read your own expression clearly, neither can the
                      person verifying you at the exam centre.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 4",
                description: "Signature upload",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">Step 4 — Upload your signature</h3>
                    <p className="text-body-md">
                      Sign on <strong>plain white paper with a black ink pen</strong>, then scan or
                      photograph it. SSC states that blurred or miniature signatures are summarily
                      rejected, and the file has to land in a narrow{" "}
                      <strong>10 KB to 20 KB</strong> band as a JPEG. Those two requirements pull
                      against each other, which is why this step needs a tool rather than a guess at
                      a quality slider.
                    </p>

                    <div className="space-y-3">
                      <ToolCallout
                        href="/image-crop"
                        title="Crop tightly around the signature first"
                        reason="Cutting away the surrounding paper is what lets a 20 KB file still look sharp — you spend the bytes on the ink instead of on blank space."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-compress/20kb"
                        title="Compress to the 10–20 KB band"
                        reason="Binary-search JPEG that lands just under 20 KB. Check the result is still above 10 KB — SSC rejects on both ends of the band."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/signature-maker"
                        title="No scanner or clean scan? Draw the signature instead"
                        reason="Sign on screen with a finger or mouse and download a crisp JPG on white — no paper texture, no shadow, and nothing to crop out."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />

                      <ToolCallout
                        href="/image-rotate"
                        title="Scan came out sideways? Turn it before uploading"
                        reason="Rewrites the orientation into the pixels, so the portal preview shows it the same way your phone gallery does."
                        icon={<ImageIcon className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />}
                      />
                    </div>

                    <p className="text-body-md">
                      On dimensions: SSC&apos;s own instructions have long specified about{" "}
                      <strong>6.0 cm (width) × 2.0 cm (height)</strong>, while many coaching sites
                      quote 4.0 cm × 2.0 cm. Both describe the same thing in practice — a wide,
                      short crop with the signature filling it. Get the shape roughly 3:1, keep it
                      legible, and land inside the KB band.
                    </p>
                  </>
                ),
              },
              {
                label: "Step 5",
                description: "Application & fee",
                content: (
                  <>
                    <h3 className="text-heading-sm font-semibold">
                      Step 5 — Fill the CGL application and pay the fee
                    </h3>
                    <p className="text-body-md">
                      Log in with your OTR credentials and open the CGL examination. Fill your
                      educational qualification, then the two parts that need real thought:{" "}
                      <strong>post preferences</strong> and <strong>exam centre choices</strong>.
                      Post preferences decide which service you can be allotted to; work out the
                      order deliberately rather than accepting the default sequence, because it is
                      not always revisitable later. Upload category, PwBD or ex-serviceman
                      certificates as PDFs if you are claiming a relaxation.
                    </p>
                    <p className="text-body-md">
                      The fee is <strong>₹100</strong> for General and OBC candidates. Women
                      candidates and candidates in the SC, ST, PwBD and eligible ex-serviceman
                      categories are <strong>exempt</strong>. Pay through BHIM UPI, net banking, or
                      a debit or credit card. SSC typically allows fee payment for a day after the
                      application closes — but treat the application deadline as the real one.
                    </p>
                    <p className="text-body-md">
                      After payment, download and print the confirmation. Keep both the PDF and a
                      printout: you will want the registration number when the admit card window
                      opens, and it is not a number you want to be hunting for on exam week.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* Tools used */}
      <ToolsUsedSection
        tools={[
          {
            href: "/image-compress/20kb",
            title: "Image Compressor · 20 KB",
            description: "Land the signature inside SSC's narrow 10–20 KB band.",
          },
          {
            href: "/signature-maker",
            title: "Signature Maker",
            description: "Draw a signature and download a clean JPG on white. No scanner needed.",
          },
          {
            href: "/image-crop",
            title: "Image Cropper",
            description: "Trim the paper away so the bytes go on the ink, not the background.",
          },
          {
            href: "/image-rotate",
            title: "Image Rotate & Flip",
            description: "Fix a sideways scan permanently, not just in your gallery app.",
          },
          {
            href: "/jpg-to-pdf",
            title: "JPG / Image to PDF",
            description: "Turn category or PwBD certificate scans into a single PDF.",
          },
          {
            href: "/pdf-compress",
            title: "PDF Compressor",
            description: "Shrink a certificate PDF to fit the portal's upload cap.",
          },
        ]}
      />

      {/* Privacy nudge */}
      <section className="mt-12 rounded-md border-l-4 border-l-success-9 border border-surface-border-subtle bg-success-3/30 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-11" aria-hidden />
          <div>
            <h3 className="text-body-md font-semibold">
              Why not just use a free &ldquo;SSC signature resizer&rdquo; site?
            </h3>
            <p className="mt-1 text-body-sm">
              Because your signature is the one document you can never reissue. Most resizer sites
              upload it to a server, and what happens to it afterwards is not something you can
              verify. Every tool above runs locally in your browser — open the DevTools Network tab
              while you compress and you will see no request carrying your file. If you need to move
              a scan from your phone to a cyber café, use{" "}
              <Link href="/quick-send" className="font-medium underline">
                Quick Send
              </Link>{" "}
              rather than WhatsApp: it is peer-to-peer and stores nothing.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqAccordion faqs={FAQS} />

      {/* Final nudge */}
      <section className="mt-12 rounded-md border border-surface-border-subtle p-6 text-center">
        <h2 className="text-heading-md font-semibold">Ready to prepare your signature?</h2>
        <p className="mt-2 text-body-md text-surface-fg-muted">
          Crop it tight, then hit the 10–20 KB band exactly — both in your browser, in under a
          minute.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button asChild variant="solid" size="lg">
            <Link href="/image-compress/20kb">Compress signature to 20 KB →</Link>
          </Button>
          <Button asChild variant="soft" size="lg">
            <Link href="/signature-maker">Draw a signature instead</Link>
          </Button>
        </div>
      </section>

      <p className="mt-12 text-body-xs text-surface-fg-muted">
        Based on SSC&apos;s published application instructions and the current CGL notice.{" "}
        {LAST_UPDATED_LABEL}. SSC revises its process between cycles — the move to ssc.gov.in and to
        live photo capture are both recent — so always read the notice for the cycle you are
        applying in at ssc.gov.in before submitting.{" "}
        <Link href="/form-guides" className="underline">
          More form guides
        </Link>
        .
      </p>
    </main>
  );
}

// Keep ESLint from complaining about the date string when it's unused in
// future variants of this page (e.g. a localized hi version).
void LAST_UPDATED;
