import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { compressPresets } from "@/lib/presets/compress-sizes";

export const metadata = {
  title: "Image Compressor · BharatTools",
  description:
    "Compress any image to an exact KB target — 20 KB, 50 KB, 200 KB, custom. Hits within ±5 KB of your goal.",
};

export default function ImageCompressHubPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
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
