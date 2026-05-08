import Link from "next/link";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Privacy Policy",
  description:
    "BharatTools processes every file on-device. Your files never leave your browser. Read the full privacy policy.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "8 May 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Privacy" }])}
      />
      <PageHeader
        title="Privacy Policy"
        subtitle={`Last updated ${LAST_UPDATED}.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
      />

      <article className="mt-8 space-y-8 text-body-md">
        <Section title="The short version">
          <p>
            We don&rsquo;t see your files. Every Phase 1 tool runs entirely in your
            browser using JavaScript and WebAssembly. Photos, PDFs and signatures are
            read, processed and downloaded right where you opened them — they are not
            uploaded to our servers, and we have no way to retrieve them.
          </p>
          <p>
            We also keep collection of everything else minimal. We don&rsquo;t require
            an account, we don&rsquo;t ask for your email, and we don&rsquo;t run
            third-party analytics or advertising in Phase 1.
          </p>
        </Section>

        <Section title="What we collect">
          <p>
            <strong>Server access logs.</strong> Like any website, our hosting
            provider (Cloudflare in front of Railway) records standard request metadata
            for security and abuse prevention: IP address (hashed by Cloudflare),
            request path, user-agent, timestamp. These logs are retained for the
            provider&rsquo;s default window and are not joined with any other data.
          </p>
          <p>
            <strong>Nothing you put into a tool.</strong> Files you drop into any tool
            stay in your browser. We don&rsquo;t see filenames, file contents, image
            data, or any text you might have entered in form fields.
          </p>
        </Section>

        <Section title="What we don&rsquo;t collect">
          <ul className="list-disc space-y-1 pl-5">
            <li>Names, phone numbers, email addresses, government IDs</li>
            <li>File contents, filenames, EXIF metadata, signatures</li>
            <li>Account information — there are no accounts</li>
            <li>Behavioural analytics (no PostHog, GA, Mixpanel etc. in Phase 1)</li>
            <li>Advertising cookies (no AdSense or equivalent in Phase 1)</li>
          </ul>
        </Section>

        <Section title="If we add analytics or ads later">
          <p>
            If a future release introduces optional analytics or advertising, we will
            update this page first, gate the integrations behind a clearly-labelled
            consent banner with &ldquo;Accept&rdquo; and &ldquo;Essential only&rdquo;
            buttons, and document any new data flows. We&rsquo;d rather show you what
            changed than slip new collection in quietly.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Under the Digital Personal Data Protection Act, 2023 (India) and the GDPR
            (where applicable), you have the right to access, correct, port, and delete
            personal data we hold about you. Because we don&rsquo;t hold personal data
            beyond minimal access logs, most of these requests will return an empty
            answer — but if you believe we have data on you and want it removed, email
            us at the address below and we will respond within 30 days.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Privacy questions:{" "}
            <a href="mailto:hi@bharattools.app" className="text-accent-11 hover:text-accent-12">
              hi@bharattools.app
            </a>
            .
          </p>
          <p>
            See also our{" "}
            <Link href="/terms" className="text-accent-11 hover:text-accent-12">
              terms of service
            </Link>{" "}
            and{" "}
            <Link href="/about" className="text-accent-11 hover:text-accent-12">
              about page
            </Link>
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
