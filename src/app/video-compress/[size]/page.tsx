import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { fmt } from "@/i18n/format";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { getVideoCompressPreset, videoCompressPresets } from "@/lib/presets/compress-sizes-video";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { VideoCompressForm } from "../video-compress-form";

export function generateStaticParams() {
  return videoCompressPresets.map((p) => ({ size: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const preset = getVideoCompressPreset(size);
  if (!preset) return { title: "Not found" };
  return {
    title: `Compress Video to ${preset.label}`,
    description: `Compress any video to under ${preset.label} for portal or WhatsApp upload. Runs in your browser.`,
    alternates: { canonical: `/video-compress/${preset.slug}` },
  };
}

export default async function VideoCompressSizePage({ params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const preset = getVideoCompressPreset(size);
  if (!preset) notFound();

  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  const title = fmt(dict.videoCompress.variant.titleTemplate, { label: preset.label });
  const subtitle = fmt(dict.videoCompress.variant.subtitleTemplate, { label: preset.label });

  const schemaName = `Compress Video to ${preset.label}`;
  const schemaDesc = `Compress any video to under ${preset.label} for portal or WhatsApp upload. Bitrate-search MP4 encode via WebCodecs. Runs in your browser.`;

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: schemaName,
          description: schemaDesc,
          path: `/video-compress/${preset.slug}`,
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Video Compressor", href: "/video-compress" },
            { label: preset.label },
          ],
          steps: [
            { name: "Upload a video", text: "MP4, WebM, MOV or MKV." },
            { name: "Compress", text: `We search encode bitrate to land at or under ${preset.label}.` },
            { name: "Download", text: "Save the MP4 ready to send." },
          ],
        })}
      />
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: dict.videoCompress.breadcrumb, href: "/video-compress" },
          { label: preset.label },
        ]}
      />
      <div className="mt-8">
        <VideoCompressForm targetMb={preset.targetMb} targetLabel={preset.label} slug={preset.slug} />
      </div>
    </main>
  );
}
