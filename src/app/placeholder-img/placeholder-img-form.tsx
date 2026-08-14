"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── Presets ───────────────────────────────────────────────────────────────────

interface SizePreset {
  label: string;
  width: number;
  height: number;
}

const PRESETS: SizePreset[] = [
  { label: "16×16",     width: 16,   height: 16   },
  { label: "32×32",     width: 32,   height: 32   },
  { label: "100×100",   width: 100,  height: 100  },
  { label: "200×200",   width: 200,  height: 200  },
  { label: "400×300",   width: 400,  height: 300  },
  { label: "640×480",   width: 640,  height: 480  },
  { label: "800×600",   width: 800,  height: 600  },
  { label: "1920×1080", width: 1920, height: 1080 },
];

// ── Render ────────────────────────────────────────────────────────────────────

interface RenderOptions {
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  labelText: string;
  fontSize: number | "auto";
}

function renderPlaceholder(
  canvas: HTMLCanvasElement,
  opts: RenderOptions,
): void {
  const { width, height, bgColor, textColor, labelText, fontSize } = opts;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Diagonal cross lines
  ctx.strokeStyle = textColor;
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, height);
  ctx.moveTo(width, 0);
  ctx.lineTo(0, height);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Label
  const text = labelText.trim() || `${width}×${height}`;
  const autoSize = Math.max(10, Math.min(48, Math.floor(Math.min(width, height) / 6)));
  const fs = fontSize === "auto" ? autoSize : Math.max(8, fontSize);
  ctx.font = `bold ${fs}px/1 system-ui, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2, width * 0.9);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PlaceholderImgForm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [bgColor, setBgColor] = useState("#cccccc");
  const [textColor, setTextColor] = useState("#666666");
  const [customText, setCustomText] = useState("");
  const [fontSizeMode, setFontSizeMode] = useState<"auto" | "manual">("auto");
  const [fontSize, setFontSize] = useState(24);
  const [dataUri, setDataUri] = useState<string>("");

  const effectiveFontSize: number | "auto" = fontSizeMode === "auto" ? "auto" : fontSize;
  const effectiveLabel = customText.trim() || `${width}×${height}`;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = Math.max(1, Math.min(4096, width));
    const h = Math.max(1, Math.min(4096, height));
    renderPlaceholder(canvas, {
      width: w,
      height: h,
      bgColor,
      textColor,
      labelText: customText,
      fontSize: effectiveFontSize,
    });
    setDataUri(canvas.toDataURL("image/png"));
  }, [width, height, bgColor, textColor, customText, effectiveFontSize]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const applyPreset = (preset: SizePreset) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    fire("process_start", { tool_id: "placeholder-img" });
    canvas.toBlob((blob) => {
      if (!blob) { toast.error("Failed to generate image."); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placeholder-${width}x${height}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      fire("download_click", { tool_id: "placeholder-img", output_type: "image/png" });
      toast.success("Image downloaded.");
    }, "image/png");
  };

  const handleCopyUri = async () => {
    if (!dataUri) return;
    try {
      await navigator.clipboard.writeText(dataUri);
      toast.success("Data URI copied to clipboard!");
    } catch {
      toast.error("Clipboard access denied.");
    }
  };

  const clampW = Math.max(1, Math.min(4096, width));
  const clampH = Math.max(1, Math.min(4096, height));

  return (
    <div className="space-y-8">
      {/* Preset chips */}
      <div className="space-y-2">
        <p className="text-body-sm font-medium text-surface-fg">Common sizes</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={[
                "rounded-full border px-3 py-1 text-body-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500",
                width === p.width && height === p.height
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-surface-border bg-surface-1 text-surface-fg hover:bg-surface-2",
              ].join(" ")}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Width */}
        <div className="space-y-1.5">
          <label htmlFor="ph-width" className="block text-body-sm font-medium">
            Width (px)
          </label>
          <input
            id="ph-width"
            type="number"
            min={1}
            max={4096}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Height */}
        <div className="space-y-1.5">
          <label htmlFor="ph-height" className="block text-body-sm font-medium">
            Height (px)
          </label>
          <input
            id="ph-height"
            type="number"
            min={1}
            max={4096}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Custom text */}
        <div className="space-y-1.5">
          <label htmlFor="ph-text" className="block text-body-sm font-medium">
            Label text{" "}
            <span className="font-normal text-surface-fg-muted">
              (default: {clampW}×{clampH})
            </span>
          </label>
          <input
            id="ph-text"
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={`${clampW}×${clampH}`}
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Background color */}
        <div className="space-y-1.5">
          <label htmlFor="ph-bg" className="block text-body-sm font-medium">
            Background color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="ph-bg"
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-md border border-surface-border bg-surface-1 p-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 rounded-md border border-surface-border bg-surface-1 px-3 py-2 font-mono text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Text color */}
        <div className="space-y-1.5">
          <label htmlFor="ph-fg" className="block text-body-sm font-medium">
            Text color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="ph-fg"
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-md border border-surface-border bg-surface-1 p-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 rounded-md border border-surface-border bg-surface-1 px-3 py-2 font-mono text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Font size */}
        <div className="space-y-1.5">
          <label className="block text-body-sm font-medium">Font size</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSizeMode(fontSizeMode === "auto" ? "manual" : "auto")}
              className={[
                "rounded-md border px-3 py-2 text-body-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500",
                fontSizeMode === "auto"
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-surface-border bg-surface-1 text-surface-fg hover:bg-surface-2",
              ].join(" ")}
            >
              Auto
            </button>
            {fontSizeMode === "manual" && (
              <input
                type="number"
                min={8}
                max={256}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-24 rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}
            {fontSizeMode === "manual" && (
              <span className="text-body-xs text-surface-fg-muted">px</span>
            )}
          </div>
        </div>
      </div>

      {/* Canvas preview */}
      <div className="space-y-2">
        <p className="text-body-sm font-medium text-surface-fg">
          Preview — {clampW}×{clampH} px
        </p>
        <div className="overflow-auto rounded-xl border border-surface-border bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHElEQVQ4y2NgYGD4z8BQDwAEgAF/TQ8ASQAAAABJRU5ErkJggg==')] p-2">
          <canvas
            ref={canvasRef}
            className="block max-w-full rounded shadow-sm"
            style={{ maxHeight: "320px", width: "auto" }}
          />
        </div>
      </div>

      {/* Data URI display */}
      {dataUri && (
        <div className="rounded-xl border border-surface-border bg-surface-1 p-4 space-y-2">
          <p className="text-body-xs font-semibold uppercase tracking-wide text-surface-fg-muted">
            Data URI <span className="font-normal normal-case">(paste into HTML img src)</span>
          </p>
          <div className="overflow-x-auto rounded-md border border-surface-border bg-surface-2 px-4 py-3">
            <p className="break-all font-mono text-body-xs text-surface-fg">
              {dataUri.length > 200 ? `${dataUri.slice(0, 200)}…` : dataUri}
            </p>
          </div>
          <p className="text-body-xs text-surface-fg-muted">
            Full URI length: {dataUri.length.toLocaleString()} characters
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="size-4" aria-hidden />
          Download PNG
        </Button>
        <Button
          variant="outline"
          onClick={handleCopyUri}
          disabled={!dataUri}
          className="flex items-center gap-2"
        >
          <Copy className="size-4" aria-hidden />
          Copy Data URI
        </Button>
      </div>

      {/* Usage hint */}
      {dataUri && (
        <div className="rounded-xl border border-surface-border bg-surface-2 px-4 py-3">
          <p className="text-body-xs font-semibold text-surface-fg mb-1">HTML usage</p>
          <pre className="overflow-x-auto font-mono text-body-xs text-surface-fg-muted whitespace-pre-wrap break-all">
            {`<img src="${effectiveLabel === `${clampW}×${clampH}` ? "[data-uri]" : "[data-uri]"}" width="${clampW}" height="${clampH}" alt="${effectiveLabel}" />`}
          </pre>
        </div>
      )}
    </div>
  );
}
