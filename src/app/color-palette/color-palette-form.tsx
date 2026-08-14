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

interface PaletteColor {
  hex: string;
  r: number;
  g: number;
  b: number;
}

// ── Color quantization ────────────────────────────────────────────────────────

/**
 * Sample 1000 random pixels from the canvas, quantise into 32-step RGB
 * buckets, and return the top `count` most-frequent colors as hex strings.
 */
function extractPalette(
  canvas: HTMLCanvasElement,
  count = 10,
): PaletteColor[] {
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const { width, height } = canvas;
  const pixelCount = width * height;
  const sampleSize = Math.min(1000, pixelCount);
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

// ── Export builders ───────────────────────────────────────────────────────────

function buildCssVars(colors: PaletteColor[]): string {
  const vars = colors
    .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}

function buildTailwind(colors: PaletteColor[]): string {
  const entries = colors
    .map((c, i) => `    '${i + 1}': '${c.hex}',`)
    .join("\n");
  return `colors: {\n${entries}\n}`;
}

function buildHexList(colors: PaletteColor[]): string {
  return colors.map((c) => c.hex).join(", ");
}

// ── Swatch grid ───────────────────────────────────────────────────────────────

function SwatchGrid({ colors }: { colors: PaletteColor[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {colors.map((c, i) => (
        <button
          key={`${c.hex}-${i}`}
          onClick={() => copyText(c.hex, "HEX")}
          title={`Copy ${c.hex}`}
          className="group flex flex-col items-center gap-1.5 rounded-md border border-surface-border bg-surface-2 p-3 text-center transition-colors hover:border-primary-400 hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <div
            className="h-12 w-full rounded border border-surface-border shadow-sm"
            style={{ backgroundColor: c.hex }}
          />
          <span className="font-mono text-body-xs text-surface-fg">
            {c.hex}
          </span>
          <span className="text-body-xs text-surface-fg-muted opacity-0 transition-opacity group-hover:opacity-100">
            Click to copy
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Export panel ──────────────────────────────────────────────────────────────

function ExportPanel({ colors }: { colors: PaletteColor[] }) {
  const [activeTab, setActiveTab] = useState<"css" | "tailwind" | "hex">(
    "css",
  );

  const exports = {
    css: { label: "CSS Variables", build: buildCssVars },
    tailwind: { label: "Tailwind Config", build: buildTailwind },
    hex: { label: "Hex List", build: buildHexList },
  } as const;

  const current = exports[activeTab];
  const output = current.build(colors);

  return (
    <div className="rounded-md border border-surface-border bg-surface-1 p-4 space-y-3">
      <p className="text-body-sm font-semibold text-surface-fg">Export</p>

      {/* Tab row */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(exports) as Array<keyof typeof exports>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={[
              "rounded-md px-3 py-1.5 text-body-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
              activeTab === key
                ? "bg-primary-600 text-white"
                : "bg-surface-2 text-surface-fg hover:bg-surface-3",
            ].join(" ")}
          >
            {exports[key].label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <pre className="overflow-x-auto rounded-md border border-surface-border bg-surface-2 px-4 py-3 font-mono text-body-xs text-surface-fg whitespace-pre-wrap break-all">
        {output}
      </pre>

      <Button
        onClick={() => copyText(output, current.label)}
        size="sm"
      >
        Copy {current.label}
      </Button>
    </div>
  );
}

// ── Root form ─────────────────────────────────────────────────────────────────

export function ColorPaletteForm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [hasImage, setHasImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    fire("process_start", { tool_id: "color-palette" });

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Constrain to max size for sampling
      const MAX = 800;
      const scale = Math.min(1, MAX / img.width, MAX / img.height);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const extracted = extractPalette(canvas);
      setPalette(extracted);
      setHasImage(true);
    };
    img.onerror = () => {
      toast.error("Could not load the image.");
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    };
    img.src = objectUrl;
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

  return (
    <div className="space-y-6">
      {/* Hidden offscreen canvas for pixel sampling */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

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

      {/* Preview thumbnail */}
      {previewUrl && (
        <div className="overflow-hidden rounded-md border border-surface-border bg-surface-1 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Uploaded image preview"
            className="mx-auto max-h-60 max-w-full rounded object-contain"
          />
        </div>
      )}

      {/* Palette swatches */}
      {palette.length > 0 && (
        <div className="space-y-3">
          <p className="text-body-sm font-semibold text-surface-fg">
            Dominant palette ({palette.length} colors)
          </p>
          <SwatchGrid colors={palette} />
          <p className="text-body-xs text-surface-fg-muted">
            Click any swatch to copy its HEX value.
          </p>
        </div>
      )}

      {/* Export panel */}
      {palette.length > 0 && <ExportPanel colors={palette} />}
    </div>
  );
}
