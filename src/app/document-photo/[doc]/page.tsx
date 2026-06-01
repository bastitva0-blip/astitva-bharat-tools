import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { PhotoSpecCard } from "@/components/photo-spec-card";
import { PhotoSpecForm } from "@/components/photo-spec-form";
import { fmt } from "@/i18n/format";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
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

  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  const dims = `${preset.dimensions.widthPx}×${preset.dimensions.heightPx}`;
  const sizeText =
    preset.kbRange.min === 0
      ? `≤ ${preset.kbRange.max} KB`
      : `${preset.kbRange.min}–${preset.kbRange.max} KB`;

  const title = fmt(dict.documentPhoto.variant.titleTemplate, { name: preset.name });
  const subtitle =
    preset.kbRange.min === 0
      ? fmt(dict.documentPhoto.variant.subtitleMaxTemplate, {
          fullName: preset.fullName,
          dimensions: dims,
          maxKb: preset.kbRange.max,
        })
      : fmt(dict.documentPhoto.variant.subtitleRangeTemplate, {
          fullName: preset.fullName,
          dimensions: dims,
          minKb: preset.kbRange.min,
          maxKb: preset.kbRange.max,
        });
  const ctaLabel = fmt(dict.documentPhoto.variant.ctaTemplate, { name: preset.name });

  const schemaName = `${preset.name} Photo Maker`;
  const schemaDesc = `Make a portal-ready photo for ${preset.fullName}: ${dims} px JPG, ${sizeText}, white background. Runs in your browser.`;

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: schemaName,
          description: schemaDesc,
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
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: dict.documentPhoto.breadcrumb, href: "/document-photo" },
          { label: preset.name },
        ]}
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <PhotoSpecCard preset={preset} entityLabel={dict.documentPhoto.variant.entityLabel} />
        <PhotoSpecForm preset={preset} downloadSlug={preset.slug} ctaLabel={ctaLabel} />
      </section>
    </main>
  );
}
