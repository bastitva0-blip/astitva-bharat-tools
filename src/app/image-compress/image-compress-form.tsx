"use client";

import { useState } from "react";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { NumberInput } from "@devalok/shilp-sutra/ui/number-input";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { CompressToTargetShell } from "@/components/tool-shells";
import { fire } from "@/lib/analytics";
import { fmt } from "@/i18n/format";
import { useT } from "@/i18n/provider";
import { compressImageToTargetKb, formatKb } from "@/lib/processing/image";
import { getToolBySlug } from "@/lib/tools";

interface Props {
  /** Fixed target in KB. If omitted, the form shows a custom NumberInput. */
  targetKb?: number;
  /** Tolerance in KB. Defaults to 5% of the chosen target with a 1 KB floor. */
  toleranceKb?: number;
  /** Display label for the active target - e.g. "50 KB". */
  targetLabel?: string;
  /** Slug for filename and tracking. */
  slug: string;
}

interface CompressResult {
  blob: Blob;
  bytes: number;
  width: number;
  height: number;
  hitTarget: boolean;
}

export function ImageCompressForm({ targetKb, toleranceKb, targetLabel, slug }: Props) {
  const dict = useT();
  const t = dict.forms.imageCompress;

  const [customKb, setCustomKb] = useState<number>(50);

  const isCustom = targetKb === undefined;
  const activeKb = isCustom ? customKb : targetKb;
  const activeTolerance = toleranceKb ?? Math.max(1, Math.round(activeKb * 0.05));
  const activeLabel = targetLabel ?? formatTargetLabel(activeKb);

  // The shell needs a Tool registry entry. image-compress hub + size variants
  // + custom all share the same slug-level registry record.
  const tool = getToolBySlug("image-compress");
  if (!tool) {
    throw new Error("image-compress tool missing from registry");
  }

  const onProcess = async (file: File): Promise<CompressResult> => {
    if (activeKb < 1) {
      toast.error(t.errors.targetTooSmall);
      throw new Error(t.errors.targetTooSmall);
    }
    const r = await compressImageToTargetKb(file, {
      targetKb: activeKb,
      toleranceKb: activeTolerance,
    });

    // Per-tool success/warning toasts — outcome-specific copy lives here, not
    // in the shell. The shell only owns the generic error toast.
    if (r.hitTarget) {
      toast.success(fmt(t.toasts.compressedTemplate, { size: formatKb(r.bytes) }));
    } else if (r.bytes <= activeKb * 1024) {
      toast.success(fmt(t.toasts.underTargetTemplate, { size: formatKb(r.bytes) }));
    } else {
      toast.error(
        fmt(t.errors.missedTargetTemplate, { target: activeLabel, result: formatKb(r.bytes) }),
      );
      fire("spec_missed", { tool_id: tool.slug, preset: slug, reason: "kb_over_target" });
    }

    return r;
  };

  return (
    <CompressToTargetShell<CompressResult>
      tool={tool}
      accept="image/*"
      maxBytes={25 * 1024 * 1024}
      dropLabel={t.source.dropLabel}
      dropSublabel={t.source.dropSublabel}
      sourceTitle={t.card1Title}
      resultTitle={t.card2Title}
      emptyState={t.result.emptyState}
      submitLabel={fmt(t.submitTemplate, { target: activeLabel })}
      outputType="image/jpeg"
      outputFilename={() => `bharattools-${slug}.jpg`}
      canSubmit={activeKb >= 1}
      onProcess={onProcess}
      configSlot={
        <>
          {isCustom && (
            <div>
              <Label htmlFor="target" className="block mb-2">
                {t.target.label}
              </Label>
              <NumberInput
                id="target"
                value={customKb}
                onValueChange={setCustomKb}
                min={1}
                max={5000}
                step={1}
              />
              <p className="mt-1 text-body-xs text-surface-fg-muted">
                {fmt(t.target.toleranceTemplate, { kb: activeTolerance })}
              </p>
            </div>
          )}
          {!isCustom && (
            <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-3 text-body-sm">
              <span className="font-semibold">
                {t.target.fixedLabel}: {activeLabel}
              </span>
              <span className="text-surface-fg-muted">
                {fmt(t.target.fixedToleranceTemplate, { kb: activeTolerance })}
              </span>
            </div>
          )}
        </>
      }
      renderPreview={(result) => (
        <div className="rounded-md border border-surface-fg bg-surface-2 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
          <img
            src={result.url}
            alt={t.result.alt}
            className="mx-auto block max-h-[60vh] max-w-full w-auto"
          />
        </div>
      )}
      renderStats={(result, source) => (
        <ResultStats
          originalBytes={source.bytes}
          resultBytes={result.bytes}
          targetKb={activeKb}
          toleranceKb={activeTolerance}
          width={result.width}
          height={result.height}
        />
      )}
    />
  );
}

function ResultStats({
  originalBytes,
  resultBytes,
  targetKb,
  toleranceKb,
  width,
  height,
}: {
  originalBytes: number;
  resultBytes: number;
  targetKb: number;
  toleranceKb: number;
  width: number;
  height: number;
}) {
  const dict = useT();
  const t = dict.forms.imageCompress.result;
  const targetBytes = targetKb * 1024;
  const minBytes = Math.max(0, (targetKb - toleranceKb) * 1024);
  const overLimit = resultBytes > targetBytes;
  const inBand = resultBytes >= minBytes && resultBytes <= targetBytes;
  let status: { label: string; cls: string };
  if (inBand) status = { label: t.withinBand, cls: "text-success-11" };
  else if (overLimit)
    status = { label: fmt(t.overLimitTemplate, { kb: targetKb }), cls: "text-error-11" };
  else status = { label: t.underTarget, cls: "text-success-11" };

  const reduction =
    originalBytes > 0 ? ((1 - resultBytes / originalBytes) * 100).toFixed(0) : null;

  return (
    <div className="space-y-1 text-body-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold">
          {width}×{height} px · {formatKb(resultBytes)}
        </span>
        <span className={status.cls}>{status.label}</span>
      </div>
      {originalBytes > 0 && (
        <p className="text-surface-fg-muted">
          {fmt(t.fromTemplate, { size: formatKb(originalBytes) })}
          {reduction && Number(reduction) > 0
            ? fmt(t.reductionTemplate, { pct: reduction })
            : ""}
          .
        </p>
      )}
    </div>
  );
}

function formatTargetLabel(kb: number): string {
  if (kb >= 1024 && kb % 1024 === 0) return `${kb / 1024} MB`;
  return `${kb} KB`;
}
