"use client";

import { useEffect, useState } from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { durationBucket, fire, sizeBucket } from "@/lib/analytics";
import { useConsumePipelineFile, usePipeline } from "@/lib/pipeline";
import { formatKb } from "@/lib/processing/image";
import { rotatePdf, type RotationDelta } from "@/lib/processing/pdf-rotate";
import { renderPdfThumbnails, type PdfThumbnail } from "@/lib/processing/pdf-to-image";
import { getToolBySlug } from "@/lib/tools";
import { DownloadBar, ShellChrome } from "@/components/tool-shells/primitives";

const TOOL = "pdf-rotate";
const ACCEPT = "application/pdf,.pdf";
const MAX_BYTES = 50 * 1024 * 1024;

function turn(current: RotationDelta, by: 90 | 270): RotationDelta {
  return (((current + by) % 360) as RotationDelta);
}

export function PdfRotateForm() {
  const tool = getToolBySlug(TOOL)!;
  const { set: setPipeline } = usePipeline();

  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<PdfThumbnail[]>([]);
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [deltas, setDeltas] = useState<RotationDelta[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState<{ url: string; bytes: number } | null>(null);

  useEffect(() => () => {
    if (output) URL.revokeObjectURL(output.url);
  }, [output]);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const rendered = await renderPdfThumbnails(file);
        if (cancelled) return;
        setThumbs(rendered);
        setDeltas(new Array(rendered.length).fill(0));
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Could not read this PDF.");
        }
      } finally {
        if (!cancelled) setLoadingThumbs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const baseName = file ? file.name.replace(/\.pdf$/i, "") : "document";

  const adoptFile = (next: File | null) => {
    setFile(next);
    setThumbs([]);
    setDeltas([]);
    // Flip the spinner on here rather than in the render effect — setting it
    // synchronously inside the effect body would cascade an extra render.
    setLoadingThumbs(next !== null);
    if (output) URL.revokeObjectURL(output.url);
    setOutput(null);
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

  const rotateOne = (index: number, by: 90 | 270) => {
    setDeltas((cur) => cur.map((d, i) => (i === index ? turn(d, by) : d)));
  };

  const rotateAll = (by: 90 | 270) => {
    setDeltas((cur) => cur.map((d) => turn(d, by)));
  };

  const touched = deltas.some((d) => d !== 0);

  const run = async () => {
    if (!file) {
      toast.error("Upload a PDF first.");
      return;
    }
    setSubmitting(true);
    if (output) URL.revokeObjectURL(output.url);
    setOutput(null);

    fire("process_start", { tool_id: TOOL });
    const t0 = performance.now();
    try {
      const bytes = await rotatePdf(file, deltas);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setOutput({ url: URL.createObjectURL(blob), bytes: blob.size });
      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(file.size),
        output_size_bucket: sizeBucket(blob.size),
      });
      setPipeline({
        blob,
        meta: { name: `${baseName}-rotated.pdf`, type: "application/pdf" },
        fromTool: TOOL,
        createdAt: Date.now(),
      });
      toast.success("Rotated PDF ready.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rotate this PDF.");
      fire("process_error", {
        tool_id: TOOL,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShellChrome tool={tool}>
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. Source PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="application/pdf,.pdf"
            maxSize={MAX_BYTES}
            onFiles={(files) => adoptFile(files[0] ?? null)}
            label="Drop a PDF here"
            sublabel="Up to 50 MB. Page previews are drawn on your device."
          />

          {file && (
            <div className="flex items-start justify-between gap-3 rounded-md border border-surface-border-subtle p-3 text-body-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{file.name}</div>
                <div className="text-surface-fg-muted">
                  {formatKb(file.size)}
                  {thumbs.length > 0 ? ` · ${thumbs.length} page${thumbs.length === 1 ? "" : "s"}` : ""}
                </div>
              </div>
              <Button variant="ghost" size="compact-sm" onClick={() => adoptFile(null)}>
                Remove
              </Button>
            </div>
          )}

          {loadingThumbs && (
            <p className="text-body-sm text-surface-fg-muted" role="status">
              Drawing page previews…
            </p>
          )}
        </CardContent>
      </Card>

      {thumbs.length > 0 && (
        <Card variant="outline" className="mt-6">
          <CardHeader>
            <CardTitle>2. Turn the pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-body-sm text-surface-fg-muted">Rotate every page:</span>
              <Button variant="soft" size="compact-sm" onClick={() => rotateAll(270)}>
                <RotateCcw className="mr-1.5 size-4" aria-hidden />
                Left
              </Button>
              <Button variant="soft" size="compact-sm" onClick={() => rotateAll(90)}>
                <RotateCw className="mr-1.5 size-4" aria-hidden />
                Right
              </Button>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {thumbs.map((t, index) => (
                <li
                  key={t.pageNumber}
                  className="space-y-2 rounded-md border border-surface-border-subtle p-3"
                >
                  <div className="flex min-h-[9rem] items-center justify-center overflow-hidden rounded bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- data: URL preview */}
                    <img
                      src={t.dataUrl}
                      alt={`Page ${t.pageNumber}`}
                      className="max-h-36 w-auto transition-transform"
                      style={{ transform: `rotate(${deltas[index] ?? 0}deg)` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-body-xs text-surface-fg-muted">
                      Page {t.pageNumber}
                      {deltas[index] ? ` · ${deltas[index]}°` : ""}
                    </span>
                    <span className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Rotate page ${t.pageNumber} left`}
                        onClick={() => rotateOne(index, 270)}
                      >
                        <RotateCcw size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Rotate page ${t.pageNumber} right`}
                        onClick={() => rotateOne(index, 90)}
                      >
                        <RotateCw size={16} />
                      </Button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              fullWidth
              size="lg"
              loading={submitting}
              disabled={!touched || submitting}
              onClick={run}
            >
              {touched ? "Save rotated PDF" : "Turn at least one page"}
            </Button>

            {output && (
              <DownloadBar
                url={output.url}
                filename={`${baseName}-rotated.pdf`}
                toolSlug={TOOL}
                outputType="application/pdf"
                label={`Download rotated PDF · ${formatKb(output.bytes)}`}
                fullWidth
              />
            )}
          </CardContent>
        </Card>
      )}
    </ShellChrome>
  );
}
