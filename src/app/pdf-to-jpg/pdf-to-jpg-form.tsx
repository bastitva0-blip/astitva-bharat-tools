"use client";

import { useEffect, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { durationBucket, fire, sizeBucket } from "@/lib/analytics";
import { useConsumePipelineFile, usePipeline } from "@/lib/pipeline";
import { formatKb } from "@/lib/processing/image";
import { pdfToImages, type PdfImageFormat } from "@/lib/processing/pdf-to-image";
import { getToolBySlug } from "@/lib/tools";
import { DownloadBar, ShellChrome } from "@/components/tool-shells/primitives";

const TOOL = "pdf-to-jpg";
const ACCEPT = "application/pdf,.pdf";
const MAX_BYTES = 50 * 1024 * 1024;

// Gap between the anchor clicks in "download all". Chrome throttles rapid
// programmatic downloads from one gesture; a short stagger keeps every page
// from being silently dropped.
const DOWNLOAD_STAGGER_MS = 220;

type Quality = "72" | "150" | "300";

const QUALITY_NOTES: Record<Quality, string> = {
  "72": "Screen resolution. Smallest files — fine for uploading a page as proof.",
  "150": "Standard. Text stays crisp at full size. The right default for portals.",
  "300": "Print quality. Large files — use when the page will be printed or OCR'd.",
};

interface PageOutput {
  pageNumber: number;
  url: string;
  bytes: number;
  width: number;
  height: number;
}

export function PdfToJpgForm() {
  const tool = getToolBySlug(TOOL)!;
  const { set: setPipeline } = usePipeline();

  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<PdfImageFormat>("image/jpeg");
  const [quality, setQuality] = useState<Quality>("150");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [outputs, setOutputs] = useState<PageOutput[]>([]);

  useEffect(() => () => {
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
  }, [outputs]);

  const ext = format === "image/jpeg" ? "jpg" : "png";
  const baseName = file ? file.name.replace(/\.pdf$/i, "") : "page";

  const adoptFile = (next: File | null) => {
    setFile(next);
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    setOutputs([]);
    setProgress(null);
    if (next) {
      fire("file_added", {
        tool_id: TOOL,
        file_count: 1,
        file_size_bucket: sizeBucket(next.size),
        file_type: next.type || "application/pdf",
      });
    }
  };

  useConsumePipelineFile({ accept: ACCEPT, onFile: adoptFile, hasFile: file !== null });

  const run = async () => {
    if (!file) {
      toast.error("Upload a PDF first.");
      return;
    }
    setSubmitting(true);
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    setOutputs([]);
    setProgress({ done: 0, total: 0 });

    fire("process_start", { tool_id: TOOL, preset: `${ext}-${quality}dpi` });
    const t0 = performance.now();
    try {
      const pages = await pdfToImages(file, {
        dpi: Number(quality),
        format,
        onPage: (done, total) => setProgress({ done, total }),
      });
      const next: PageOutput[] = pages.map((p) => ({
        pageNumber: p.pageNumber,
        url: URL.createObjectURL(p.blob),
        bytes: p.blob.size,
        width: p.width,
        height: p.height,
      }));
      setOutputs(next);
      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(file.size),
        output_size_bucket: sizeBucket(next.reduce((s, o) => s + o.bytes, 0)),
      });

      // Hand the first page to the pipeline. Single-page documents are the
      // common case, and "continue editing" on a multi-page export has no
      // obvious meaning beyond "the page I started with".
      const first = pages[0];
      if (first) {
        setPipeline({
          blob: first.blob,
          meta: { name: `${baseName}-page-${first.pageNumber}.${ext}`, type: format },
          fromTool: TOOL,
          createdAt: Date.now(),
        });
      }

      toast.success(`Exported ${next.length} page${next.length === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not convert this PDF.");
      fire("process_error", {
        tool_id: TOOL,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  };

  const downloadAll = async () => {
    fire("download_click", { tool_id: TOOL, output_type: format });
    for (const o of outputs) {
      const a = document.createElement("a");
      a.href = o.url;
      a.download = `${baseName}-page-${o.pageNumber}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      await new Promise((resolve) => setTimeout(resolve, DOWNLOAD_STAGGER_MS));
    }
  };

  return (
    <ShellChrome tool={tool}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card variant="outline">
          <CardHeader>
            <CardTitle>1. PDF and output settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              accept={ACCEPT}
              maxSize={MAX_BYTES}
              onFiles={(files) => adoptFile(files[0] ?? null)}
              label="Drop a PDF here"
              sublabel="Up to 50 MB. Every page becomes a separate image."
            />

            {file && (
              <div className="flex items-start justify-between gap-3 rounded-md border border-surface-border-subtle p-3 text-body-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{file.name}</div>
                  <div className="text-surface-fg-muted">{formatKb(file.size)}</div>
                </div>
                <Button variant="ghost" size="compact-sm" onClick={() => adoptFile(null)}>
                  Remove
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label className="block">Image format</Label>
              <SegmentedControl
                size="md"
                variant="soft"
                options={[
                  { id: "image/jpeg", text: "JPG" },
                  { id: "image/png", text: "PNG" },
                ]}
                value={format}
                onValueChange={(id) => setFormat(id as PdfImageFormat)}
              />
              <p className="text-body-xs text-surface-fg-muted">
                {format === "image/jpeg"
                  ? "JPG is what almost every government portal accepts."
                  : "PNG is lossless and bigger — use it when the page has line art or you'll edit it further."}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="block">Resolution</Label>
              <SegmentedControl
                size="md"
                variant="soft"
                options={[
                  { id: "72", text: "72 DPI" },
                  { id: "150", text: "150 DPI" },
                  { id: "300", text: "300 DPI" },
                ]}
                value={quality}
                onValueChange={(id) => setQuality(id as Quality)}
              />
              <p className="text-body-xs text-surface-fg-muted">{QUALITY_NOTES[quality]}</p>
            </div>

            <Button fullWidth size="lg" loading={submitting} disabled={!file || submitting} onClick={run}>
              Convert to {ext.toUpperCase()}
            </Button>

            {progress && progress.total > 0 && (
              <p className="text-body-sm text-surface-fg-muted" role="status">
                Rendering page {progress.done} of {progress.total}…
              </p>
            )}
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle>
              {outputs.length > 0
                ? `2. ${outputs.length} page${outputs.length === 1 ? "" : "s"}`
                : "2. Pages"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {outputs.length > 0 ? (
              <>
                <Button variant="solid" size="lg" fullWidth onClick={downloadAll}>
                  Download all {outputs.length} page{outputs.length === 1 ? "" : "s"}
                </Button>
                <p className="text-body-xs text-surface-fg-muted">
                  Your browser may ask once for permission to save multiple files.
                </p>

                <ul className="grid gap-3 sm:grid-cols-2">
                  {outputs.map((o) => (
                    <li
                      key={o.url}
                      className="space-y-2 rounded-md border border-surface-border-subtle p-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
                      <img
                        src={o.url}
                        alt={`Page ${o.pageNumber}`}
                        className="block max-h-56 w-full rounded border border-surface-border-subtle object-contain"
                      />
                      <div className="text-body-xs text-surface-fg-muted">
                        Page {o.pageNumber} · {o.width}×{o.height} px · {formatKb(o.bytes)}
                      </div>
                      <DownloadBar
                        url={o.url}
                        filename={`${baseName}-page-${o.pageNumber}.${ext}`}
                        toolSlug={TOOL}
                        outputType={format}
                        label="Download"
                        size="sm"
                        fullWidth
                      />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle p-6 text-center text-body-sm text-surface-fg-muted">
                Convert a PDF to see every page here, each with its own download.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ShellChrome>
  );
}
