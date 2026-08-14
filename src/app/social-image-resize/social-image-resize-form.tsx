"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── Presets ───────────────────────────────────────────────────────────────────

interface Preset {
  id: string;
  label: string;
  platform: string;
  width: number;
  height: number;
}

const PRESETS: Preset[] = [
  { id: "og",            label: "Open Graph (OG)",         platform: "Web",       width: 1200, height: 630  },
  { id: "twitter",       label: "Twitter/X Card",           platform: "Twitter/X", width: 1200, height: 675  },
  { id: "linkedin-cover",label: "LinkedIn Cover",           platform: "LinkedIn",  width: 1584, height: 396  },
  { id: "linkedin-post", label: "LinkedIn Post",            platform: "LinkedIn",  width: 1200, height: 627  },
  { id: "ig-square",     label: "Instagram Square",         platform: "Instagram", width: 1080, height: 1080 },
  { id: "ig-portrait",   label: "Instagram Portrait",       platform: "Instagram", width: 1080, height: 1350 },
  { id: "ig-landscape",  label: "Instagram Landscape",      platform: "Instagram", width: 1080, height: 566  },
  { id: "fb-cover",      label: "Facebook Cover",           platform: "Facebook",  width: 820,  height: 312  },
  { id: "yt-thumb",      label: "YouTube Thumbnail",        platform: "YouTube",   width: 1280, height: 720  },
];

type FitMode = "cover" | "contain" | "stretch";

// ── Canvas resize ─────────────────────────────────────────────────────────────

function resizeImage(
  img: HTMLImageElement,
  width: number,
  height: number,
  fit: FitMode,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve(null);

    if (fit === "stretch") {
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      const srcAspect = img.naturalWidth / img.naturalHeight;
      const dstAspect = width / height;

      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      let dx = 0, dy = 0, dw = width, dh = height;

      if (fit === "cover") {
        // Crop source to fill destination
        if (srcAspect > dstAspect) {
          sw = img.naturalHeight * dstAspect;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / dstAspect;
          sy = (img.naturalHeight - sh) / 2;
        }
      } else {
        // contain — letterbox (fill with white bg)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        if (srcAspect > dstAspect) {
          dh = width / srcAspect;
          dy = (height - dh) / 2;
        } else {
          dw = height * srcAspect;
          dx = (width - dw) / 2;
        }
      }

      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SocialImageResizeForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(PRESETS.map((p) => p.id)),
  );
  const [fit, setFit] = useState<FitMode>("cover");
  const [busy, setBusy] = useState(false);
  const [singleBusy, setSingleBusy] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setSourceFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const toggleAll = (value: boolean) => {
    setChecked(value ? new Set(PRESETS.map((p) => p.id)) : new Set());
  };

  const togglePreset = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const loadImg = (): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      if (!sourceFile) return reject(new Error("No file"));
      const url = URL.createObjectURL(sourceFile);
      const img = new Image();
      img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
      img.onerror = reject;
      img.src = url;
    });

  const handleDownloadSingle = async (preset: Preset) => {
    if (!sourceFile) { toast.error("Upload an image first."); return; }
    fire("process_start", { tool_id: "social-image-resize" });
    setSingleBusy(preset.id);
    try {
      const img = await loadImg();
      const blob = await resizeImage(img, preset.width, preset.height, fit);
      if (!blob) { toast.error("Resize failed."); return; }
      triggerDownload(blob, `${preset.id}-${preset.width}x${preset.height}.png`);
      fire("download_click", { tool_id: "social-image-resize", output_type: "image/png" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to resize image.");
    } finally {
      setSingleBusy(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!sourceFile) { toast.error("Upload an image first."); return; }
    const selected = PRESETS.filter((p) => checked.has(p.id));
    if (selected.length === 0) { toast.error("Select at least one preset."); return; }
    fire("process_start", { tool_id: "social-image-resize" });
    setBusy(true);
    try {
      const img = await loadImg();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — jszip installed at build time
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const preset of selected) {
        const blob = await resizeImage(img, preset.width, preset.height, fit);
        if (blob) {
          zip.file(`${preset.id}-${preset.width}x${preset.height}.png`, blob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      triggerDownload(zipBlob, "social-images.zip");
      fire("download_click", { tool_id: "social-image-resize", output_type: "application/zip" });
      toast.success("Downloaded all social images!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ZIP. Check browser console.");
    } finally {
      setBusy(false);
    }
  };

  const allChecked = checked.size === PRESETS.length;
  const noneChecked = checked.size === 0;

  return (
    <div className="space-y-8">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-surface-border p-10 text-center transition hover:border-primary-500 hover:bg-surface-2"
        role="button"
        aria-label="Drop an image or click to browse"
      >
        <Upload className="size-8 text-surface-fg-muted" aria-hidden />
        <p className="text-body-sm text-surface-fg-muted">
          Drop an image here, or{" "}
          <span className="font-medium text-primary-600">click to browse</span>
        </p>
        <p className="text-body-xs text-surface-fg-muted">JPG, PNG, WebP, SVG, GIF</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
          tabIndex={-1}
        />
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-2 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Source image preview"
            className="mx-auto max-h-56 max-w-full rounded object-contain"
          />
        </div>
      )}

      {/* Fit mode */}
      <div className="space-y-2">
        <p className="text-body-sm font-medium text-surface-fg">Fit mode</p>
        <div className="flex flex-wrap gap-2">
          {(["cover", "contain", "stretch"] as FitMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setFit(mode)}
              className={[
                "rounded-md border px-4 py-1.5 text-body-sm font-medium capitalize transition focus:outline-none focus:ring-2 focus:ring-primary-500",
                fit === mode
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-surface-border bg-surface-1 text-surface-fg hover:bg-surface-2",
              ].join(" ")}
            >
              {mode}
            </button>
          ))}
        </div>
        <p className="text-body-xs text-surface-fg-muted">
          {fit === "cover" && "Scales and crops to fill the frame — no letterboxing."}
          {fit === "contain" && "Scales to fit inside the frame — adds white bars if needed."}
          {fit === "stretch" && "Stretches to fill exactly — may distort the image."}
        </p>
      </div>

      {/* Preset list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-body-sm font-medium text-surface-fg">
            Platforms ({checked.size} selected)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => toggleAll(true)}
              disabled={allChecked}
              className="text-body-xs text-primary-600 hover:underline disabled:opacity-40"
            >
              All
            </button>
            <button
              onClick={() => toggleAll(false)}
              disabled={noneChecked}
              className="text-body-xs text-surface-fg-muted hover:underline disabled:opacity-40"
            >
              None
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-surface-border bg-surface-1 px-4 py-3"
            >
              <label className="flex flex-1 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked.has(preset.id)}
                  onChange={() => togglePreset(preset.id)}
                  className="h-4 w-4 rounded border-surface-border accent-primary-600"
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-body-sm font-medium text-surface-fg truncate">
                    {preset.label}
                  </span>
                  <span className="block text-body-xs text-surface-fg-muted">
                    {preset.width}×{preset.height} px
                  </span>
                </span>
              </label>
              <button
                onClick={() => handleDownloadSingle(preset)}
                disabled={!sourceFile || singleBusy === preset.id}
                title={`Download ${preset.label}`}
                className="shrink-0 rounded p-1.5 text-surface-fg-muted hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-40"
                aria-label={`Download ${preset.label}`}
              >
                <Download className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Download all */}
      <Button
        onClick={handleDownloadAll}
        disabled={busy || !sourceFile || noneChecked}
        className="w-full sm:w-auto"
      >
        <Download className="mr-2 size-4" aria-hidden />
        {busy ? "Creating ZIP…" : `Download All as ZIP (${checked.size})`}
      </Button>
    </div>
  );
}
