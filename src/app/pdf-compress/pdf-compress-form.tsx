"use client";

import { useEffect, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
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
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<CompressPreset>("recommended");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  const run = async () => {
    if (!file) {
      toast.error("Upload a PDF first.");
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
        toast.success(`Compressed by ${pct}% - ${formatKb(saved)} smaller.`);
      } else {
        toast.success("PDF was already well-optimised - no further saving.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to compress PDF.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadName = file ? file.name.replace(/\.pdf$/i, "") + "-compressed.pdf" : "compressed.pdf";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. Source PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="application/pdf,.pdf"
            maxSize={50 * 1024 * 1024}
            onFiles={(files) => setFile(files[0] ?? null)}
            label="Drop a PDF here"
            sublabel="Up to 50 MB. Works best on PDFs with embedded photos."
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
                  Remove
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="block">Compression strength</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                { id: "light", text: "Light" },
                { id: "recommended", text: "Recommended" },
                { id: "stronger", text: "Stronger" },
              ]}
              selectedId={preset}
              onSelect={(id) => setPreset(id as CompressPreset)}
            />
            <p className="text-body-xs text-surface-fg-muted">
              {preset === "light" && "Keeps photo quality almost untouched. Smallest savings."}
              {preset === "recommended" && "Balanced - re-encodes photos at 72% quality, caps at 1500 px."}
              {preset === "stronger" && "Most savings. Re-encodes at 55% quality, caps at 1000 px - some blur on photos."}
            </p>
          </div>

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={!file || submitting}
            onClick={run}
          >
            Compress PDF
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
              <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-4 text-body-sm">
                <div className="flex items-center justify-between font-semibold">
                  <span>From {formatKb(result.originalBytes)}</span>
                  <span>→ {formatKb(result.resultBytes)}</span>
                </div>
                <p className="mt-1 text-surface-fg-muted">
                  {result.imagesRecompressed > 0
                    ? `${result.imagesRecompressed} image${result.imagesRecompressed === 1 ? "" : "s"} re-encoded`
                    : "No re-encodable JPEGs found"}
                  {result.imagesSkipped > 0
                    ? ` · ${result.imagesSkipped} skipped (already small)`
                    : ""}
                </p>
              </div>
              <iframe
                title="Compressed PDF preview"
                src={result.url}
                className="h-[60vh] w-full rounded-md border border-surface-fg bg-surface-2"
              />
              <Button asChild variant="solid" fullWidth size="lg">
                <a href={result.url} download={downloadName}>
                  Download compressed PDF
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Compress a PDF to see the result here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
