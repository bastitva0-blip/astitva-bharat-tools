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

const LAST_UPDATED = "20 June 2026";

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
            read, processed and downloaded right where you opened them - they are not
            uploaded to our servers, and we have no way to retrieve them.
          </p>
          <p>
            We also keep everything else minimal. We don&rsquo;t require an account,
            and we don&rsquo;t ask for your email. To improve the tools we collect
            anonymous, cookieless usage metrics &mdash; no cookies, no personal data,
            and never the contents of your files. You can opt out anytime from the
            notice on your first visit or via &ldquo;Analytics preferences&rdquo; in the
            footer.
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
          <p>
            <strong>Anonymous usage metrics.</strong> To learn which tools get used,
            where people get stuck, and what breaks, we record cookieless, aggregate
            events &mdash; for example which tool was opened, whether processing
            succeeded or failed, and <em>bucketed</em> file sizes (e.g.
            &ldquo;100KB&ndash;1MB&rdquo;, never the exact bytes or the file itself).
            They carry no identifier that can single you out, set no cookies, and are
            sent to Google Analytics 4 and PostHog (both configured cookieless and
            anonymous). You can opt out at any time.
          </p>
          <p>
            <strong>Search terms.</strong> Words you type into the tool search box are
            recorded in aggregate (e.g. to spot tools we&rsquo;re missing) - never the
            text you enter <em>inside</em> a tool, and never linked to you. Please
            don&rsquo;t type personal details into search; opting out stops this too.
          </p>
        </Section>

        <Section title="What we don&rsquo;t collect">
          <ul className="list-disc space-y-1 pl-5">
            <li>Names, phone numbers, email addresses, government IDs</li>
            <li>File contents, filenames, EXIF metadata, signatures</li>
            <li>Account information - there are no accounts</li>
            <li>Tracking cookies or cross-site identifiers - our analytics are cookieless and anonymous</li>
            <li>Session recordings or replays - we never record your screen</li>
            <li>Advertising cookies or ad networks (no AdSense or equivalent)</li>
          </ul>
        </Section>

        <Section title="Analytics and your choices">
          <p>
            We use two analytics tools - <strong>Google Analytics 4</strong> and{" "}
            <strong>PostHog</strong> - both configured to be cookieless and anonymous:
            they set no cookies, build no persistent profile, and collect no personal
            data or file contents. We use them only to improve the product - finding
            drop-off points and bugs.
          </p>
          <p>
            This includes <strong>aggregate heatmaps</strong> - where on a page people
            click and how far they scroll - captured as anonymous coordinates, with no
            recording of your screen and no cookies. It tells us which buttons get
            missed and where layouts confuse, nothing about who you are.
          </p>
          <p>
            A notice tells you on your first visit. You can opt out at any time - from
            that notice or via <strong>&ldquo;Analytics preferences&rdquo;</strong> in
            the footer. Opting out stops all analytics immediately and is remembered on
            this device. We&rsquo;d rather show you what we collect than slip anything in
            quietly.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Under the Digital Personal Data Protection Act, 2023 (India) and the GDPR
            (where applicable), you have the right to access, correct, port, and delete
            personal data we hold about you. Because we don&rsquo;t hold personal data
            beyond minimal access logs, most of these requests will return an empty
            answer - but if you believe we have data on you and want it removed, email
            us at the address below and we will respond within 30 days.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Privacy questions:{" "}
            <a href="mailto:mudit@devalok.in" className="text-accent-11 hover:text-accent-12">
              mudit@devalok.in
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
