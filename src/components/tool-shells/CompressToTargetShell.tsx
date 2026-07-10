"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { useT } from "@/i18n/provider";
import { durationBucket, fire, sizeBucket, useToolAnalytics } from "@/lib/analytics";
import { usePipeline } from "@/lib/pipeline";
import { useBlobUrl } from "@/lib/processing/kernel";
import type { Tool } from "@/lib/tools";
import { ContinueEditingPanel, DownloadBar, DropZone, PaywallPitch, TrustBadge } from "./primitives";

interface BaseResult {
  blob: Blob;
  bytes: number;
}

// Matches a (type, filename) pair against an HTML accept-style list, e.g.
// "image/*,application/pdf,.heic". Handles wildcards and extension entries.
function matchesAccept(mime: string, name: string, accept: string): boolean {
  const tokens = accept.split(",").map((s) => s.trim()).filter(Boolean);
  if (tokens.length === 0 || tokens.includes("*/*")) return true;
  const lowerName = name.toLowerCase();
  for (const token of tokens) {
    if (token.startsWith(".")) {
      if (lowerName.endsWith(token.toLowerCase())) return true;
      continue;
    }
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1); // "image/"
      if (mime.startsWith(prefix)) return true;
      continue;
    }
    if (token === mime) return true;
  }
  return false;
}

interface PreviewableResult extends BaseResult {
  url: string;
}

interface CompressToTargetShellProps<TResult extends BaseResult> {
  /** Tool registry entry — drives slug, nextSteps, name, etc. */
  tool: Tool;

  /** Comma-separated MIME accept string for the underlying FileUpload. */
  accept: string;

  /** Hard size limit enforced by FileUpload. */
  maxBytes: number;

  /** Localized labels for the drop zone copy. */
  dropLabel: string;
  dropSublabel: string;

  /** Configuration UI rendered between the drop zone and the submit button. */
  configSlot: React.ReactNode;

  /** Submit button label, already formatted with the active target. */
  submitLabel: string;

  /** Per-tool result preview (e.g. <img>, <iframe>). */
  renderPreview: (result: PreviewableResult & TResult) => React.ReactNode;

  /**
   * Per-tool source thumbnail (e.g. <video> for non-image inputs). Falls
   * back to DropZone's default <img> thumbnail when omitted, which only
   * works for image sources.
   */
  renderSourcePreview?: (previewUrl: string) => React.ReactNode;

  /** Per-tool stats panel (e.g. dimensions, target band). */
  renderStats: (result: TResult, source: { bytes: number }) => React.ReactNode;

  /** Empty-state copy on the result side. */
  emptyState: string;

  /** Download filename — pure fn of source file. */
  outputFilename: (source: File) => string;

  /** Type label used in the download_click analytics event. */
  outputType: string;

  /** Disable the submit button (e.g. invalid config). */
  canSubmit?: boolean;

  /**
   * Process the file. Caller passes a closure over its config state so the
   * shell doesn't need to know about config shape.
   */
  onProcess: (file: File) => Promise<TResult>;

  /** Localized card titles ("1. Source", "2. Result"). */
  sourceTitle: string;
  resultTitle: string;
}

// The compress-to-target shell (base-infrastructure-plan §3). One shell,
// many compress tools. It owns:
//   - file state, preview blob URL (auto-revoke via useBlobUrl)
//   - submit + result lifecycle, error toasts
//   - analytics: tool_open, file_added, process_*, download_click
//   - pipeline: read on mount → skip DropZone if entry present; write on
//     output → next tool picks it up
//   - chrome: TrustBadge, ContinueEditingPanel
//
// The caller owns: config UI + state, the processor function, the per-tool
// preview + stats.
export function CompressToTargetShell<TResult extends BaseResult>({
  tool,
  accept,
  maxBytes,
  dropLabel,
  dropSublabel,
  configSlot,
  submitLabel,
  renderPreview,
  renderSourcePreview,
  renderStats,
  emptyState,
  outputFilename,
  outputType,
  canSubmit,
  onProcess,
  sourceTitle,
  resultTitle,
}: CompressToTargetShellProps<TResult>) {
  const dict = useT();
  useToolAnalytics(tool.slug);

  const { entry: pipelineEntry, set: setPipeline, hydrate } = usePipeline();

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<(TResult & { url: string }) | null>(null);

  // One-time hydration from IDB on mount.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // If a pipeline entry arrives from a previous tool, skip the picker — but
  // only if its MIME / extension matches what this tool accepts. Skipping
  // when there's no match lets the user reach the drop zone and pick a fresh
  // file; the entry stays in the pipeline in case they navigate somewhere
  // that does accept it.
  const consumedRef = useRef(false);
  useEffect(() => {
    if (consumedRef.current || !pipelineEntry || file) return;

    if (!matchesAccept(pipelineEntry.meta.type, pipelineEntry.meta.name, accept)) {
      consumedRef.current = true;
      return;
    }

    consumedRef.current = true;
    const coerced = new File([pipelineEntry.blob], pipelineEntry.meta.name, {
      type: pipelineEntry.meta.type,
    });
    // Syncing the external pipeline store into local state on arrival is
    // the intended pattern here — exactly the case the React docs allow for
    // useEffect + setState. Lint rule errs on the side of strict.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFile(coerced);
    fire("file_added", {
      tool_id: tool.slug,
      file_count: 1,
      file_size_bucket: sizeBucket(coerced.size),
      file_type: coerced.type || "unknown",
    });
  }, [pipelineEntry, file, tool.slug, accept]);

  const previewUrl = useBlobUrl(file);

  const handleFile = useCallback(
    (next: File | null) => {
      setFile(next);
      if (result) URL.revokeObjectURL(result.url);
      setResult(null);
      if (next) {
        fire("file_added", {
          tool_id: tool.slug,
          file_count: 1,
          file_size_bucket: sizeBucket(next.size),
          file_type: next.type || "unknown",
        });
      }
    },
    [result, tool.slug],
  );

  useEffect(
    () => () => {
      if (result) URL.revokeObjectURL(result.url);
    },
    [result],
  );

  const submit = useCallback(async () => {
    if (!file) {
      toast.error(dict.shell.errors.noFile);
      return;
    }
    if (result) fire("process_retry", { tool_id: tool.slug, after: "complete" });
    setSubmitting(true);
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);

    fire("process_start", { tool_id: tool.slug });
    const t0 = performance.now();
    try {
      const r = await onProcess(file);
      const url = URL.createObjectURL(r.blob);
      setResult({ ...r, url });

      const elapsed = performance.now() - t0;
      fire("process_complete", {
        tool_id: tool.slug,
        duration_bucket: durationBucket(elapsed),
        input_size_bucket: sizeBucket(file.size),
        output_size_bucket: sizeBucket(r.bytes),
      });

      // Hand the output to the pipeline so a downstream tool can pick it up.
      setPipeline({
        blob: r.blob,
        meta: { name: outputFilename(file), type: r.blob.type || "application/octet-stream" },
        fromTool: tool.slug,
        createdAt: Date.now(),
      });
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
  }, [file, result, onProcess, setPipeline, outputFilename, tool.slug, dict.shell.errors]);

  const fullResult = result;

  return (
    <div>
      <div className="mb-4">
        <TrustBadge />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="outline">
          <CardHeader>
            <CardTitle>{sourceTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DropZone
              file={file}
              onFile={handleFile}
              accept={accept}
              maxBytes={maxBytes}
              dropLabel={dropLabel}
              dropSublabel={dropSublabel}
              previewUrl={previewUrl}
              renderPreview={
                renderSourcePreview && previewUrl
                  ? () => renderSourcePreview(previewUrl)
                  : undefined
              }
            />

            {configSlot}

            <Button
              fullWidth
              size="lg"
              loading={submitting}
              disabled={!file || submitting || canSubmit === false}
              onClick={submit}
            >
              {submitLabel}
            </Button>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle>{resultTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {fullResult ? (
              <div className="space-y-4">
                {renderPreview(fullResult)}
                {renderStats(fullResult, { bytes: file?.size ?? 0 })}
                <PaywallPitch tool={tool} trigger="post-download" />
                <DownloadBar
                  url={fullResult.url}
                  filename={file ? outputFilename(file) : "download"}
                  toolSlug={tool.slug}
                  outputType={outputType}
                  fullWidth
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
                {emptyState}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {fullResult && <ContinueEditingPanel fromTool={tool} />}
    </div>
  );
}
