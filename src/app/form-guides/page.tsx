import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { formGuides } from "@/lib/form-guides";
import { breadcrumbSchema } from "@/lib/seo/schema";

const PAGE_TITLE = "Sarkari Form Filling Guides — Step-by-step, with In-browser Tools";
const PAGE_DESCRIPTION =
  "Step-by-step guides to filling Indian government and exam forms — JEE Main, UPSC, SSC, NEET, IBPS, Aadhaar, PAN. Photo specs, KB targets, document upload rules, with free in-browser tools to prepare each file. Nothing leaves your device.";

const PAGE_KEYWORDS = [
  "sarkari form filling guide",
  "exam form filling guide",
  "how to fill exam form",
  "NTA form filling",
  "UPSC form filling guide",
  "SSC form filling guide",
  "JEE Main form filling guide",
  "form photo size guide",
  "form signature size guide",
  "सरकारी फॉर्म कैसे भरें",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/form-guides",
    languages: {
      "en-IN": "/form-guides",
      "hi-IN": "/form-guides",
      "x-default": "/form-guides",
    },
  },
  openGraph: {
    type: "website",
    url: "/form-guides",
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

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default async function FormGuidesIndexPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const sorted = [...formGuides].sort((a, b) => a.order - b.order);

  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={breadcrumbSchema([
          { label: "Home", href: "/" },
          { label: "Form guides" },
        ])}
      />

      <PageHeader
        title="Form filling guides"
        subtitle="Walk-throughs for the government and exam forms Indians fill most. Each guide names the photo and signature spec, the upload limits, and the right BharatTools tool for every step."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Form guides" },
        ]}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((guide) => (
          <Link key={guide.slug} href={`/form-guides/${guide.slug}`} className="block">
            <Card variant="outline" interactive className="h-full">
              <CardHeader>
                <CardTitle>{guide.examName}</CardTitle>
                <CardDescription>{guide.fullName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-body-sm text-surface-fg-muted">{guide.description}</p>
                <div className="rounded-md border border-surface-border-subtle bg-surface-2 px-3 py-2 text-body-xs font-medium">
                  {guide.specSummary}
                </div>
                <div className="flex items-center justify-between text-body-xs text-surface-fg-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3" aria-hidden />
                    Updated {formatLastUpdated(guide.lastUpdatedAt)}
                  </span>
                  <ArrowRight className="size-3.5 opacity-50" aria-hidden />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {sorted.length < 3 && (
        <section className="mt-12 rounded-md border border-dashed border-surface-border-subtle p-6 text-body-sm text-surface-fg-muted">
          <p className="font-medium text-surface-fg">More guides on the way.</p>
          <p className="mt-1">
            UPSC, SSC, NEET, IBPS, RRB, Aadhaar update, PAN application — all queued.
            Each one names the exact photo and signature spec, the upload rules, and the
            in-browser tool for every step.
          </p>
        </section>
      )}
    </main>
  );
}
