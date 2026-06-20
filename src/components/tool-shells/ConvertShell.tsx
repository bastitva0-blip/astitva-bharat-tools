"use client";

import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { useT } from "@/i18n/provider";
import { durationBucket, fire, sizeBucket } from "@/lib/analytics";
import { useConsumePipelineFile, usePipeline } from "@/lib/pipeline";
import { formatKb } from "@/lib/processing/image";
import { useBlobUrl } from "@/lib/processing/kernel";
import type { Tool } from "@/lib/tools";
import { DownloadBar, DropZone, PaywallPitch, ShellChrome } from "./primitives";

export interface ConvertResult {
  blob: Blob;
  bytes: number;
}

export interface ConvertTargetOption {
  /** Stable identifier passed back to onProcess. */
  id: string;
  /** Short label, e.g. "JPG". */
  label: string;
  /** Optional sublabel, e.g. "best for portals". */
  sub?: string;
  /** MIME type of the output, used for filenames + analytics. */
  mime: string;
  /** File extension, e.g. "jpg". */
  ext: string;
}

interface ConvertShellProps {
  tool: Tool;
  /** Accept string for the input (e.g. "image/*"). */
  accept: string;
  maxBytes: number;
  dropLabel: string;
  dropSublabel: string;
  /** Pick-from list — the user chooses one. */
  targets: ConvertTargetOption[];
  /** Default selected target ID. */
  defaultTargetId?: string;
  /** Per-tool processor. Receives input file + chosen target. */
  onProcess: (file: File, target: ConvertTargetOption) => Promise<ConvertResult>;
  /** Download filename builder. */
  outputFilename: (source: File, target: ConvertTargetOption) => string;
  /** Render a preview of the source. Defaults to nothing — caller passes
   *  e.g. an <img> for images, a PDF iframe for PDFs. */
  renderSourcePreview?: (file: File, url: string) => React.ReactNode;
  /** Render a preview of the result blob. */
  renderResultPreview: (url: string, target: ConvertTargetOption) => React.ReactNode;
  /** Hide submit + show coming-soon banner. */
  comingSoon?: boolean;
}

// ConvertShell — base-infrastructure-plan §3.
//
// Distinct UI feel: the format pivot is the hero. Source preview is shown
// small on the LEFT, a chunky "→ target" picker is the centerpiece, and the
// result panel slides in on the RIGHT after processing. The "→" arrow
// between source and target makes the operation feel directional, which is
// what a conversion is.
export function ConvertShell({
  tool,
  accept,
  maxBytes,
  dropLabel,
  dropSublabel,
  targets,
  defaultTargetId,
  onProcess,
  outputFilename,
  renderSourcePreview,
  renderResultPreview,
  comingSoon = false,
}: ConvertShellProps) {
  const dict = useT();
  const { set: setPipeline } = usePipeline();

  const [file, setFile] = useState<File | null>(null);
  const [targetId, setTargetId] = useState<string>(
    defaultTargetId ?? targets[0]?.id ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const fileUrl = useBlobUrl(file);
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

  const target = targets.find((t) => t.id === targetId) ?? targets[0];

  const selectTarget = useCallback(
    (id: string) => {
      setTargetId(id);
      fire("preset_selected", { tool_id: tool.slug, preset_id: id });
    },
    [tool.slug],
  );

  const submit = useCallback(async () => {
    if (!file || !target) {
      toast.error(dict.shell.errors.noFile);
      return;
    }
    if (resultBlob) fire("process_retry", { tool_id: tool.slug, after: "complete" });
    setSubmitting(true);
    setResultBlob(null);

    fire("process_start", { tool_id: tool.slug, preset: target.id });
    const t0 = performance.now();
    try {
      const r = await onProcess(file, target);
      setResultBlob(r.blob);

      fire("process_complete", {
        tool_id: tool.slug,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(file.size),
        output_size_bucket: sizeBucket(r.bytes),
      });

      setPipeline({
        blob: r.blob,
        meta: { name: outputFilename(file, target), type: r.blob.type || target.mime },
        fromTool: tool.slug,
        createdAt: Date.now(),
      });

      toast.success(`Converted · ${formatKb(r.bytes)}`);
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
  }, [file, target, resultBlob, onProcess, tool.slug, setPipeline, outputFilename, dict.shell.errors]);

  return (
    <ShellChrome tool={tool} comingSoon={comingSoon}>
      {/* The pivot bar — source on the left, target picker on the right,
          with a directional arrow between. This is the hero of the shell. */}
      <Card variant="outline" className="mb-6">
        <CardContent className="p-5">
          <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_2fr]">
            {/* Source slot */}
            <div className="min-w-0">
              <div className="mb-2 text-body-xs uppercase tracking-wide text-surface-fg-muted">
                From
              </div>
              {!file ? (
                <DropZone
                  file={null}
                  onFile={adoptFile}
                  accept={accept}
                  maxBytes={maxBytes}
                  dropLabel={dropLabel}
                  dropSublabel={dropSublabel}
                />
              ) : (
                <div className="space-y-2">
                  {fileUrl && renderSourcePreview?.(file, fileUrl)}
                  <div className="flex items-center justify-between gap-2 rounded-md border border-surface-border-subtle px-3 py-2">
                    <div className="min-w-0 text-body-sm">
                      <div className="truncate font-medium">{file.name}</div>
                      <div className="text-body-xs text-surface-fg-muted">
                        {formatKb(file.size)} · {file.type || "unknown"}
                      </div>
                    </div>
                    <Button variant="ghost" size="compact-sm" onClick={() => adoptFile(null)}>
                      {dict.common.remove}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Directional arrow */}
            <div className="hidden md:flex md:items-center md:justify-center">
              <div className="rounded-full border border-accent-7 bg-accent-3 p-2 text-accent-11">
                <ArrowRight className="size-5" aria-hidden />
              </div>
            </div>

            {/* Target picker */}
            <div className="min-w-0">
              <div className="mb-2 text-body-xs uppercase tracking-wide text-surface-fg-muted">
                To
              </div>
              <SegmentedControl
                size="md"
                variant="default"
                options={targets.map((t) => ({ id: t.id, text: t.label }))}
                selectedId={targetId}
                onSelect={selectTarget}
              />
              {target?.sub && (
                <p className="mt-2 text-body-xs text-surface-fg-muted">{target.sub}</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              loading={submitting}
              disabled={!file || submitting || comingSoon}
              onClick={submit}
            >
              Convert to {target?.label ?? "..."}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result panel — appears after a successful conversion. */}
      {resultUrl && target && (
        <Card variant="outline">
          <CardHeader>
            <CardTitle>Result · {target.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderResultPreview(resultUrl, target)}
            <PaywallPitch tool={tool} trigger="post-download" />
            <DownloadBar
              url={resultUrl}
              filename={file ? outputFilename(file, target) : `output.${target.ext}`}
              toolSlug={tool.slug}
              outputType={target.mime}
              fullWidth
            />
          </CardContent>
        </Card>
      )}
    </ShellChrome>
  );
}
