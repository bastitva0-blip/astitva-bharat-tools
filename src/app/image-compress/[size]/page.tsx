import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { compressPresets, getCompressPreset } from "@/lib/presets/compress-sizes";
import { ImageCompressForm } from "../image-compress-form";

export function generateStaticParams() {
  return compressPresets.map((p) => ({ size: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const preset = getCompressPreset(size);
  if (!preset) return { title: "Not found · BharatTools" };
  return {
    title: `Compress Image to ${preset.label} · BharatTools`,
    description: `Compress any image to ${preset.label} (±${preset.toleranceKb} KB) for portal upload. Runs in your browser.`,
  };
}

export default async function ImageCompressSizePage({ params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const preset = getCompressPreset(size);
  if (!preset) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title={`Compress Image to ${preset.label}`}
        subtitle={`Hit ${preset.label} within ±${preset.toleranceKb} KB. JPG output, runs in your browser.`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Image Compressor", href: "/image-compress" },
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
