"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Download } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics";

type Position =
  | "center-diagonal"
  | "center"
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

type FontSizeKey = "small" | "medium" | "large" | "xl";
type ColorKey = "white" | "black" | "gray" | "red";

const FONT_SIZE_FRACTIONS: Record<FontSizeKey, number> = {
  small: 0.02,
  medium: 0.03,
  large: 0.05,
  xl: 0.08,
};

const COLOR_MAP: Record<ColorKey, string> = {
  white: "#ffffff",
  black: "#000000",
  gray: "#808080",
  red: "#cc0000",
};

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: Position,
  opacity: number,
  fontSizeKey: FontSizeKey,
  colorKey: ColorKey,
  width: number,
  height: number,
): void {
  const fontSize = Math.round(Math.min(width, height) * FONT_SIZE_FRACTIONS[fontSizeKey]);
  if (fontSize < 8) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = COLOR_MAP[colorKey];
  ctx.textBaseline = "middle";

  if (position === "center-diagonal") {
    // Diagonal tiled pattern
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-45 * Math.PI) / 180);
    const metrics = ctx.measureText(text);
    const textW = metrics.width + fontSize * 2;
    const textH = fontSize * 3;
    const diagonal = Math.sqrt(width * width + height * height);
    const cols = Math.ceil(diagonal / textW) + 2;
    const rows = Math.ceil(diagonal / textH) + 2;
    for (let row = -rows; row <= rows; row++) {
      for (let col = -cols; col <= cols; col++) {
        ctx.fillText(text, col * textW, row * textH);
      }
    }
  } else {
    const padding = fontSize * 0.8;
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    let x: number;
    let y: number;

    switch (position) {
      case "center":
        x = width / 2 - textW / 2;
        y = height / 2;
        break;
      case "bottom-right":
        x = width - textW - padding;
        y = height - padding;
        break;
      case "bottom-left":
        x = padding;
        y = height - padding;
        break;
      case "top-right":
        x = width - textW - padding;
        y = padding;
        break;
      case "top-left":
        x = padding;
        y = padding;
        break;
      default:
        x = width / 2 - textW / 2;
        y = height / 2;
    }

    ctx.fillText(text, x, y);
  }

  ctx.restore();
}

export function ImageWatermarkForm() {
  const [file, setFile] = useState<File | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [text, setText] = useState("© Your Name");
  const [opacity, setOpacity] = useState(0.3);
  const [position, setPosition] = useState<Position>("center-diagonal");
  const [fontSizeKey, setFontSizeKey] = useState<FontSizeKey>("medium");
  const [colorKey, setColorKey] = useState<ColorKey>("white");
  const [dragging, setDragging] = useState(false);
  const [firedProcessStart, setFiredProcessStart] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error("Only JPEG, PNG, and WebP images are supported.");
      return;
    }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      setFile(f);
      setFiredProcessStart(false);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      toast.error("Could not load the image. Please try another file.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  // Redraw canvas whenever image or options change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;

    const MAX_W = 600;
    const scale = Math.min(1, MAX_W / imageEl.naturalWidth);
    const displayW = Math.round(imageEl.naturalWidth * scale);
    const displayH = Math.round(imageEl.naturalHeight * scale);

    canvas.width = displayW;
    canvas.height = displayH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, displayW, displayH);
    ctx.drawImage(imageEl, 0, 0, displayW, displayH);
    drawWatermark(ctx, text, position, opacity, fontSizeKey, colorKey, displayW, displayH);
  }, [imageEl, text, opacity, position, fontSizeKey, colorKey]);

  // Fire process_start on first option change after file load
  const fireProcessStart = useCallback(() => {
    if (file && !firedProcessStart) {
      fire("process_start", { tool_id: "image-watermark" });
      setFiredProcessStart(true);
    }
  }, [file, firedProcessStart]);

  const handleOptionChange = useCallback(
    <T,>(setter: (v: T) => void) =>
      (v: T) => {
        setter(v);
        fireProcessStart();
      },
    [fireProcessStart],
  );

  const handleDownload = useCallback(() => {
    if (!imageEl || !file) {
      toast.error("Please upload an image first.");
      return;
    }

    fire("download_click", { tool_id: "image-watermark", output_type: "image/png" });

    const offscreen = document.createElement("canvas");
    offscreen.width = imageEl.naturalWidth;
    offscreen.height = imageEl.naturalHeight;
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      toast.error("Canvas not available. Please try a different browser.");
      return;
    }

    ctx.drawImage(imageEl, 0, 0);
    drawWatermark(
      ctx,
      text,
      position,
      opacity,
      fontSizeKey,
      colorKey,
      imageEl.naturalWidth,
      imageEl.naturalHeight,
    );

    offscreen.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Failed to generate the watermarked image.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `watermarked-${file.name.replace(/\.[^.]+$/, "")}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Watermarked image downloaded.");
      },
      "image/png",
    );
  }, [imageEl, file, text, position, opacity, fontSizeKey, colorKey]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) loadFile(f);
    },
    [loadFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) loadFile(f);
    },
    [loadFile],
  );

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {!imageEl && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          className={[
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors cursor-pointer",
            dragging
              ? "border-accent-8 bg-accent-2"
              : "border-surface-border bg-surface-2 hover:border-accent-7 hover:bg-accent-1",
          ].join(" ")}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
        >
          <Upload className="size-8 text-surface-fg-muted" aria-hidden />
          <div>
            <p className="text-body-sm font-semibold">Drop an image here or click to upload</p>
            <p className="mt-1 text-body-xs text-surface-fg-muted">JPEG, PNG, WebP — up to 25 MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileInput}
            aria-hidden
            tabIndex={-1}
          />
        </div>
      )}

      {/* Options + preview */}
      {imageEl && (
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          {/* Controls */}
          <div className="space-y-5 md:order-2 md:min-w-[220px]">
            <div>
              <label className="block text-body-sm font-medium mb-1" htmlFor="wm-text">
                Watermark text
              </label>
              <input
                id="wm-text"
                type="text"
                value={text}
                placeholder="© Your Name"
                className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm outline-none focus:border-accent-8 focus:ring-2 focus:ring-accent-7/30"
                onChange={(e) => {
                  setText(e.target.value);
                  fireProcessStart();
                }}
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium mb-1" htmlFor="wm-opacity">
                Opacity: {Math.round(opacity * 100)}%
              </label>
              <input
                id="wm-opacity"
                type="range"
                min={5}
                max={80}
                step={1}
                value={Math.round(opacity * 100)}
                className="w-full accent-accent-9"
                onChange={(e) => {
                  handleOptionChange(setOpacity)(Number(e.target.value) / 100);
                }}
              />
              <div className="flex justify-between text-body-xs text-surface-fg-muted mt-0.5">
                <span>5%</span>
                <span>80%</span>
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-medium mb-1" htmlFor="wm-position">
                Position
              </label>
              <select
                id="wm-position"
                value={position}
                className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm outline-none focus:border-accent-8"
                onChange={(e) => handleOptionChange(setPosition)(e.target.value as Position)}
              >
                <option value="center-diagonal">Center Diagonal</option>
                <option value="center">Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium mb-1" htmlFor="wm-font-size">
                Font size
              </label>
              <select
                id="wm-font-size"
                value={fontSizeKey}
                className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm outline-none focus:border-accent-8"
                onChange={(e) => handleOptionChange(setFontSizeKey)(e.target.value as FontSizeKey)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xl">XL</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-medium mb-1" htmlFor="wm-color">
                Color
              </label>
              <select
                id="wm-color"
                value={colorKey}
                className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm outline-none focus:border-accent-8"
                onChange={(e) => handleOptionChange(setColorKey)(e.target.value as ColorKey)}
              >
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="gray">Gray</option>
                <option value="red">Red</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button onClick={handleDownload} className="w-full gap-2">
                <Download className="size-4" aria-hidden />
                Download
              </Button>
              <Button
                variant="soft"
                className="w-full text-body-xs"
                onClick={() => {
                  setFile(null);
                  setImageEl(null);
                  setFiredProcessStart(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Upload a different image
              </Button>
            </div>
          </div>

          {/* Preview canvas */}
          <div className="md:order-1 flex-1 overflow-auto rounded-xl border border-surface-border bg-surface-2 p-3">
            <canvas
              ref={canvasRef}
              className="mx-auto block max-w-full rounded"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
