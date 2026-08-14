import Link from "next/link";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "For coaching institutes — branded tools for your aspirants",
  description:
    "Give your students a branded document tool under your name — tools.yourcoaching.in. ₹25,000–₹1,00,000/year. Powered by BharatTools, white-labelled for your brand.",
  alternates: { canonical: "/for-coaching" },
};

const REASONS = [
  {
    title: "Your brand, your aspirants",
    body:
      "tools.yourcoaching.in — a fast, private, swadeshi tool under your name. Your students stay on your brand, not ours.",
  },
  {
    title: "Built for the exam season",
    body:
      "Pre-configured for every exam your students sit: UPSC, SSC, NEET, JEE, IBPS, RRB. Spec accuracy maintained, not guesswork.",
  },
  {
    title: "Inside your existing software budget",
    body:
      "Coaching institutes already spend ₹15,000–₹1,00,000/year on white-label student software. A branded document-tools subdomain is a small, high-trust add.",
  },
];

const TOOLS: { name: string; href?: string; line: string }[] = [
  { name: "All exam photo resizers", href: "/photo-resize", line: "UPSC, SSC, NEET, JEE, IBPS, RRB — exact pixel + KB specs." },
  { name: "Batch compress for aspirants", href: "/batch-compress", line: "Compress multiple documents in one go — no upload limit." },
  { name: "Form guides for every exam", href: "/form-guides", line: "Step-by-step guides covering every major exam portal." },
  { name: "Print Sheet Generator", href: "/print-sheet", line: "6–8 passport photos on one sheet, with cut lines." },
  { name: "Aadhaar Masking for staff", href: "/aadhaar-mask", line: "Black out the Aadhaar number before storing or sharing." },
  { name: "Custom exam presets for your institute", line: "Tailored presets for your exam portfolio — on request." },
];

export default function ForCoachingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "For coaching institutes" }])}
      />
      <main className="mx-auto w-full max-w-4xl px-page-x py-10">
        <PageHeader
          title="Give your aspirants a branded document tool — under your name."
          subtitle="PW, Adda247, or your regional institute — a fast, private, swadeshi tool at tools.yourcoaching.in. Powered by BharatTools, white-labelled for your brand."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "For coaching institutes" }]}
        />
        <div className="mt-ds-06">
          <Button asChild size="lg">
            <a href="mailto:mudit@devalok.in?subject=Coaching%20White-label">
              Explore co-branding →
            </a>
          </Button>
        </div>

        <section className="mt-16">
          <h2 className="text-heading-md font-semibold text-surface-fg">
            Why coaching institutes pick this
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
            What your students get
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
                      <span className="ml-1 text-body-xs text-surface-fg-subtle">(on request)</span>
                    </span>
                  )}
                </div>
                <div className="text-body-sm text-surface-fg-muted sm:text-right">{t.line}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-lg border border-surface-border-subtle bg-surface-2 p-ds-06">
          <h2 className="text-heading-sm font-semibold text-surface-fg">Pricing</h2>
          <p className="mt-ds-03 text-body-md text-surface-fg-muted">
            ₹25,000–₹1,00,000/year per subdomain instance. Pricing depends on student volume and
            the exam presets included. Exact quote on a call.
          </p>
          <div className="mt-ds-05">
            <Button asChild size="lg">
              <a href="mailto:mudit@devalok.in?subject=Coaching%20White-label">
                Explore co-branding →
              </a>
            </Button>
          </div>
        </section>

        <section className="mt-16 rounded-lg border border-surface-border-subtle bg-surface-2 p-ds-06">
          <p className="text-body-md text-surface-fg-muted">
            Already mentioning BharatTools in your videos? We'll convert that free mention into a
            branded subdomain — your students get a faster, private experience, and you get a tool
            that pays back in retention.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
