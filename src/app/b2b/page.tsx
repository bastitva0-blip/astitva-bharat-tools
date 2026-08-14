import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "For NBFCs & fintechs — browser-only KYC pre-processing",
  description:
    "Compress and mask your customer's KYC document inside their browser before it reaches your server. DPDP-ready. Signed on-device attestation receipt.",
  alternates: { canonical: "/b2b" },
};

const REASONS = [
  {
    title: "Document never reaches your server raw",
    body:
      "The customer's Aadhaar is masked and compressed inside their browser. Your server only ever sees the processed blob — not the original.",
  },
  {
    title: "Signed on-device attestation",
    body:
      "After each processing run, we emit a signed receipt: what was processed, what was masked, and a cryptographic assertion that zero bytes were sent to any external server during processing. Your audit trail.",
  },
  {
    title: "Shrinks your DPDP breach surface",
    body:
      "DPDP enforcement is live. The one document your compliance team worries about most — Aadhaar — never passes through your infrastructure in the clear. That's the audit that doesn't get you fined.",
  },
];

const FEATURES: { name: string; line: string }[] = [
  { name: "Drop-in React/vanilla-JS embed widget", line: "@bharattools/kyc-embed — design partner build." },
  { name: "On-device Aadhaar masking", line: "First 8 digits masked, RBI-recommended standard." },
  { name: "Document validation at capture", line: "Reject blurry, wrong-format documents before they enter your pipeline." },
  { name: "Signed processing receipt", line: "Hash + timestamp + zero-outbound assertion — per transaction." },
  { name: "Direct upload to your S3/Azure endpoint", line: "Raw file never touches BharatTools infrastructure." },
  { name: "DPDP compliance evidence pack", line: "Auto-generated per tenant — ready for audit." },
];

export default function B2BPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "For NBFCs & fintechs" }])}
      />
      <main className="mx-auto w-full max-w-4xl px-page-x py-10">
        <PageHeader
          title="Your customer's Aadhaar should never reach your server raw."
          subtitle="Browser-only KYC pre-processing for NBFCs and fintechs. DPDP-ready. Signed on-device attestation receipt. The Aadhaar is masked before your server ever sees it."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "For NBFCs & fintechs" }]}
        />
        <div className="mt-ds-06">
          <Button asChild size="lg">
            <a href="mailto:mudit@devalok.in?subject=B2B%20KYC%20Embed%20Pilot">
              Talk to us about a design-partner pilot →
            </a>
          </Button>
        </div>

        <section className="mt-16">
          <h2 className="text-heading-md font-semibold text-surface-fg">
            Why NBFCs pick this
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
            {FEATURES.map((f) => (
              <li key={f.name} className="flex flex-col gap-1 py-ds-04 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div className="font-medium text-surface-fg">{f.name}</div>
                <div className="text-body-sm text-surface-fg-muted sm:text-right">{f.line}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-lg border border-surface-border-subtle bg-surface-2 p-ds-06">
          <h2 className="text-heading-sm font-semibold text-surface-fg">Pricing</h2>
          <p className="mt-ds-03 text-body-md text-surface-fg-muted">
            Setup fee + annual platform fee + per-document. Target: sub-5,000 KYC/month lenders
            (entry band). Exact numbers on a call — pricing is structured around your volume.
          </p>
          <div className="mt-ds-05">
            <Button asChild size="lg">
              <a href="mailto:mudit@devalok.in?subject=B2B%20KYC%20Embed%20Pilot">
                Talk to us about a design-partner pilot →
              </a>
            </Button>
          </div>
        </section>

        <section className="mt-16 rounded-lg border border-surface-border-subtle bg-surface-2 p-ds-06">
          <p className="text-body-md text-surface-fg-muted">
            We are currently signing 2–3 design-partner NBFCs before the general launch. Design
            partners shape the attestation receipt and validation rules — and pay a design-partner
            rate, not list price.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
