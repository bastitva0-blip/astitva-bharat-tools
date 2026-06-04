"use client";

import { useState } from "react";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { CompressToTargetShell } from "@/components/tool-shells";
import { fmt } from "@/i18n/format";
import { useT } from "@/i18n/provider";
import { formatKb } from "@/lib/processing/image";
import { compressPdf, type CompressPreset } from "@/lib/processing/pdf-compress";
import { getToolBySlug } from "@/lib/tools";

interface CompressPdfResult {
  blob: Blob;
  bytes: number;
  imagesRecompressed: number;
  imagesSkipped: number;
}

export function PdfCompressForm() {
  const dict = useT();
  const t = dict.forms.pdfCompress;
  const [preset, setPreset] = useState<CompressPreset>("recommended");

  const tool = getToolBySlug("pdf-compress");
  if (!tool) throw new Error("pdf-compress tool missing from registry");

  const onProcess = async (file: File): Promise<CompressPdfResult> => {
    const r = await compressPdf(file, { preset });
    const blob = new Blob([new Uint8Array(r.bytes)], { type: "application/pdf" });

    // Per-tool success toasts — outcome-specific copy lives here, not in the
    // shell. The shell only owns the generic error toast.
    const saved = r.originalBytes - r.resultBytes;
    if (saved > 0) {
      const pct = Math.round((saved / r.originalBytes) * 100);
      toast.success(fmt(t.toasts.compressedTemplate, { pct, saved: formatKb(saved) }));
    } else {
      toast.success(t.toasts.alreadyOptimised);
    }

    return {
      blob,
      bytes: r.resultBytes,
      imagesRecompressed: r.imagesRecompressed,
      imagesSkipped: r.imagesSkipped,
    };
  };

  return (
    <CompressToTargetShell<CompressPdfResult>
      tool={tool}
      accept="application/pdf,.pdf"
      maxBytes={50 * 1024 * 1024}
      dropLabel={t.source.dropLabel}
      dropSublabel={t.source.dropSublabel}
      sourceTitle={t.source.title}
      resultTitle={t.result.title}
      emptyState={t.result.emptyState}
      submitLabel={t.submit}
      outputType="application/pdf"
      outputFilename={(file) => `${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`}
      onProcess={onProcess}
      configSlot={
        <div className="space-y-2">
          <Label className="block">{t.strength.label}</Label>
          <SegmentedControl
            size="md"
            variant="default"
            options={[
              { id: "light", text: t.strength.light },
              { id: "recommended", text: t.strength.recommended },
              { id: "stronger", text: t.strength.stronger },
            ]}
            selectedId={preset}
            onSelect={(id) => setPreset(id as CompressPreset)}
          />
          <p className="text-body-xs text-surface-fg-muted">
            {preset === "light" && t.strength.lightDesc}
            {preset === "recommended" && t.strength.recommendedDesc}
            {preset === "stronger" && t.strength.strongerDesc}
          </p>
        </div>
      }
      renderPreview={(result) => (
        <iframe
          title={t.result.previewTitle}
          src={result.url}
          className="h-[60vh] w-full rounded-md border border-surface-fg bg-surface-2"
        />
      )}
      renderStats={(result, source) => (
        <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-4 text-body-sm">
          <div className="flex items-center justify-between font-semibold">
            <span>From {formatKb(source.bytes)}</span>
            <span>→ {formatKb(result.bytes)}</span>
          </div>
          <p className="mt-1 text-surface-fg-muted">
            {result.imagesRecompressed > 0
              ? result.imagesRecompressed === 1
                ? t.result.imagesReencodedOne
                : fmt(t.result.imagesReencodedTemplate, { n: result.imagesRecompressed })
              : t.result.noJpegs}
            {result.imagesSkipped > 0
              ? fmt(t.result.skippedTemplate, { n: result.imagesSkipped })
              : ""}
          </p>
        </div>
      )}
    />
  );
}
