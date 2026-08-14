"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── Color utilities ───────────────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

interface PickedColor {
  r: number;
  g: number;
  b: number;
  hex: string;
  hsl: { h: number; s: number; l: number };
}

// ── Palette extraction ────────────────────────────────────────────────────────

/**
 * Sample 500 random pixels from the canvas, quantise into 32-step RGB buckets,
 * and return the top `count` most-frequent colors as HEX strings.
 */
function extractPalette(
  canvas: HTMLCanvasElement,
  count = 10,
): { hex: string; r: number; g: number; b: number }[] {
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const { width, height } = canvas;
  const pixelCount = width * height;
  const sampleSize = Math.min(500, pixelCount);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const colorMap = new Map<string, number>();

  for (let i = 0; i < sampleSize; i++) {
    const idx = Math.floor(Math.random() * pixelCount) * 4;
    if ((data[idx + 3] ?? 0) < 128) continue; // skip transparent
    const r = Math.min(255, Math.round((data[idx] ?? 0) / 32) * 32);
    const g = Math.min(255, Math.round((data[idx + 1] ?? 0) / 32) * 32);
    const b = Math.min(255, Math.round((data[idx + 2] ?? 0) / 32) * 32);
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) ?? 0) + 1);
  }

  return [...colorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const parts = key.split(",").map(Number);
      const r = parts[0] ?? 0;
      const g = parts[1] ?? 0;
      const b = parts[2] ?? 0;
      return { hex: rgbToHex(r, g, b), r, g, b };
    });
}

// ── Copy helper ───────────────────────────────────────────────────────────────

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  } catch {
    toast.error("Clipboard access denied.");
  }
}

// ── Color info panel ──────────────────────────────────────────────────────────

function ColorInfoPanel({ color }: { color: PickedColor }) {
  const { r, g, b, hex, hsl } = color;
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const rows = [
    { label: "HEX", value: hex },
    { label: "RGB", value: rgb },
    { label: "HSL", value: hslStr },
  ];

  return (
    <div className="rounded-md border border-surface-border bg-surface-1 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-md border border-surface-border shadow-sm"
          style={{ backgroundColor: hex }}
          aria-label={`Color swatch ${hex}`}
        />
        <span className="text-body-sm font-semibold text-surface-fg">Picked color</span>
      </div>
      <div className="space-y-2">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="w-10 shrink-0 text-body-xs font-medium text-surface-fg-muted">{label}</span>
            <code className="flex-1 rounded bg-surface-2 px-2 py-0.5 font-mono text-body-xs text-surface-fg break-all">
              {value}
            </code>
            <Button
              size="sm"
              variant="soft"
              onClick={() => copyText(value, label)}
              className="shrink-0"
            >
              Copy
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Palette panel ─────────────────────────────────────────────────────────────

function PalettePanel({
  colors,
}: {
  colors: { hex: string; r: number; g: number; b: number }[];
}) {
  if (colors.length === 0) return null;

  return (
    <div className="rounded-md border border-surface-border bg-surface-1 p-4 space-y-3">
      <span className="text-body-sm font-semibold text-surface-fg">
        Dominant palette ({colors.length} colors)
      </span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {colors.map((c) => (
          <button
            key={c.hex}
            onClick={() => copyText(c.hex, "HEX")}
            title={`Copy ${c.hex}`}
            className="group flex flex-col items-center gap-1 rounded-md border border-surface-border bg-surface-2 p-2 text-center transition-colors hover:border-primary-400 hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <div
              className="h-10 w-full rounded border border-surface-border shadow-sm"
              style={{ backgroundColor: c.hex }}
            />
            <span className="font-mono text-body-xs text-surface-fg">{c.hex}</span>
          </button>
        ))}
      </div>
      <p className="text-body-xs text-surface-fg-muted">Click any swatch to copy its HEX value.</p>
    </div>
  );
}

// ── Root form ─────────────────────────────────────────────────────────────────

export function ImageColorPickerForm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasImage, setHasImage] = useState(false);
  const [pickedColor, setPickedColor] = useState<PickedColor | null>(null);
  const [palette, setPalette] = useState<{ hex: string; r: number; g: number; b: number }[]>([]);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    fire("process_start", { tool_id: "image-color-picker" });
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Constrain to a max display size while keeping aspect ratio
      const MAX = 800;
      const scale = Math.min(1, MAX / img.width, MAX / img.height);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      setHasImage(true);
      setPickedColor(null);
      setCrosshair(null);
      // Extract palette after drawing
      const extracted = extractPalette(canvas);
      setPalette(extracted);
    };
    img.onerror = () => {
      toast.error("Could not load the image.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((e.clientX - rect.left) * scaleX)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((e.clientY - rect.top) * scaleY)));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const d = ctx.getImageData(x, y, 1, 1).data;
    const r = d[0] ?? 0;
    const g = d[1] ?? 0;
    const b = d[2] ?? 0;
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    setPickedColor({ r, g, b, hex, hsl });
    // Crosshair in display coordinates
    setCrosshair({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-border bg-surface-1 px-6 py-10 text-center text-body-sm text-surface-fg-muted transition-colors hover:border-primary-500 hover:bg-surface-2"
      >
        <span className="text-body-base font-medium text-surface-fg">
          {hasImage ? "Replace image" : "Drop an image here"}
        </span>
        <span>or click to browse — JPG, PNG, WebP, GIF, SVG</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Canvas + crosshair */}
      {hasImage && (
        <div className="space-y-2">
          <p className="text-body-xs text-surface-fg-muted">
            Click anywhere on the image to pick a color.
          </p>
          <div className="relative inline-block w-full overflow-auto rounded-md border border-surface-border bg-surface-1 p-2">
            <div className="relative" style={{ display: "inline-block" }}>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="block max-w-full cursor-crosshair rounded"
                style={{ imageRendering: "pixelated" }}
              />
              {crosshair && (
                <div
                  className="pointer-events-none absolute"
                  style={{
                    left: crosshair.x,
                    top: crosshair.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Crosshair rings */}
                  <div className="h-6 w-6 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(0,0,0,0.8)]" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Picked color info */}
      {pickedColor && <ColorInfoPanel color={pickedColor} />}

      {/* Palette */}
      {palette.length > 0 && <PalettePanel colors={palette} />}
    </div>
  );
}
