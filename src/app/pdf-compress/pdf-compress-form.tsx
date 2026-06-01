"use client";

import { useEffect, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fmt } from "@/i18n/format";
import { useT } from "@/i18n/provider";
import { formatKb } from "@/lib/processing/image";
import { compressPdf, type CompressPreset } from "@/lib/processing/pdf-compress";

interface RunResult {
  url: string;
  resultBytes: number;
  originalBytes: number;
  imagesRecompressed: number;
  imagesSkipped: number;
}

export function PdfCompressForm() {
  const dict = useT();
  const t = dict.forms.pdfCompress;
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<CompressPreset>("recommended");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  const run = async () => {
    if (!file) {
      toast.error(t.errors.noFile);
      return;
    }
    setSubmitting(true);
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    try {
      const r = await compressPdf(file, { preset });
      const blob = new Blob([new Uint8Array(r.bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResult({
        url,
        resultBytes: r.resultBytes,
        originalBytes: r.originalBytes,
        imagesRecompressed: r.imagesRecompressed,
        imagesSkipped: r.imagesSkipped,
      });
      const saved = r.originalBytes - r.resultBytes;
      if (saved > 0) {
        const pct = Math.round((saved / r.originalBytes) * 100);
        toast.success(fmt(t.toasts.compressedTemplate, { pct, saved: formatKb(saved) }));
      } else {
        toast.success(t.toasts.alreadyOptimised);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.compressFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadName = file ? file.name.replace(/\.pdf$/i, "") + "-compressed.pdf" : "compressed.pdf";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>{t.source.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="application/pdf,.pdf"
            maxSize={50 * 1024 * 1024}
            onFiles={(files) => setFile(files[0] ?? null)}
            label={t.source.dropLabel}
            sublabel={t.source.dropSublabel}
          />

          {file && (
            <div className="flex items-start gap-3 rounded-md border border-surface-border-subtle p-3">
              <div className="text-body-sm">
                <div className="font-medium">{file.name}</div>
                <div className="text-surface-fg-muted">{formatKb(file.size)}</div>
                <Button
                  variant="ghost"
                  size="compact-sm"
                  className="mt-2"
                  onClick={() => setFile(null)}
                >
                  {dict.common.remove}
                </Button>
              </div>
            </div>
          )}

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

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={!file || submitting}
            onClick={run}
          >
            {t.submit}
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>{t.result.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-4 text-body-sm">
                <div className="flex items-center justify-between font-semibold">
                  <span>From {formatKb(result.originalBytes)}</span>
                  <span>→ {formatKb(result.resultBytes)}</span>
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
              <iframe
                title={t.result.previewTitle}
                src={result.url}
                className="h-[60vh] w-full rounded-md border border-surface-fg bg-surface-2"
              />
              <Button asChild variant="solid" fullWidth size="lg">
                <a href={result.url} download={downloadName}>
                  {t.result.downloadCta}
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              {t.result.emptyState}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
