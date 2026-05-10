import Link from "next/link";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "About",
  description:
    "BharatTools is a privacy-first toolkit for every step of submitting an Indian government form. Files never leave your device.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "About" }])}
      />
      <PageHeader
        title="About"
        subtitle="Har Sarkari form ka saathi."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <div className="mt-8 space-y-6">
        <Card variant="outline">
          <CardHeader>
            <CardTitle>What this is</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-body-md">
            <p>
              BharatTools is a small toolkit for the chores that come with submitting an
              Indian government form - exam photos at exact pixel and KB specs, KB-target
              image compression, photo-and-signature uploads, document-photo creation,
              print sheets and image-to-PDF.
            </p>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle>Why it exists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-body-md">
            <p>
              The Sarkari form workflow is fragmented across five to eight different
              websites. The global incumbents have no India-specific presets; the existing
              Indian players lack design polish or a unified flow. We thought a focused,
              fast, browser-only toolkit could do this better.
            </p>
            <p>
              We&rsquo;re free, no signup, ad-light. Built to be useful first.
            </p>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle>Who&rsquo;s building it</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-body-md">
            <p>BharatTools is built by Mudit Lal at Devalok.</p>
            <p>
              The interface is built on{" "}
              <a
                href="https://shilp-sutra.devalok.in"
                target="_blank"
                rel="noreferrer"
                className="text-accent-11 hover:text-accent-12"
              >
                Shilp Sutra
              </a>
              , Devalok&rsquo;s open design system.
            </p>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle>Get in touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-body-md">
            <p>
              For privacy questions, feedback or bug reports, email{" "}
              <a
                href="mailto:hi@bharattools.devalok.dev"
                className="text-accent-11 hover:text-accent-12"
              >
                hi@bharattools.devalok.dev
              </a>
              .
            </p>
            <p>
              See also our <Link href="/privacy" className="text-accent-11 hover:text-accent-12">privacy policy</Link>{" "}
              and <Link href="/terms" className="text-accent-11 hover:text-accent-12">terms of service</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
