import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { documentPresets } from "@/lib/presets/documents";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Document Photo Maker",
  description:
    "Identity-document photos at exact spec — Aadhaar, PAN, Indian Passport (ICAO), Voter ID, OCI.",
  alternates: { canonical: "/document-photo" },
};

export default function DocumentPhotoHubPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Document Photo Maker" }]),
          collectionPageSchema({
            name: "Document Photo Maker",
            description:
              "Identity-document photos at exact spec — Aadhaar, PAN, Indian Passport (ICAO), Voter ID, OCI.",
            path: "/document-photo",
            items: documentPresets.map((p) => ({
              name: `${p.name} Photo`,
              path: `/document-photo/${p.slug}`,
            })),
          }),
        ]}
      />
      <PageHeader
        title="Document Photo Maker"
        subtitle="Pick the document. We apply the exact pixel size, KB target and white background it needs."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Document Photo Maker" }]}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documentPresets.map((p) => (
          <Link key={p.slug} href={`/document-photo/${p.slug}`} className="block">
            <Card variant="outline" interactive className="h-full">
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>{p.fullName}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-2 text-body-sm">
                  <div>
                    <dt className="text-surface-fg-muted">Dimensions</dt>
                    <dd className="font-medium">
                      {p.dimensions.widthPx}×{p.dimensions.heightPx} px
                    </dd>
                  </div>
                  <div>
                    <dt className="text-surface-fg-muted">File size</dt>
                    <dd className="font-medium">
                      {p.kbRange.min === 0
                        ? `≤ ${p.kbRange.max} KB`
                        : `${p.kbRange.min}–${p.kbRange.max} KB`}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
