"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, RotateCw, X } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { formatKb } from "@/lib/processing/image";
import {
  buildPdfFromImages,
  type Orientation,
  type PageSize,
} from "@/lib/processing/images-to-pdf";

type Rotation = 0 | 90 | 180 | 270;

interface Item {
  id: string;
  file: File;
  previewUrl: string;
  rotation: Rotation;
}

export function JpgToPdfForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [submitting, setSubmitting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => () => {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
  }, [items]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const addFiles = (files: File[]) => {
    const additions: Item[] = files.map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      rotation: 0,
    }));
    setItems((cur) => [...cur, ...additions]);
  };

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
    try {
      const bytes = await buildPdfFromImages({
        items: items.map((i) => ({ blob: i.file, rotation: i.rotation })),
        pageSize,
        orientation,
      });
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      toast.success(`PDF ready — ${items.length} page${items.length === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to build PDF.");
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
              <Button asChild variant="solid" fullWidth size="lg">
                <a href={resultUrl} download="bharattools-images.pdf">
                  Download PDF
                </a>
              </Button>
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
