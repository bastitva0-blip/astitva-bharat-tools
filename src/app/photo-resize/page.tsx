import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { examPresets } from "@/lib/presets/exams";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Exam Photo Resizer",
  description: "Pick your exam and get a portal-ready photo with the exact pixel and KB spec.",
  alternates: { canonical: "/photo-resize" },
};

export default async function PhotoResizeHubPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Exam Photo Resizer" }]),
          collectionPageSchema({
            name: "Exam Photo Resizer",
            description:
              "Per-exam photo resizers - pixel and KB spec for UPSC, SSC, NEET, IBPS, RRB, JEE, State PSC, Police, SBI.",
            path: "/photo-resize",
            items: examPresets.map((p) => ({
              name: `${p.name} Photo Resizer`,
              path: `/photo-resize/${p.slug}`,
            })),
          }),
        ]}
      />
      <PageHeader
        title={dict.photoResize.title}
        subtitle={dict.photoResize.subtitle}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: dict.photoResize.breadcrumb }]}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {examPresets.map((p) => (
          <Link key={p.slug} href={`/photo-resize/${p.slug}`} className="block">
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
                      {p.kbRange.min}–{p.kbRange.max} KB
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
