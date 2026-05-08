import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { PhotoSpecCard } from "@/components/photo-spec-card";
import { PhotoSpecForm } from "@/components/photo-spec-form";
import { documentPresets, getDocumentPreset } from "@/lib/presets/documents";

export function generateStaticParams() {
  return documentPresets.map((p) => ({ doc: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const preset = getDocumentPreset(doc);
  if (!preset) return { title: "Not found · BharatTools" };
  return {
    title: `${preset.name} Photo Maker · BharatTools`,
    description: `Make a photo for ${preset.fullName}: ${preset.dimensions.widthPx}×${preset.dimensions.heightPx} px JPG, ${
      preset.kbRange.min === 0 ? `up to ${preset.kbRange.max} KB` : `${preset.kbRange.min}–${preset.kbRange.max} KB`
    }, white background.`,
  };
}

export default async function DocumentPhotoPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const preset = getDocumentPreset(doc);
  if (!preset) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title={`${preset.name} Photo`}
        subtitle={`Upload a photo and get a ${preset.fullName} -ready ${preset.dimensions.widthPx}×${preset.dimensions.heightPx} px JPG (${
          preset.kbRange.min === 0 ? `≤ ${preset.kbRange.max} KB` : `${preset.kbRange.min}–${preset.kbRange.max} KB`
        }).`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Document Photo Maker", href: "/document-photo" },
          { label: preset.name },
        ]}
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <PhotoSpecCard preset={preset} entityLabel="Document" />
        <PhotoSpecForm
          preset={preset}
          downloadSlug={preset.slug}
          ctaLabel={`Generate ${preset.name} photo`}
        />
      </section>
    </main>
  );
}
