import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { PhotoSpecCard } from "@/components/photo-spec-card";
import { PhotoSpecForm } from "@/components/photo-spec-form";
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

  const toolName = `${preset.name} Photo Resizer`;
  const toolDesc = `Resize and compress a photo for ${preset.fullName}: ${preset.dimensions.widthPx}×${preset.dimensions.heightPx} px, ${preset.kbRange.min}–${preset.kbRange.max} KB JPG with white background. Runs in your browser.`;

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: toolName,
          description: toolDesc,
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
        title={toolName}
        subtitle={`Upload a photo and get a ready-to-upload ${preset.dimensions.widthPx}×${preset.dimensions.heightPx} px JPG (${preset.kbRange.min}–${preset.kbRange.max} KB).`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Exam Photo Resizer", href: "/photo-resize" },
          { label: preset.name },
        ]}
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <PhotoSpecCard preset={preset} entityLabel="Exam" />
        <PhotoSpecForm preset={preset} downloadSlug={preset.slug} />
      </section>
    </main>
  );
}
