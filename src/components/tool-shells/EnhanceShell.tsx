"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { useT } from "@/i18n/provider";
import { durationBucket, fire, sizeBucket } from "@/lib/analytics";
import { useConsumePipelineFile, usePipeline } from "@/lib/pipeline";
import { formatKb } from "@/lib/processing/image";
import { useBlobUrl } from "@/lib/processing/kernel";
import type { Tool } from "@/lib/tools";
import { DownloadBar, PaywallPitch, ShellChrome } from "./primitives";

export interface EnhanceResult {
  blob: Blob;
  bytes: number;
}

interface EnhanceShellProps {
  tool: Tool;
  accept: string;
  maxBytes: number;
  dropLabel: string;
  dropSublabel: string;
  /** Headline for the result, e.g. "Grayscale photo". */
  resultTitle: string;
  /** Per-tool enhancement. */
  onProcess: (file: File) => Promise<EnhanceResult>;
  /** Download filename builder. */
  outputFilename: (source: File) => string;
  /** Output MIME for analytics. */
  outputType: string;
  /** Optional config rendered above the before/after slider (e.g. intensity). */
  configSlot?: React.ReactNode;
  comingSoon?: boolean;
}

// EnhanceShell — base-infrastructure-plan §3.
//
// Distinct UI feel: the source and the output are the same image, just
// modified. So instead of side-by-side panes (which makes them feel like
// different things), we use an interactive before/after slider — the user
// drags a divider to compare. This is the iconic UX shape for photo
// editing on the web, and it makes "you're editing the same image" the
// visual story.
//
// Drag the divider left to see more "before", right to see more "after".
export function EnhanceShell({
  tool,
  accept,
  maxBytes,
  dropLabel,
  dropSublabel,
  resultTitle,
  onProcess,
  outputFilename,
  outputType,
  configSlot,
  comingSoon = false,
}: EnhanceShellProps) {
  const dict = useT();
  const { set: setPipeline } = usePipeline();

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const sourceUrl = useBlobUrl(file);
  const resultUrl = useBlobUrl(resultBlob);

  const adoptFile = useCallback(
    (next: File | null) => {
      setFile(next);
      setResultBlob(null);
      if (next) {
        fire("file_added", {
          tool_id: tool.slug,
          file_count: 1,
          file_size_bucket: sizeBucket(next.size),
          file_type: next.type || "unknown",
        });
      }
    },
    [tool.slug],
  );

  useConsumePipelineFile({ accept, onFile: adoptFile });

  const submit = useCallback(async () => {
    if (!file) {
      toast.error(dict.shell.errors.noFile);
      return;
    }
    if (resultBlob) fire("process_retry", { tool_id: tool.slug, after: "complete" });
    setSubmitting(true);
    setResultBlob(null);

    fire("process_start", { tool_id: tool.slug });
    const t0 = performance.now();
    try {
      const r = await onProcess(file);
      setResultBlob(r.blob);

      fire("process_complete", {
        tool_id: tool.slug,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(file.size),
        output_size_bucket: sizeBucket(r.bytes),
      });

      setPipeline({
        blob: r.blob,
        meta: { name: outputFilename(file), type: r.blob.type || outputType },
        fromTool: tool.slug,
        createdAt: Date.now(),
      });

      toast.success(`Done · ${formatKb(r.bytes)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : dict.shell.errors.processFailed;
      toast.error(message);
      fire("process_error", {
        tool_id: tool.slug,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  }, [file, resultBlob, onProcess, tool.slug, setPipeline, outputFilename, outputType, dict.shell.errors]);

  return (
    <ShellChrome tool={tool} comingSoon={comingSoon}>
      <Card variant="outline">
        <CardHeader>
          <CardTitle>{resultUrl ? resultTitle : file ? "Ready to enhance" : "Upload a photo"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file && (
            <FileUpload
              accept={accept}
              maxSize={maxBytes}
              onFiles={(files) => adoptFile(files[0] ?? null)}
              label={dropLabel}
              sublabel={dropSublabel}
            />
          )}

          {file && (
            <>
              {configSlot}

              {sourceUrl && (
                <BeforeAfter
                  beforeUrl={sourceUrl}
                  afterUrl={resultUrl ?? null}
                />
              )}

              {resultUrl && <PaywallPitch tool={tool} trigger="post-download" />}

              <div className="flex flex-wrap gap-3">
                {!resultUrl && (
                  <Button size="lg" loading={submitting} disabled={submitting || comingSoon} onClick={submit}>
                    Apply
                  </Button>
                )}
                {resultUrl && (
                  <DownloadBar
                    url={resultUrl}
                    filename={outputFilename(file)}
                    toolSlug={tool.slug}
                    outputType={outputType}
                    secondaryActions={
                      <Button variant="soft" size="lg" onClick={() => adoptFile(null)}>
                        Choose a different photo
                      </Button>
                    }
                  />
                )}
                {!resultUrl && (
                  <Button variant="soft" size="lg" onClick={() => adoptFile(null)}>
                    Choose a different photo
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ShellChrome>
  );
}

// Before/after slider — a clip-path on the "after" image driven by a draggable
// vertical divider. Pure CSS + a pointer handler; no extra dep.
function BeforeAfter({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl: string;
  afterUrl: string | null;
}) {
  const [pos, setPos] = useState(50); // percentage from left
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 && e.pointerType === "mouse") return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        setPos(Math.max(0, Math.min(100, pct)));
      }}
      className="relative w-full select-none overflow-hidden rounded-md border border-surface-border bg-surface-2"
      style={{ touchAction: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
      <img
        src={beforeUrl}
        alt="Before"
        className="block max-h-[60vh] w-full object-contain"
        draggable={false}
      />
      {afterUrl && (
        <>
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
            <img
              src={afterUrl}
              alt="After"
              className="block max-h-[60vh] w-full object-contain"
              draggable={false}
            />
          </div>
          <div
            className="absolute inset-y-0 w-0.5 bg-accent-9"
            style={{ left: `${pos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent-9 bg-surface-1 px-2 py-1 text-body-xs font-medium text-accent-11 shadow-md">
              ↔
            </div>
          </div>
          <div className="absolute left-3 top-3 rounded bg-surface-1/80 px-2 py-0.5 text-body-xs font-medium backdrop-blur">
            Before
          </div>
          <div className="absolute right-3 top-3 rounded bg-accent-3/90 px-2 py-0.5 text-body-xs font-medium text-accent-11 backdrop-blur">
            After
          </div>
        </>
      )}
    </div>
  );
}
