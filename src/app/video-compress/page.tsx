import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { videoCompressPresets } from "@/lib/presets/compress-sizes-video";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Video Compressor",
  description:
    "Compress any video to an exact MB target - 10 MB, 25 MB, 50 MB, 100 MB, or custom. Runs in your browser.",
  alternates: { canonical: "/video-compress" },
};

export default async function VideoCompressHubPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Video Compressor" }]),
          collectionPageSchema({
            name: "Video Compressor",
            description:
              "Compress videos to exact MB targets - 10, 25, 50, 100 MB, or any custom value.",
            path: "/video-compress",
            items: [
              ...videoCompressPresets.map((p) => ({
                name: `Compress Video to ${p.label}`,
                path: `/video-compress/${p.slug}`,
              })),
              { name: "Compress Video to Custom MB", path: "/video-compress/custom" },
            ],
          }),
        ]}
      />
      <PageHeader
        title={dict.videoCompress.title}
        subtitle={dict.videoCompress.subtitle}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: dict.videoCompress.breadcrumb }]}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videoCompressPresets.map((p) => (
          <Link key={p.slug} href={`/video-compress/${p.slug}`} className="block">
            <Card variant="outline" interactive className="h-full">
              <CardHeader>
                <CardTitle>{p.label}</CardTitle>
                <CardDescription>Under {p.label}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        <Link href="/video-compress/custom" className="block">
          <Card variant="outline" interactive className="h-full">
            <CardHeader>
              <CardTitle>Custom MB</CardTitle>
              <CardDescription>Enter any target in megabytes.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </section>
    </main>
  );
}
