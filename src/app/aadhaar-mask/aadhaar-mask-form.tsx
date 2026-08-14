"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type RedactColor = "black" | "white" | "custom";

const MAX_DIM = 4000;

export function AadhaarMaskForm() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<Rect | null>(null);
  const [redactColor, setRedactColor] = useState<RedactColor>("black");
  const [customColor, setCustomColor] = useState("#000000");
  const [dragOver, setDragOver] = useState(false);
  const [hasFiredStart, setHasFiredStart] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFillColor = useCallback(() => {
    if (redactColor === "black") return "#000000";
    if (redactColor === "white") return "#ffffff";
    return customColor;
  }, [redactColor, customColor]);

  // Redraw canvas whenever image, rects, or preview changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    const fill = getFillColor();
    ctx.fillStyle = fill;
    for (const r of rects) {
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }

    if (preview) {
      ctx.fillStyle = "rgba(220, 38, 38, 0.45)";
      ctx.fillRect(preview.x, preview.y, preview.w, preview.h);
    }
  }, [image, rects, preview, getFillColor]);

  function loadImage(file: File) {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error("Only JPEG, PNG, and WebP images are supported.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = Math.min(img.naturalWidth, MAX_DIM);
      const h = Math.min(img.naturalHeight, MAX_DIM);
      canvas.width = w;
      canvas.height = h;
      setImage(img);
      setRects([]);
      setPreview(null);
      setHasFiredStart(false);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Could not load image.");
    };
    img.src = url;
  }

  function getCanvasCoords(
    clientX: number,
    clientY: number,
  ): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!image) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setDragging(true);
    setDragStart({ x, y });
    setPreview({ x, y, w: 0, h: 0 });
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragging || !dragStart) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    setPreview({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    });
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragging || !dragStart) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const rect: Rect = {
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    };
    setDragging(false);
    setDragStart(null);
    setPreview(null);
    if (rect.w < 2 || rect.h < 2) return;

    if (!hasFiredStart) {
      fire("process_start", { tool_id: "aadhaar-mask" });
      setHasFiredStart(true);
    }
    setRects((prev) => [...prev, rect]);
  }

  function handleMouseLeave() {
    if (dragging && dragStart) {
      setDragging(false);
      setDragStart(null);
      setPreview(null);
    }
  }

  // Touch support
  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    if (!image) return;
    e.preventDefault();
    const touch = e.touches[0];
    const { x, y } = getCanvasCoords(touch.clientX, touch.clientY);
    setDragging(true);
    setDragStart({ x, y });
    setPreview({ x, y, w: 0, h: 0 });
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    if (!dragging || !dragStart) return;
    e.preventDefault();
    const touch = e.touches[0];
    const { x, y } = getCanvasCoords(touch.clientX, touch.clientY);
    setPreview({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    });
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
    if (!dragging || !dragStart) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const { x, y } = getCanvasCoords(touch.clientX, touch.clientY);
    const rect: Rect = {
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    };
    setDragging(false);
    setDragStart(null);
    setPreview(null);
    if (rect.w < 2 || rect.h < 2) return;

    if (!hasFiredStart) {
      fire("process_start", { tool_id: "aadhaar-mask" });
      setHasFiredStart(true);
    }
    setRects((prev) => [...prev, rect]);
  }

  function handleUndo() {
    setRects((prev) => prev.slice(0, -1));
  }

  function handleClear() {
    setRects([]);
    setHasFiredStart(false);
  }

  async function handleDownload() {
    if (!image) {
      toast.error("No image loaded.");
      return;
    }

    const w = Math.min(image.naturalWidth, MAX_DIM);
    const h = Math.min(image.naturalHeight, MAX_DIM);

    let offscreen: OffscreenCanvas | HTMLCanvasElement;
    let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

    if (typeof OffscreenCanvas !== "undefined") {
      offscreen = new OffscreenCanvas(w, h);
      ctx = offscreen.getContext("2d") as OffscreenCanvasRenderingContext2D;
    } else {
      const el = document.createElement("canvas");
      el.width = w;
      el.height = h;
      offscreen = el;
      ctx = el.getContext("2d");
    }

    if (!ctx) {
      toast.error("Could not create export canvas.");
      return;
    }

    ctx.drawImage(image, 0, 0, w, h);
    const fill = getFillColor();
    ctx.fillStyle = fill;
    for (const r of rects) {
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }

    try {
      let blob: Blob;
      if (offscreen instanceof OffscreenCanvas) {
        blob = await offscreen.convertToBlob({ type: "image/png" });
      } else {
        blob = await new Promise<Blob>((resolve, reject) => {
          (offscreen as HTMLCanvasElement).toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error("toBlob returned null"));
          }, "image/png");
        });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aadhaar-masked.png";
      a.click();
      URL.revokeObjectURL(url);

      fire("download_click", { tool_id: "aadhaar-mask", output_type: "image/png" });
    } catch {
      toast.error("Failed to export image.");
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-4">
      {/* Upload area — shown when no image loaded */}
      {!image && (
        <div
          className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors ${
            dragOver
              ? "border-[var(--bt-saffron-ink)] bg-[var(--bt-saffron-ink)]/5"
              : "border-surface-border-subtle bg-surface-1 hover:border-[var(--bt-saffron-ink)]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="h-10 w-10 text-surface-fg-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-body-sm font-medium text-surface-fg">
            Drop your Aadhaar image here, or click to browse
          </p>
          <p className="text-body-xs text-surface-fg-muted">JPEG, PNG, WebP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Canvas editor */}
      {image && (
        <>
          <div className="relative overflow-hidden rounded-xl border border-surface-border-subtle bg-surface-1">
            <canvas
              ref={canvasRef}
              className="block w-full touch-none"
              style={{ cursor: "crosshair", maxHeight: "70vh", objectFit: "contain" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={rects.length === 0}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Undo last
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={rects.length === 0}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear all
            </Button>

            {/* Redaction color picker */}
            <div className="flex items-center gap-2 rounded-lg border border-surface-border-subtle px-3 py-1.5">
              <span className="text-body-xs text-surface-fg-muted">Redact with</span>
              {(["black", "white"] as RedactColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setRedactColor(c)}
                  className={`rounded-full border px-2.5 py-0.5 text-body-xs font-medium capitalize transition-colors ${
                    redactColor === c
                      ? "border-[var(--bt-saffron-ink)] bg-[var(--bt-saffron-ink)] text-white"
                      : "border-surface-border-subtle bg-surface-2 text-surface-fg hover:border-[var(--bt-saffron-ink)]"
                  }`}
                >
                  {c}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setRedactColor("custom")}
                className={`rounded-full border px-2.5 py-0.5 text-body-xs font-medium transition-colors ${
                  redactColor === "custom"
                    ? "border-[var(--bt-saffron-ink)] bg-[var(--bt-saffron-ink)] text-white"
                    : "border-surface-border-subtle bg-surface-2 text-surface-fg hover:border-[var(--bt-saffron-ink)]"
                }`}
              >
                Custom
              </button>
              {redactColor === "custom" && (
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border-0 p-0"
                />
              )}
            </div>

            {/* Load different image */}
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setRects([]);
                setPreview(null);
                setHasFiredStart(false);
              }}
              className="text-body-xs text-surface-fg-muted underline underline-offset-2 hover:text-surface-fg"
            >
              Change image
            </button>

            {/* Download */}
            <div className="ml-auto">
              <Button onClick={handleDownload}>
                <Download className="mr-1.5 h-4 w-4" />
                Download masked PNG
              </Button>
            </div>
          </div>

          {rects.length === 0 && (
            <p className="text-body-xs text-surface-fg-muted">
              Drag over the Aadhaar number to draw a redaction bar. You can draw multiple bars.
            </p>
          )}
          {rects.length > 0 && (
            <p className="text-body-xs text-surface-fg-muted">
              {rects.length} redaction bar{rects.length !== 1 ? "s" : ""} drawn. Download when ready.
            </p>
          )}
        </>
      )}
    </div>
  );
}
