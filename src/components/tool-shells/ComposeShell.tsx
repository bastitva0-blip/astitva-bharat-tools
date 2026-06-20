"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, RotateCw, X } from "lucide-react";
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

export type ComposeItemRotation = 0 | 90 | 180 | 270;

export interface ComposeItem {
  id: string;
  file: File;
  previewUrl: string;
  /** Per-item rotation applied by the user. Only meaningful when the shell
   *  was opened with `enableRotation`; otherwise stays at 0. */
  rotation: ComposeItemRotation;
}

export interface ComposeResult {
  blob: Blob;
  bytes: number;
}

interface ComposeShellProps {
  tool: Tool;
  accept: string;
  maxBytes: number;
  multiple?: boolean;
  dropLabel: string;
  dropSublabel: string;
  /** Minimum number of items required to enable submit. Default 1. */
  minItems?: number;
  /** Maximum items allowed. Default no cap. */
  maxItems?: number;
  /** Config UI rendered above the items strip. */
  configSlot?: React.ReactNode;
  submitLabel: string;
  /** Result preview renderer (e.g. <img> or <iframe> for PDF). */
  renderResultPreview: (url: string) => React.ReactNode;
  /** Per-tool composer. Receives ordered items. */
  onProcess: (items: ComposeItem[]) => Promise<ComposeResult>;
  outputFilename: string;
  outputType: string;
  comingSoon?: boolean;
  /** Show a per-item rotate button. Caller is responsible for honouring the
   *  rotation field on each ComposeItem inside onProcess. */
  enableRotation?: boolean;
}

// ComposeShell — base-infrastructure-plan §3.
//
// Distinct UI feel: items as a horizontal strip with reorder controls
// (number, move up/down, remove). The strip IS the work — it shows
// composition shape at a glance. Submit produces a single output that
// replaces the drop zone area; the strip stays visible above so users can
// adjust and re-submit without re-uploading.
export function ComposeShell({
  tool,
  accept,
  maxBytes,
  multiple = true,
  dropLabel,
  dropSublabel,
  minItems = 1,
  maxItems,
  configSlot,
  submitLabel,
  renderResultPreview,
  onProcess,
  outputFilename,
  outputType,
  comingSoon = false,
  enableRotation = false,
}: ComposeShellProps) {
  const dict = useT();
  const { set: setPipeline } = usePipeline();

  const [items, setItems] = useState<ComposeItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const resultUrl = useBlobUrl(resultBlob);

  // Revoke item previews on unmount or strip change.
  useEffect(
    () => () => {
      items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    },
    // Intentional: cleanup runs on unmount with the LAST seen items list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const cap = maxItems ?? Infinity;
      const slotsLeft = Math.max(0, cap - items.length);
      const take = files.slice(0, slotsLeft);
      if (take.length === 0) {
        toast.error(`Maximum ${cap} items.`);
        fire("file_rejected", { tool_id: tool.slug, reason: "too_many" });
        return;
      }
      const additions: ComposeItem[] = take.map((f) => ({
        id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        rotation: 0,
      }));
      setItems((cur) => [...cur, ...additions]);
      setResultBlob(null);
      fire("file_added", {
        tool_id: tool.slug,
        file_count: additions.length,
        file_size_bucket: sizeBucket(additions.reduce((s, a) => s + a.file.size, 0)),
      });
    },
    [items.length, maxItems, tool.slug],
  );

  useConsumePipelineFile({
    accept,
    onFile: (f) => addFiles([f]),
  });

  const remove = (id: string) => {
    setItems((cur) => {
      const target = cur.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return cur.filter((i) => i.id !== id);
    });
    setResultBlob(null);
  };

  const rotate = (id: string) => {
    setItems((cur) =>
      cur.map((i) =>
        i.id === id
          ? { ...i, rotation: (((i.rotation + 90) % 360) as ComposeItemRotation) }
          : i,
      ),
    );
    setResultBlob(null);
  };

  const move = (id: string, dir: -1 | 1) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.id === id);
      if (idx < 0) return cur;
      const tgt = idx + dir;
      if (tgt < 0 || tgt >= cur.length) return cur;
      const next = [...cur];
      [next[idx], next[tgt]] = [next[tgt], next[idx]];
      return next;
    });
    setResultBlob(null);
  };

  const submit = useCallback(async () => {
    if (items.length < minItems) {
      toast.error(`Add at least ${minItems} item${minItems === 1 ? "" : "s"}.`);
      return;
    }
    if (resultBlob) fire("process_retry", { tool_id: tool.slug, after: "complete" });
    setSubmitting(true);
    setResultBlob(null);

    fire("process_start", { tool_id: tool.slug });
    const t0 = performance.now();
    try {
      const r = await onProcess(items);
      setResultBlob(r.blob);

      fire("process_complete", {
        tool_id: tool.slug,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(items.reduce((s, i) => s + i.file.size, 0)),
        output_size_bucket: sizeBucket(r.bytes),
      });

      setPipeline({
        blob: r.blob,
        meta: { name: outputFilename, type: r.blob.type || outputType },
        fromTool: tool.slug,
        createdAt: Date.now(),
      });

      toast.success(`Composed · ${formatKb(r.bytes)}`);
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
  }, [items, minItems, resultBlob, onProcess, tool.slug, setPipeline, outputFilename, outputType, dict.shell.errors]);


  return (
    <ShellChrome tool={tool} comingSoon={comingSoon}>
      <Card variant="outline" className="mb-6">
        <CardHeader>
          <CardTitle>Inputs · {items.length}{maxItems ? ` / ${maxItems}` : ""}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept={accept}
            multiple={multiple}
            maxSize={maxBytes}
            onFiles={addFiles}
            label={dropLabel}
            sublabel={dropSublabel}
          />

          {items.length > 0 && (
            <ul className="divide-y divide-surface-border-subtle rounded-md border border-surface-border-subtle">
              {items.map((it, idx) => (
                <li key={it.id} className="flex items-center gap-3 p-3">
                  <span className="w-6 text-body-sm font-semibold text-surface-fg-muted">
                    {idx + 1}.
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
                  <img
                    src={it.previewUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded border border-surface-border-subtle object-cover transition-transform"
                    style={{ transform: `rotate(${it.rotation}deg)` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-body-sm font-medium">{it.file.name}</div>
                    <div className="text-body-xs text-surface-fg-muted">
                      {formatKb(it.file.size)}
                      {it.rotation !== 0 ? ` · rotated ${it.rotation}°` : ""}
                    </div>
                  </div>
                  {enableRotation && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Rotate 90°"
                      onClick={() => rotate(it.id)}
                    >
                      <RotateCw size={16} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move up"
                    disabled={idx === 0}
                    onClick={() => move(it.id, -1)}
                  >
                    <ArrowUp size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move down"
                    disabled={idx === items.length - 1}
                    onClick={() => move(it.id, 1)}
                  >
                    <ArrowDown size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove"
                    onClick={() => remove(it.id)}
                  >
                    <X size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {configSlot}

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={items.length < minItems || submitting || comingSoon}
            onClick={submit}
          >
            {submitLabel}
          </Button>
        </CardContent>
      </Card>

      {resultUrl && (
        <Card variant="outline">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderResultPreview(resultUrl)}
            <PaywallPitch tool={tool} trigger="post-download" />
            <DownloadBar
              url={resultUrl}
              filename={outputFilename}
              toolSlug={tool.slug}
              outputType={outputType}
              fullWidth
            />
          </CardContent>
        </Card>
      )}
    </ShellChrome>
  );
}
