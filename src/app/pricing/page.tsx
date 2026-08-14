import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Pricing — Free for aspirants. Annual for everyone else.",
  description:
    "BharatTools is free for students and aspirants. Individual licence ₹499/yr. Commercial licence (operators & professionals) ₹1,999/yr. UPI, one-time, no auto-renew.",
  alternates: { canonical: "/pricing" },
};

interface Plan {
  id: string;
  name: string;
  price: string;
  cadence?: string;
  bestFor: string;
  features: string[];
  cta: { label: string; href: string; mailto?: boolean };
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "aspirants",
    name: "Aspirants",
    price: "Free",
    cadence: "always",
    bestFor: "Students preparing for UPSC, SSC, NEET, JEE, IBPS and similar.",
    features: [
      "Every exam-photo and document-photo tool",
      "Image and PDF compression to portal limits",
      "Photo + signature joiner for SSC, IBPS",
      "No signup, no ads, no tracking",
    ],
    cta: { label: "Open the tools", href: "/" },
  },
  {
    id: "individual",
    name: "Individual",
    price: "₹499",
    cadence: "/ year",
    bestFor: "Personal use beyond exam season. Or ₹19 for the next 24 hours.",
    features: [
      "Everything in Free",
      "Batch processing across tools",
      "Higher per-day limits on heavy jobs",
      "Personal licence, one device",
    ],
    cta: { label: "Get individual access", href: "mailto:mudit@devalok.in?subject=Individual%20plan", mailto: true },
  },
  {
    id: "operators",
    name: "Operators",
    price: "₹1,999",
    cadence: "/ year",
    bestFor: "Cyber café, CSC, photo studio — paid commercial use, shop speed.",
    features: [
      "Commercial-use licence, one device",
      "Unlimited batch processing",
      "Shop-friendly tools: Print Sheet, Print Job Slip, Quick Send",
      "Customer Aadhaar never touches a server",
    ],
    cta: { label: "Read the operator pitch", href: "/for-operators" },
    highlight: true,
  },
  {
    id: "professionals",
    name: "Professionals",
    price: "₹1,999",
    cadence: "/ year",
    bestFor: "CAs, CS firms, travel agents, coaching offices — DPDP-friendly.",
    features: [
      "Commercial-use licence, one device",
      "Office tools: Aadhaar masking, PDF password, merge & split",
      "Browser-only — no client docs on any server",
      "Ready for DPDP enforcement (May 2027)",
    ],
    cta: { label: "Read the professional pitch", href: "/for-professionals" },
  },
  {
    id: "coaching",
    name: "Coaching Institutes",
    price: "₹25k–₹1L",
    cadence: "/ year",
    bestFor: "White-label BharatTools for your aspirant batches. Your brand, our infra.",
    features: [
      "Custom subdomain or embed on your site",
      "Your logo and colours",
      "All aspirant tools — exam photo, compress, forms",
      "Managed, no IT headaches",
    ],
    cta: { label: "Explore coaching white-label", href: "/for-coaching" },
  },
  {
    id: "b2b",
    name: "Business / B2B",
    price: "Custom",
    bestFor: "NBFCs, fintechs, HFCs — embed DPDP-safe KYC tools in your workflow.",
    features: [
      "API or iframe embed",
      "Aadhaar masking + PDF password on your platform",
      "Signed attestation for audit trails",
      "On-device processing — no data egress",
    ],
    cta: { label: "Talk to us about B2B", href: "/b2b" },
  },
];

const ALWAYS_FREE = [
  "JPG / Image to PDF",
  "PDF Compress (small files)",
  "PDF Merge",
  "Image Compress (single file)",
  "All exam-photo tools, for aspirants",
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Pricing" }])}
      />
      <main className="mx-auto w-full max-w-6xl px-page-x py-10">
        <PageHeader
          title="Free for aspirants. Annual for everyone else."
          subtitle="One payment a year, by UPI. No subscriptions, no auto-renew, no card stored. Free tier stays free."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
        />

        <section className="mt-ds-08 grid gap-ds-05 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              id={plan.id}
              variant={plan.highlight ? "elevated" : "outline"}
              className="flex h-full scroll-mt-24 flex-col"
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.id === "aspirants" && (
                    <span className="text-body-xs font-medium text-success-11">● Seva</span>
                  )}
                </div>
                <div className="mt-ds-03 flex items-baseline gap-1">
                  <span className="text-heading-lg font-semibold text-surface-fg">
                    {plan.price}
                  </span>
                  {plan.cadence && (
                    <span className="text-body-sm text-surface-fg-muted">
                      {plan.cadence}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-ds-02">{plan.bestFor}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-ds-05">
                <ul className="space-y-ds-02 text-body-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-surface-fg-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-11" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.highlight ? "solid" : "soft"} className="w-full">
                  <Link href={plan.cta.href}>{plan.cta.label}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-16 rounded-lg border border-surface-border-subtle bg-surface-2 p-ds-06">
          <h2 className="text-heading-sm font-semibold text-surface-fg">
            What stays free for everyone
          </h2>
          <p className="mt-ds-03 text-body-md text-surface-fg-muted">
            Some tools are always free, on every plan, with no batch limits worth mentioning. The free tier exists so that aspirants and one-off users never hit a wall.
          </p>
          <ul className="mt-ds-04 grid gap-ds-02 text-body-sm text-surface-fg sm:grid-cols-2">
            {ALWAYS_FREE.map((tool) => (
              <li key={tool} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success-11" aria-hidden />
                <span>{tool}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 space-y-ds-05">
          <h2 className="text-heading-md font-semibold text-surface-fg">
            How payment works
          </h2>
          <div className="grid gap-ds-04 sm:grid-cols-2">
            <Card variant="outline">
              <CardHeader>
                <CardTitle>UPI, one-time</CardTitle>
              </CardHeader>
              <CardContent className="text-body-sm text-surface-fg-muted">
                Pay once via UPI. No card stored. No auto-renew. The licence runs for a year from the day you pay.
              </CardContent>
            </Card>
            <Card variant="outline">
              <CardHeader>
                <CardTitle>Receipt by email</CardTitle>
              </CardHeader>
              <CardContent className="text-body-sm text-surface-fg-muted">
                You get a GST-compliant receipt by email. Use it for office expenses without needing a portal login.
              </CardContent>
            </Card>
            <Card variant="outline">
              <CardHeader>
                <CardTitle>Tied to a device</CardTitle>
              </CardHeader>
              <CardContent className="text-body-sm text-surface-fg-muted">
                The licence unlocks the browser you paid on. If you switch laptops, write in — we'll move it without fuss.
              </CardContent>
            </Card>
            <Card variant="outline">
              <CardHeader>
                <CardTitle>Self-serve checkout, soon</CardTitle>
              </CardHeader>
              <CardContent className="text-body-sm text-surface-fg-muted">
                UPI checkout in the browser is being built. Until it ships, the plan buttons above email us — we'll set you up the same day.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
