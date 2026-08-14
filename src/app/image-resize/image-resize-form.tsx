"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Lock, Unlock, Check } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@devalok/shilp-sutra/ui/tabs";
import { Slider } from "@devalok/shilp-sutra/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@devalok/shilp-sutra/ui/select";
import { fire } from "@/lib/analytics/events";

const TOOL_ID = "image-resize";
const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

type ResizeMode = "pixels" | "percentage";
type OutputFormat = "same" | "image/jpeg" | "image/png" | "image/webp";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function extFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export function ImageResizeForm() {
  // Source state
  const [file, setFile] = useState<File | null>(null);
  const [srcW, setSrcW] = useState(0);
  const [srcH, setSrcH] = useState(0);
  const [srcBytes, setSrcBytes] = useState(0);

  // Resize config
  const [mode, setMode] = useState<ResizeMode>("pixels");
  const [targetW, setTargetW] = useState(0);
  const [targetH, setTargetH] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [percentage, setPercentage] = useState(100);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("same");
  const [quality, setQuality] = useState(90);

  // Result state
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultW, setResultW] = useState(0);
  const [resultH, setResultH] = useState(0);
  const [processing, setProcessing] = useState(false);

  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived output dims for preview
  const previewW =
    mode === "pixels" ? targetW : Math.round((srcW * percentage) / 100);
  const previewH =
    mode === "pixels" ? targetH : Math.round((srcH * percentage) / 100);

  // Effective MIME for output
  const effectiveMime = ((): string => {
    if (outputFormat !== "same") return outputFormat;
    if (file?.type === "image/png") return "image/png";
    if (file?.type === "image/webp") return "image/webp";
    return "image/jpeg";
  })();

  const showQuality =
    effectiveMime === "image/jpeg" || effectiveMime === "image/webp";

  const adoptFile = useCallback((f: File) => {
    if (!ACCEPT.split(",").includes(f.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File too large — maximum 25 MB.");
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      setFile(f);
      setSrcW(img.naturalWidth);
      setSrcH(img.naturalHeight);
      setSrcBytes(f.size);
      setTargetW(img.naturalWidth);
      setTargetH(img.naturalHeight);
      setPercentage(100);
      setResultUrl(null);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      toast.error("Could not read image dimensions.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  // Width changed in pixel mode — auto-compute height when locked
  const handleWidthChange = (raw: string) => {
    const w = Math.max(1, parseInt(raw, 10) || 1);
    setTargetW(w);
    if (lockAspect && srcW > 0) {
      setTargetH(Math.max(1, Math.round((w * srcH) / srcW)));
    }
  };

  // Height changed in pixel mode — auto-compute width when locked
  const handleHeightChange = (raw: string) => {
    const h = Math.max(1, parseInt(raw, 10) || 1);
    setTargetH(h);
    if (lockAspect && srcH > 0) {
      setTargetW(Math.max(1, Math.round((h * srcW) / srcH)));
    }
  };

  // Drag & drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) adoptFile(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) adoptFile(f);
  };

  const handleResize = useCallback(async () => {
    if (!file) return;

    const outW = mode === "pixels" ? targetW : Math.round((srcW * percentage) / 100);
    const outH = mode === "pixels" ? targetH : Math.round((srcH * percentage) / 100);

    if (outW < 1 || outH < 1) {
      toast.error("Output dimensions must be at least 1×1 px.");
      return;
    }

    fire("process_start", { tool_id: TOOL_ID });
    setProcessing(true);

    try {
      const img = new Image();
      const srcUrl = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = srcUrl;
      });
      URL.revokeObjectURL(srcUrl);

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0, outW, outH);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Canvas toBlob failed"));
          },
          effectiveMime,
          showQuality ? quality / 100 : undefined,
        );
      });

      const oldUrl = resultUrl;
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultW(outW);
      setResultH(outH);
      if (oldUrl) URL.revokeObjectURL(oldUrl);

      fire("download_click", { tool_id: TOOL_ID, output_type: effectiveMime });

      const baseName = file.name.replace(/\.[^./\\]+$/, "") || "image";
      const ext = extFor(effectiveMime);
      const filename = `resized-${baseName}.${ext}`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      toast.success(`Resized to ${outW}×${outH} px and downloading.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resize failed.");
    } finally {
      setProcessing(false);
    }
  }, [
    file,
    mode,
    targetW,
    targetH,
    srcW,
    srcH,
    percentage,
    effectiveMime,
    showQuality,
    quality,
    resultUrl,
  ]);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {!file && (
        <div
          ref={dropRef}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-surface-border-subtle bg-surface-1 px-6 py-14 text-center transition hover:border-accent-8 hover:bg-surface-2"
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          aria-label="Upload image"
        >
          <Upload className="size-8 text-surface-fg-muted" aria-hidden />
          <div>
            <p className="font-medium text-surface-fg">Drop an image here</p>
            <p className="mt-1 text-body-sm text-surface-fg-muted">
              JPEG, PNG or WebP · up to 25 MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={onFileChange}
            tabIndex={-1}
          />
        </div>
      )}

      {/* Source info + controls */}
      {file && (
        <div className="space-y-5">
          {/* Source info */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-surface-border-subtle bg-surface-2 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-body-sm font-medium text-surface-fg">{file.name}</p>
              <p className="text-body-xs text-surface-fg-muted">
                {srcW} × {srcH} px · {formatBytes(srcBytes)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="compact-sm"
              onClick={() => {
                setFile(null);
                setResultUrl(null);
              }}
            >
              Change photo
            </Button>
          </div>

          {/* Resize mode tabs */}
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as ResizeMode)}
          >
            <TabsList variant="contained">
              <TabsTrigger value="pixels">By pixels</TabsTrigger>
              <TabsTrigger value="percentage">By percentage</TabsTrigger>
            </TabsList>

            <TabsContent value="pixels" className="mt-4 space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="resize-width"
                    className="text-body-xs font-medium text-surface-fg-muted"
                  >
                    Width (px)
                  </label>
                  <input
                    id="resize-width"
                    type="number"
                    min={1}
                    max={20000}
                    value={targetW}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-28 rounded-md border border-surface-border bg-surface-1 px-3 py-1.5 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-accent-7"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="resize-height"
                    className="text-body-xs font-medium text-surface-fg-muted"
                  >
                    Height (px)
                  </label>
                  <input
                    id="resize-height"
                    type="number"
                    min={1}
                    max={20000}
                    value={targetH}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-28 rounded-md border border-surface-border bg-surface-1 px-3 py-1.5 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-accent-7"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setLockAspect((v) => !v)}
                  className="flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-body-sm text-surface-fg transition hover:bg-surface-3"
                  aria-pressed={lockAspect}
                  title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                >
                  {lockAspect ? (
                    <Lock className="size-4" aria-hidden />
                  ) : (
                    <Unlock className="size-4" aria-hidden />
                  )}
                  <span>{lockAspect ? "Locked" : "Unlocked"}</span>
                </button>
              </div>
            </TabsContent>

            <TabsContent value="percentage" className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <Slider
                  min={1}
                  max={200}
                  step={1}
                  value={[percentage]}
                  onValueChange={([v]) => setPercentage(v)}
                  aria-label="Resize percentage"
                  className="w-48"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={percentage}
                    onChange={(e) =>
                      setPercentage(
                        Math.min(200, Math.max(1, parseInt(e.target.value, 10) || 1)),
                      )
                    }
                    className="w-20 rounded-md border border-surface-border bg-surface-1 px-3 py-1.5 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-accent-7"
                    aria-label="Percentage value"
                  />
                  <span className="text-body-sm text-surface-fg-muted">%</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Output dimensions preview */}
          {previewW > 0 && previewH > 0 && (
            <p className="text-body-sm text-surface-fg-muted">
              Output:{" "}
              <span className="font-medium text-surface-fg">
                {previewW} × {previewH} px
              </span>
            </p>
          )}

          {/* Output format + quality */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-body-xs font-medium text-surface-fg-muted">
                Output format
              </span>
              <Select
                value={outputFormat}
                onValueChange={(v) => setOutputFormat(v as OutputFormat)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">Same as input</SelectItem>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                  <SelectItem value="image/webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showQuality && (
              <div className="flex flex-col gap-1">
                <span className="text-body-xs font-medium text-surface-fg-muted">
                  Quality: {quality}%
                </span>
                <div className="flex items-center gap-3 pt-1">
                  <Slider
                    min={10}
                    max={100}
                    step={1}
                    value={[quality]}
                    onValueChange={([v]) => setQuality(v)}
                    aria-label="Output quality"
                    className="w-36"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action */}
          <Button
            size="lg"
            loading={processing}
            disabled={processing || (mode === "pixels" ? targetW < 1 || targetH < 1 : percentage < 1)}
            onClick={handleResize}
          >
            <Check className="size-4" aria-hidden />
            Resize Image
          </Button>

          {/* Result info */}
          {resultUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-success-6 bg-success-2 px-4 py-3 text-body-sm text-success-11">
              <Check className="size-4 shrink-0" aria-hidden />
              Resized to {resultW} × {resultH} px and downloaded.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
