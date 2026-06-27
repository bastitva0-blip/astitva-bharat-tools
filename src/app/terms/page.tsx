import Link from "next/link";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Terms of Service",
  description: "BharatTools terms of service - free, browser-only, no warranty, Indian jurisdiction.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "8 May 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Terms" }])}
      />
      <PageHeader
        title="Terms of Service"
        subtitle={`Last updated ${LAST_UPDATED}.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
      />

      <article className="mt-8 space-y-8 text-body-md">
        <Section title="Free service, as-is">
          <p>
            BharatTools is provided free of charge and without warranty of any kind. The
            tools aim to match the published specifications of common Indian government
            portals, but those specifications change without notice - the operating
            portal, not BharatTools, is the source of truth on what an upload must look
            like.
          </p>
          <p>
            By using BharatTools you accept that your output may need adjustment to be
            accepted by a particular form, and that we are not responsible for any
            rejection, missed deadline or other downstream consequence.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            Use the tools to prepare your own legitimate documents. Do not use them to
            forge identity documents, impersonate another person, or violate any law. We
            may block obvious abuse at the network layer if it impacts service for
            others.
          </p>
        </Section>

        <Section title="No accounts, no payments">
          <p>
            Phase 1 has no accounts and accepts no payments. If a future release
            introduces a paid tier, the existing free tools and their underlying
            browser-only privacy posture will not regress.
          </p>
        </Section>

        <Section title="Files stay on your device">
          <p>
            All Phase 1 tools run in your browser. We don&rsquo;t store, transmit or
            otherwise process the files you drop into them. See our{" "}
            <Link href="/privacy" className="text-accent-11 hover:text-accent-12">
              privacy policy
            </Link>{" "}
            for the full picture.
          </p>
        </Section>

        <Section title="Advertising">
          <p>
            Phase 1 does not run third-party advertising. If we add ads in a future
            release, this section will be updated to describe the placement, the network
            (e.g. Google AdSense) and the data the ad network may collect.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the maximum extent permitted by law, BharatTools and its operators are
            not liable for any indirect, incidental, special, consequential or punitive
            damages arising out of your use of the service.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms as the product evolves. The &ldquo;Last
            updated&rdquo; date at the top reflects the most recent change. Material
            changes will be highlighted on the home page or in product UI for a
            reasonable window before they take effect.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These terms are governed by the laws of India. Any disputes will be subject
            to the exclusive jurisdiction of the courts of Lucknow, Uttar Pradesh.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these terms:{" "}
            <a href="mailto:mudit@devalok.in" className="text-accent-11 hover:text-accent-12">
              mudit@devalok.in
            </a>
            .
          </p>
        </Section>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-heading-md font-semibold">{title}</h2>
      {children}
    </section>
  );
}
