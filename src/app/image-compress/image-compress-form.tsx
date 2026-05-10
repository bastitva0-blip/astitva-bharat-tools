"use client";

import { useEffect, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { NumberInput } from "@devalok/shilp-sutra/ui/number-input";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { compressImageToTargetKb, formatKb } from "@/lib/processing/image";

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

interface RunResult {
  url: string;
  bytes: number;
  width: number;
  height: number;
  hitTarget: boolean;
}

export function ImageCompressForm({ targetKb, toleranceKb, targetLabel, slug }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customKb, setCustomKb] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const isCustom = targetKb === undefined;
  const activeKb = isCustom ? customKb : targetKb;
  const activeTolerance =
    toleranceKb ?? Math.max(1, Math.round(activeKb * 0.05));
  const activeLabel = targetLabel ?? formatTargetLabel(activeKb);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  const compress = async () => {
    if (!file) {
      toast.error("Upload an image first.");
      return;
    }
    if (activeKb < 1) {
      toast.error("Target must be at least 1 KB.");
      return;
    }
    setSubmitting(true);
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    try {
      const r = await compressImageToTargetKb(file, {
        targetKb: activeKb,
        toleranceKb: activeTolerance,
      });
      setResult({
        url: URL.createObjectURL(r.blob),
        bytes: r.bytes,
        width: r.width,
        height: r.height,
        hitTarget: r.hitTarget,
      });
      if (r.hitTarget) {
        toast.success(`Compressed to ${formatKb(r.bytes)}.`);
      } else if (r.bytes <= activeKb * 1024) {
        toast.success(`Saved at ${formatKb(r.bytes)} - under target.`);
      } else {
        toast.error(`Could not hit ${activeLabel} - closest was ${formatKb(r.bytes)}.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to compress image.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadName = `bharattools-${slug}.jpg`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. Source image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="image/*"
            maxSize={25 * 1024 * 1024}
            onFiles={(files) => setFile(files[0] ?? null)}
            label="Drop an image here"
            sublabel="JPG, PNG or WebP up to 25MB"
          />

          {previewUrl && (
            <div className="flex items-start gap-3 rounded-md border border-surface-border-subtle p-3">
              <img
                src={previewUrl}
                alt="Source preview"
                className="h-28 w-28 rounded object-cover"
              />
              <div className="text-body-sm">
                <div className="font-medium">{file?.name}</div>
                <div className="text-surface-fg-muted">
                  {file ? formatKb(file.size) : null}
                </div>
                <Button
                  variant="ghost"
                  size="compact-sm"
                  className="mt-2"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {isCustom && (
            <div>
              <Label htmlFor="target" className="block mb-2">
                Target size (KB)
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
                Tolerance ±{activeTolerance} KB
              </p>
            </div>
          )}

          {!isCustom && (
            <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-3 text-body-sm">
              <span className="font-semibold">Target: {activeLabel}</span>
              <span className="text-surface-fg-muted"> · ±{activeTolerance} KB tolerance</span>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={!file || submitting}
            onClick={compress}
          >
            Compress to {activeLabel}
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>2. Result</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="rounded-md border border-surface-fg bg-surface-2 p-4">
                <img
                  src={result.url}
                  alt="Compressed result"
                  className="mx-auto block max-h-[60vh] w-auto"
                />
              </div>
              <ResultStats
                originalBytes={file?.size ?? 0}
                resultBytes={result.bytes}
                targetKb={activeKb}
                toleranceKb={activeTolerance}
                width={result.width}
                height={result.height}
              />
              <Button asChild variant="solid" fullWidth size="lg">
                <a href={result.url} download={downloadName}>
                  Download JPG
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Compress an image to see the result here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
  const targetBytes = targetKb * 1024;
  const minBytes = Math.max(0, (targetKb - toleranceKb) * 1024);
  const overLimit = resultBytes > targetBytes;
  const inBand = resultBytes >= minBytes && resultBytes <= targetBytes;
  let status: { label: string; cls: string };
  if (inBand) status = { label: "Within target band", cls: "text-success-11" };
  else if (overLimit) status = { label: `Over ${targetKb} KB limit`, cls: "text-error-11" };
  else status = { label: "Under target · safe to upload", cls: "text-success-11" };

  const reduction = originalBytes > 0 ? ((1 - resultBytes / originalBytes) * 100).toFixed(0) : null;

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
          From {formatKb(originalBytes)}
          {reduction && Number(reduction) > 0 ? ` - ${reduction}% smaller` : ""}.
        </p>
      )}
    </div>
  );
}

function formatTargetLabel(kb: number): string {
  if (kb >= 1024 && kb % 1024 === 0) return `${kb / 1024} MB`;
  return `${kb} KB`;
}
