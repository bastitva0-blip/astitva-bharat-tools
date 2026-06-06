import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { PhotoSpecForm } from "@/components/photo-spec-form";
import { fmt } from "@/i18n/format";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { examPresets, getExamPreset } from "@/lib/presets/exams";
import { toolPageSchema } from "@/lib/seo/tool-schema";

export function generateStaticParams() {
  return examPresets.map((p) => ({ exam: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ exam: string }> }) {
  const { exam } = await params;
  const preset = getExamPreset(exam);
  if (!preset) return { title: "Not found" };
  return {
    title: `${preset.name} Photo Resizer`,
    description: `Resize and compress a photo for the ${preset.fullName} portal: ${preset.dimensions.widthPx}×${preset.dimensions.heightPx} px, ${preset.kbRange.min}–${preset.kbRange.max} KB JPG with white background.`,
    alternates: { canonical: `/photo-resize/${preset.slug}` },
  };
}

export default async function PhotoResizeExamPage({ params }: { params: Promise<{ exam: string }> }) {
  const { exam } = await params;
  const preset = getExamPreset(exam);
  if (!preset) notFound();

  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  const dims = `${preset.dimensions.widthPx}×${preset.dimensions.heightPx}`;
  const kb = `${preset.kbRange.min}–${preset.kbRange.max}`;

  const title = fmt(dict.photoResize.variant.titleTemplate, { name: preset.name });
  const subtitle = fmt(dict.photoResize.variant.subtitleTemplate, {
    dimensions: dims,
    kbRange: kb,
  });

  // Schema/JSON-LD intentionally stays in English — search engines index the
  // canonical URL and structured data should match it.
  const schemaName = `${preset.name} Photo Resizer`;
  const schemaDesc = `Resize and compress a photo for ${preset.fullName}: ${dims} px, ${kb} KB JPG with white background. Runs in your browser.`;

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: schemaName,
          description: schemaDesc,
          path: `/photo-resize/${preset.slug}`,
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Exam Photo Resizer", href: "/photo-resize" },
            { label: preset.name },
          ],
          steps: [
            { name: "Upload a portrait", text: "Drop a JPG or PNG of your face." },
            { name: "Adjust the crop", text: "Drag the corners. Aspect is locked to the spec." },
            { name: "Generate", text: "We resize, white-background and KB-compress the image." },
            { name: "Download", text: "Save the JPG and upload it to the portal." },
          ],
        })}
      />
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: dict.photoResize.breadcrumb, href: "/photo-resize" },
          { label: preset.name },
        ]}
      />

      <section className="mt-8">
        <PhotoSpecForm preset={preset} downloadSlug={preset.slug} />
      </section>
    </main>
  );
}
