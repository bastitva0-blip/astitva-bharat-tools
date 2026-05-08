import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import type { PhotoSpecPreset } from "@/lib/presets/photo-spec";

interface Props {
  preset: PhotoSpecPreset;
  /** Label for the row that shows the full name (e.g. "Exam", "Document"). */
  entityLabel: string;
}

export function PhotoSpecCard({ preset, entityLabel }: Props) {
  return (
    <Card variant="outline" className="h-fit">
      <CardHeader>
        <CardTitle>Spec</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-body-sm">
          <SpecRow label={entityLabel}>{preset.fullName}</SpecRow>
          <SpecRow label="Dimensions">
            {preset.dimensions.widthPx}×{preset.dimensions.heightPx} px
            {preset.dimensions.widthCm && (
              <span className="block text-surface-fg-muted">
                ≈ {preset.dimensions.widthCm}×{preset.dimensions.heightCm} cm
              </span>
            )}
          </SpecRow>
          <SpecRow label="File size">
            {preset.kbRange.min === 0
              ? `up to ${preset.kbRange.max} KB`
              : `${preset.kbRange.min}–${preset.kbRange.max} KB`}
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
