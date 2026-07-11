import Link from "next/link";
import { Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { SimpleTooltip } from "@devalok/shilp-sutra/composed/simple-tooltip";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { compressPresets } from "@/lib/presets/compress-sizes";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Image Compressor",
  description:
    "Compress any image to an exact KB target - 20 KB, 50 KB, 200 KB, custom. Hits within ±5 KB of your goal.",
  alternates: { canonical: "/image-compress" },
};

export default async function ImageCompressHubPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Image Compressor" }]),
          collectionPageSchema({
            name: "Image Compressor",
            description:
              "Compress images to exact KB targets - 20, 50, 100, 200, 500 KB, 1 MB, 2 MB, or any custom value.",
            path: "/image-compress",
            items: [
              ...compressPresets.map((p) => ({
                name: `Compress Image to ${p.label}`,
                path: `/image-compress/${p.slug}`,
              })),
              { name: "Compress Image to Custom KB", path: "/image-compress/custom" },
            ],
          }),
        ]}
      />
      <PageHeader
        title={dict.imageCompress.title}
        subtitle={dict.imageCompress.subtitle}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: dict.imageCompress.breadcrumb }]}
      />

      <p className="mt-4 text-body-sm text-surface-fg-muted">
        {dict.imageCompress.disambiguation}{" "}
        <Link href="/photo-resize" className="font-medium text-accent-11 underline underline-offset-2">
          Go to Exam Photo Resizer →
        </Link>
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {compressPresets.map((p) => (
          <Link key={p.slug} href={`/image-compress/${p.slug}`} className="block">
            <Card variant="outline" interactive className="h-full">
              <CardHeader>
                <CardTitle>{p.label}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  Tolerance ±{p.toleranceKb} KB
                  <SimpleTooltip content={dict.imageCompress.toleranceHint}>
                    <span tabIndex={0} className="inline-flex">
                      <Info className="size-3.5 text-surface-fg-muted" aria-hidden />
                      <span className="sr-only">What does tolerance mean?</span>
                    </span>
                  </SimpleTooltip>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        <Link href="/image-compress/custom" className="block">
          <Card variant="outline" interactive className="h-full">
            <CardHeader>
              <CardTitle>Custom KB</CardTitle>
              <CardDescription>Enter any target in kilobytes.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </section>
    </main>
  );
}
