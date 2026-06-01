import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { fmt } from "@/i18n/format";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { compressPresets, getCompressPreset } from "@/lib/presets/compress-sizes";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ImageCompressForm } from "../image-compress-form";

export function generateStaticParams() {
  return compressPresets.map((p) => ({ size: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const preset = getCompressPreset(size);
  if (!preset) return { title: "Not found" };
  return {
    title: `Compress Image to ${preset.label}`,
    description: `Compress any image to ${preset.label} (±${preset.toleranceKb} KB) for portal upload. Runs in your browser.`,
    alternates: { canonical: `/image-compress/${preset.slug}` },
  };
}

export default async function ImageCompressSizePage({ params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const preset = getCompressPreset(size);
  if (!preset) notFound();

  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  const title = fmt(dict.imageCompress.variant.titleTemplate, { label: preset.label });
  const subtitle = fmt(dict.imageCompress.variant.subtitleTemplate, {
    label: preset.label,
    tolerance: preset.toleranceKb,
  });

  const schemaName = `Compress Image to ${preset.label}`;
  const schemaDesc = `Compress any image to ${preset.label} (±${preset.toleranceKb} KB) for portal upload. Binary-search JPEG with auto-downscale. Runs in your browser.`;

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: schemaName,
          description: schemaDesc,
          path: `/image-compress/${preset.slug}`,
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Image Compressor", href: "/image-compress" },
            { label: preset.label },
          ],
          steps: [
            { name: "Upload an image", text: "JPG, PNG or WebP up to 25 MB." },
            { name: "Compress", text: `We binary-search JPEG quality to land near ${preset.label}.` },
            { name: "Download", text: "Save the JPG ready to upload." },
          ],
        })}
      />
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: dict.imageCompress.breadcrumb, href: "/image-compress" },
          { label: preset.label },
        ]}
      />
      <div className="mt-8">
        <ImageCompressForm
          targetKb={preset.targetKb}
          toleranceKb={preset.toleranceKb}
          targetLabel={preset.label}
          slug={preset.slug}
        />
      </div>
    </main>
  );
}
