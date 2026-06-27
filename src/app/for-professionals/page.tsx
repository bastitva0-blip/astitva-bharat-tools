import Link from "next/link";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { LanderPricing } from "@/components/lander-pricing";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "For professionals — CAs, CS firms, travel agents, coaching offices",
  description:
    "Handle client documents without uploading them anywhere. DPDP-friendly by architecture. ₹1,999/year commercial-use licence.",
  alternates: { canonical: "/for-professionals" },
};

const REASONS = [
  {
    title: "DPDP-friendly, before May 2027",
    body:
      "India's data protection law enforces in 2027. Storing a client's raw Aadhaar on a foreign PDF tool is a liability you don't need. Browser-only means nothing for the regulator to fine you over.",
  },
  {
    title: "Built for office workflows",
    body:
      "Aadhaar masking, PDF compress to portal limits, document photo prep, password-protect a draft, batch a folder. The tools your work actually uses.",
  },
  {
    title: "One licence, one fee",
    body:
      "₹1,999 a year. Commercial-use licence. UPI once. No subscriptions, no auto-renew.",
  },
];

const TOOLS: { name: string; href?: string; line: string }[] = [
  { name: "Aadhaar Masking", line: "Coming next — black out the Aadhaar number, keep the rest." },
  { name: "PDF Compressor", href: "/pdf-compress", line: "Hit the portal upload limit, every time." },
  { name: "PDF Merge & Split", href: "/pdf-merge-split", line: "Combine drafts or split by page ranges." },
  { name: "PDF Add Password", line: "Coming next — password-protect a draft before email." },
  { name: "Document Photo Maker", href: "/document-photo", line: "Aadhaar, PAN, Passport, OCI, Voter ID — to spec." },
  { name: "Photo + Signature Joiner", href: "/photo-signature-joiner", line: "Portal-ready signature layouts in one click." },
  { name: "Image Compressor", href: "/image-compress", line: "Hit an exact KB target — within ±5 KB." },
  { name: "Quick Send", href: "/quick-send", line: "Send a file to a colleague or client — no upload, no app." },
];

export default function ForProfessionalsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "For professionals" }])}
      />
      <main className="mx-auto w-full max-w-4xl px-page-x py-10">
        <PageHeader
          title="Your client's Aadhaar shouldn't live on iLovePDF's servers."
          subtitle="For CAs, CS firms, travel agents, coaching offices — handle client documents without uploading them to anyone. DPDP-friendly by architecture."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "For professionals" }]}
        />
        <div className="mt-ds-06">
          <Button asChild size="lg">
            <a href="#pricing">See the professional plan →</a>
          </Button>
        </div>

        <section className="mt-16">
          <h2 className="text-heading-md font-semibold text-surface-fg">
            Why professionals pick this
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
            Featured tools
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

        <LanderPricing segment="professional" />

        <section className="mt-16 rounded-lg border border-surface-border-subtle bg-surface-2 p-ds-06">
          <p className="text-body-md text-surface-fg-muted">
            A practice for those who believe their client's documents deserve the same care as the work itself. The tools are free to try. The licence is for the work that pays.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
