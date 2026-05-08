import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { PhotoSpecCard } from "@/components/photo-spec-card";
import { PhotoSpecForm } from "@/components/photo-spec-form";
import { documentPresets, getDocumentPreset } from "@/lib/presets/documents";
import { toolPageSchema } from "@/lib/seo/tool-schema";

export function generateStaticParams() {
  return documentPresets.map((p) => ({ doc: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const preset = getDocumentPreset(doc);
  if (!preset) return { title: "Not found" };
  return {
    title: `${preset.name} Photo Maker`,
    description: `Make a photo for ${preset.fullName}: ${preset.dimensions.widthPx}×${preset.dimensions.heightPx} px JPG, ${
      preset.kbRange.min === 0 ? `up to ${preset.kbRange.max} KB` : `${preset.kbRange.min}–${preset.kbRange.max} KB`
    }, white background.`,
    alternates: { canonical: `/document-photo/${preset.slug}` },
  };
}

export default async function DocumentPhotoPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const preset = getDocumentPreset(doc);
  if (!preset) notFound();

  const toolName = `${preset.name} Photo Maker`;
  const sizeText =
    preset.kbRange.min === 0
      ? `≤ ${preset.kbRange.max} KB`
      : `${preset.kbRange.min}–${preset.kbRange.max} KB`;
  const toolDesc = `Make a portal-ready photo for ${preset.fullName}: ${preset.dimensions.widthPx}×${preset.dimensions.heightPx} px JPG, ${sizeText}, white background. Runs in your browser.`;

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: toolName,
          description: toolDesc,
          path: `/document-photo/${preset.slug}`,
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Document Photo Maker", href: "/document-photo" },
            { label: preset.name },
          ],
          steps: [
            { name: "Upload a portrait", text: "Drop a JPG or PNG of your face." },
            { name: "Adjust the crop", text: "Drag the corners. Aspect is locked to the spec." },
            { name: "Generate", text: `We resize, white-background and KB-compress to ${sizeText}.` },
            { name: "Download", text: "Save the JPG and submit it to the portal." },
          ],
        })}
      />
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
