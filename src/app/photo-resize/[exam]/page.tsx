import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { PhotoSpecCard } from "@/components/photo-spec-card";
import { PhotoSpecForm } from "@/components/photo-spec-form";
import { examPresets, getExamPreset } from "@/lib/presets/exams";

export function generateStaticParams() {
  return examPresets.map((p) => ({ exam: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ exam: string }> }) {
  const { exam } = await params;
  const preset = getExamPreset(exam);
  if (!preset) return { title: "Not found · BharatTools" };
  return {
    title: `${preset.name} Photo Resizer · BharatTools`,
    description: `Resize and compress a photo for the ${preset.fullName} portal: ${preset.dimensions.widthPx}×${preset.dimensions.heightPx} px, ${preset.kbRange.min}–${preset.kbRange.max} KB JPG with white background.`,
  };
}

export default async function PhotoResizeExamPage({ params }: { params: Promise<{ exam: string }> }) {
  const { exam } = await params;
  const preset = getExamPreset(exam);
  if (!preset) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title={`${preset.name} Photo Resizer`}
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
