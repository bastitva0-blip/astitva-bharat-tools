"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, RotateCw, X } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { durationBucket, fire, sizeBucket, useToolAnalytics } from "@/lib/analytics";
import { useConsumePipelineFile } from "@/lib/pipeline";
import { formatKb } from "@/lib/processing/image";
import {
  buildPdfFromImages,
  type Orientation,
  type PageSize,
} from "@/lib/processing/images-to-pdf";
import { DownloadBar } from "@/components/tool-shells/primitives";

const TOOL = "jpg-to-pdf";

type Rotation = 0 | 90 | 180 | 270;

interface Item {
  id: string;
  file: File;
  previewUrl: string;
  rotation: Rotation;
}

export function JpgToPdfForm() {
  useToolAnalytics(TOOL);
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [submitting, setSubmitting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Revoke preview URLs only on unmount. Using [items] here would revoke URLs
  // that are still displayed after a rotate/reorder (those keep the same
  // previewUrl), breaking the thumbnails. remove() revokes per-item.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  });
  useEffect(() => () => {
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
  }, []);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const addFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const additions: Item[] = files.map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      rotation: 0,
    }));
    setItems((cur) => [...cur, ...additions]);
    fire("file_added", {
      tool_id: TOOL,
      file_count: additions.length,
      file_size_bucket: sizeBucket(additions.reduce((s, a) => s + a.file.size, 0)),
      file_type: additions[0]?.file.type || "unknown",
    });
  }, []);

  // Pick up an image handed off from a previous tool (e.g. Image Compressor).
  useConsumePipelineFile({
    accept: "image/*",
    onFile: (file) => addFiles([file]),
    hasFile: items.length > 0,
  });

  const remove = (id: string) => {
    setItems((cur) => {
      const target = cur.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return cur.filter((i) => i.id !== id);
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.id === id);
      if (idx < 0) return cur;
      const target = idx + dir;
      if (target < 0 || target >= cur.length) return cur;
      const next = [...cur];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const rotate = (id: string) => {
    setItems((cur) =>
      cur.map((i) =>
        i.id === id ? { ...i, rotation: ((i.rotation + 90) % 360) as Rotation } : i,
      ),
    );
  };

  const generate = async () => {
    if (items.length === 0) {
      toast.error("Add at least one image.");
      return;
    }
    setSubmitting(true);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);

    fire("process_start", { tool_id: TOOL });
    const t0 = performance.now();
    const inputBytes = items.reduce((s, i) => s + i.file.size, 0);
    try {
      const bytes = await buildPdfFromImages({
        items: items.map((i) => ({ blob: i.file, rotation: i.rotation })),
        pageSize,
        orientation,
      });
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(inputBytes),
        output_size_bucket: sizeBucket(blob.size),
      });
      toast.success(`PDF ready - ${items.length} page${items.length === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to build PDF.");
      fire("process_error", {
        tool_id: TOOL,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. Pick images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="image/*"
            multiple
            maxSize={25 * 1024 * 1024}
            onFiles={addFiles}
            label="Drop images here"
            sublabel="JPG / PNG / WebP, up to 25 MB each. Drop again to add more."
          />

          {items.length > 0 && (
            <ul className="divide-y divide-surface-border-subtle rounded-md border border-surface-border-subtle">
              {items.map((it, idx) => (
                <li key={it.id} className="flex items-center gap-3 p-3">
                  <span className="w-6 text-body-sm text-surface-fg-muted">{idx + 1}.</span>
                  <img
                    src={it.previewUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded border border-surface-border-subtle object-cover"
                    style={{ transform: `rotate(${it.rotation}deg)` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-body-sm font-medium">{it.file.name}</div>
                    <div className="text-body-xs text-surface-fg-muted">
                      {formatKb(it.file.size)}
                      {it.rotation !== 0 ? ` · rotated ${it.rotation}°` : ""}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Rotate 90°"
                    onClick={() => rotate(it.id)}
                  >
                    <RotateCw size={16} />
                  </Button>
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

          <div className="space-y-2">
            <Label className="block">Page size</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                { id: "a4", text: "A4" },
                { id: "letter", text: "Letter" },
              ]}
              selectedId={pageSize}
              onSelect={(id) => setPageSize(id as PageSize)}
            />
          </div>

          <div className="space-y-2">
            <Label className="block">Orientation</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                { id: "portrait", text: "Portrait" },
                { id: "landscape", text: "Landscape" },
              ]}
              selectedId={orientation}
              onSelect={(id) => setOrientation(id as Orientation)}
            />
          </div>

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={items.length === 0 || submitting}
            onClick={generate}
          >
            Build PDF
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>2. Result</CardTitle>
        </CardHeader>
        <CardContent>
          {resultUrl ? (
            <div className="space-y-4">
              <iframe
                title="Generated PDF preview"
                src={resultUrl}
                className="h-[70vh] w-full rounded-md border border-surface-fg bg-surface-2"
              />
              <DownloadBar
                url={resultUrl}
                filename="bharattools-images.pdf"
                toolSlug={TOOL}
                outputType="application/pdf"
                label="Download PDF"
                fullWidth
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Build a PDF to see the preview here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
