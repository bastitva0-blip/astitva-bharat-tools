import Link from "next/link";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { LanderPricing } from "@/components/lander-pricing";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "For operators — cyber café, CSC, photo studio",
  description:
    "Process 50 forms a day without iLovePDF's monthly bill. ₹1,999/year commercial-use licence. Browser-only — no customer Aadhaar on any server.",
  alternates: { canonical: "/for-operators" },
};

const REASONS = [
  {
    title: "Built for shop speed",
    body:
      "Batch processing. Single click for ten customers worth of photos. Spec-perfect for every Indian exam portal.",
  },
  {
    title: "One annual payment",
    body:
      "₹1,999 a year. No monthly bill. No card mandate. UPI once, done.",
  },
  {
    title: "No upload, no liability",
    body:
      "Your customer's Aadhaar never touches a server — not ours, not anyone's. Browser-only by architecture.",
  },
];

const TOOLS: { name: string; href?: string; line: string }[] = [
  { name: "Exam Photo Resizer", href: "/photo-resize", line: "UPSC, SSC, NEET, JEE, IBPS — exact pixel + KB specs." },
  { name: "Photo + Signature Joiner", href: "/photo-signature-joiner", line: "SSC and IBPS upload layouts in one click." },
  { name: "Document Photo Maker", href: "/document-photo", line: "Aadhaar, PAN, Passport, OCI, Voter ID — to spec." },
  { name: "Print Sheet Generator", href: "/print-sheet", line: "6–8 passport photos on one sheet, with cut lines." },
  { name: "Print Job Slip", href: "/print-job-slip", line: "Files + cover sheet — what the customer brought, on paper." },
  { name: "PDF Compressor", href: "/pdf-compress", line: "Shrink PDFs below portal upload limits." },
  { name: "PDF Merge & Split", href: "/pdf-merge-split", line: "Combine or split by page ranges — what most portals want." },
  { name: "Quick Send", href: "/quick-send", line: "Customer scans a QR, sends files to your screen — no app." },
  { name: "Aadhaar Photo Crop", line: "Coming next — crop the photo straight off an Aadhaar PDF." },
];

export default function ForOperatorsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "For operators" }])}
      />
      <main className="mx-auto w-full max-w-4xl px-page-x py-10">
        <PageHeader
          title="Process 50 forms a day. Without iLovePDF's monthly bill."
          subtitle="Cyber café, CSC, photo studio — BharatTools costs ₹5.50 a day. Pays for itself in two customers."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "For operators" }]}
        />
        <div className="mt-ds-06">
          <Button asChild size="lg">
            <a href="#pricing">See the operator plan →</a>
          </Button>
        </div>

        <section className="mt-16">
          <h2 className="text-heading-md font-semibold text-surface-fg">
            Why operators pick this
          </h2>
          <div className="mt-ds-05 grid gap-ds-04 sm:grid-cols-3">
            {REASONS.map((r) => (
              <Card key={r.title} variant="outline" className="h-full">
                <CardHeader>
                  <CardTitle>{r.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body-sm text-surface-fg-muted">{r.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-heading-md font-semibold text-surface-fg">
            What you get
          </h2>
          <ul className="mt-ds-05 divide-y divide-surface-border-subtle border-y border-surface-border-subtle">
            {TOOLS.map((t) => (
              <li key={t.name} className="flex flex-col gap-1 py-ds-04 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div className="font-medium text-surface-fg">
                  {t.href ? (
                    <Link href={t.href} className="hover:text-accent-11 hover:underline">
                      {t.name}
                    </Link>
                  ) : (
                    <span>
                      {t.name}{" "}
                      <span className="ml-1 text-body-xs text-surface-fg-subtle">(soon)</span>
                    </span>
                  )}
                </div>
                <div className="text-body-sm text-surface-fg-muted sm:text-right">{t.line}</div>
              </li>
            ))}
          </ul>
        </section>

        <LanderPricing segment="operator" />

        <section className="mt-16 rounded-lg border border-surface-border-subtle bg-surface-2 p-ds-06">
          <h2 className="text-heading-sm font-semibold text-surface-fg">
            Three questions if you run a shop
          </h2>
          <ul className="mt-ds-04 space-y-ds-03 text-body-md text-surface-fg-muted">
            <li>Are you charging your customers for forms they could fail?</li>
            <li>Do your tools work when the customer's portal asks for exactly 50 KB?</li>
            <li>If your hard disk gets seized tomorrow, what's on it?</li>
          </ul>
          <p className="mt-ds-05 text-body-md text-surface-fg">
            BharatTools answers the third one for you — nothing.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
