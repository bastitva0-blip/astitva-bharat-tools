import { notFound } from "next/navigation";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { examPresets, getExamPreset } from "@/lib/presets/exams";
import { PhotoResizeForm } from "./photo-resize-form";

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
        <Card variant="outline" className="h-fit">
          <CardHeader>
            <CardTitle>Spec</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-body-sm">
              <SpecRow label="Exam">{preset.fullName}</SpecRow>
              <SpecRow label="Dimensions">
                {preset.dimensions.widthPx}×{preset.dimensions.heightPx} px
                {preset.dimensions.widthCm && (
                  <span className="block text-surface-fg-muted">
                    ≈ {preset.dimensions.widthCm}×{preset.dimensions.heightCm} cm
                  </span>
                )}
              </SpecRow>
              <SpecRow label="File size">
                {preset.kbRange.min}–{preset.kbRange.max} KB
              </SpecRow>
              <SpecRow label="Format">JPG, white background</SpecRow>
              {preset.notes && (
                <li className="list-none">
                  <div className="text-surface-fg-muted">Notes</div>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {preset.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </li>
              )}
              {preset.portalUrl && (
                <li className="list-none">
                  <a
                    href={preset.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent-11 hover:text-accent-12"
                  >
                    Official portal ↗
                  </a>
                </li>
              )}
            </dl>
          </CardContent>
        </Card>

        <PhotoResizeForm preset={preset} />
      </section>
    </main>
  );
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="list-none">
      <div className="text-surface-fg-muted">{label}</div>
      <div className="font-medium">{children}</div>
    </li>
  );
}
