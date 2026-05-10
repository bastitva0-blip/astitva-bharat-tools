import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { compressPresets } from "@/lib/presets/compress-sizes";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Image Compressor",
  description:
    "Compress any image to an exact KB target - 20 KB, 50 KB, 200 KB, custom. Hits within ±5 KB of your goal.",
  alternates: { canonical: "/image-compress" },
};

export default function ImageCompressHubPage() {
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
        title="Image Compressor"
        subtitle="Hit an exact KB target. Government portals reject anything over the limit, so 'approximate' won't do."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Image Compressor" }]}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {compressPresets.map((p) => (
          <Link key={p.slug} href={`/image-compress/${p.slug}`} className="block">
            <Card variant="outline" interactive className="h-full">
              <CardHeader>
                <CardTitle>{p.label}</CardTitle>
                <CardDescription>Tolerance ±{p.toleranceKb} KB</CardDescription>
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
