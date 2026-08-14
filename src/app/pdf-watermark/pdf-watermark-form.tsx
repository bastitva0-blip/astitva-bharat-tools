"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Check, Stamp } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

type Position = "center-diagonal" | "center-horizontal" | "top-left" | "bottom-right";
type ColorKey = "gray" | "red" | "blue" | "black";

const COLOR_MAP: Record<ColorKey, [number, number, number]> = {
  gray: [0.5, 0.5, 0.5],
  red: [0.8, 0.1, 0.1],
  blue: [0.1, 0.2, 0.8],
  black: [0, 0, 0],
};

interface WatermarkOptions {
  text: string;
  opacity: number;
  position: Position;
  fontSize: number;
  color: ColorKey;
}

interface SuccessState {
  url: string;
  filename: string;
}

export function PdfWatermarkForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [options, setOptions] = useState<WatermarkOptions>({
    text: "",
    opacity: 0.15,
    position: "center-diagonal",
    fontSize: 48,
    color: "gray",
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((incoming: File | null) => {
    if (!incoming) return;
    if (incoming.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }
    setFile(incoming);
    setSuccess(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0] ?? null;
      handleFile(dropped);
    },
    [handleFile],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0] ?? null);
    },
    [handleFile],
  );

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleProcess = async () => {
    if (!file) return;

    const watermarkText = options.text.trim() || "CONFIDENTIAL";

    fire("process_start", { tool_id: "pdf-watermark" });
    setIsProcessing(true);

    try {
      const { PDFDocument, rgb, degrees } = await import("@cantoo/pdf-lib");

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const [r, g, b] = COLOR_MAP[options.color];

      for (const page of pages) {
        const { width, height } = page.getSize();

        let x: number;
        let y: number;
        let angle: number;

        // Approximate text width for centering (rough estimate: fontSize * 0.6 per char)
        const approxTextWidth = watermarkText.length * options.fontSize * 0.6;

        switch (options.position) {
          case "center-diagonal":
            x = width / 2 - approxTextWidth / 2;
            y = height / 2;
            angle = 45;
            break;
          case "center-horizontal":
            x = width / 2 - approxTextWidth / 2;
            y = height / 2;
            angle = 0;
            break;
          case "top-left":
            x = 40;
            y = height - options.fontSize - 40;
            angle = 0;
            break;
          case "bottom-right":
            x = width - approxTextWidth - 40;
            y = 40;
            angle = 0;
            break;
          default:
            x = width / 2 - approxTextWidth / 2;
            y = height / 2;
            angle = 45;
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: options.fontSize,
          opacity: options.opacity,
          color: rgb(r, g, b),
          rotate: degrees(angle),
        });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `watermarked-${file.name}`;

      setSuccess({ url, filename });
      toast.success("Watermark added successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to add watermark: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!success) return;
    fire("download_click", { tool_id: "pdf-watermark", output_type: "application/pdf" });
    const a = document.createElement("a");
    a.href = success.url;
    a.download = success.filename;
    a.click();
  };

  const handleStartOver = () => {
    if (success) URL.revokeObjectURL(success.url);
    setFile(null);
    setSuccess(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border border-surface-border bg-surface-2 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="h-8 w-8" />
        </div>
        <div>
          <p className="text-body-lg font-semibold">Watermark added</p>
          <p className="mt-1 text-body-sm text-surface-fg-muted">{success.filename}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownload}>Download PDF</Button>
          <Button variant="soft" onClick={handleStartOver}>
            Start over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop PDF here or click to browse"
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
          isDragging
            ? "border-accent bg-accent/5"
            : "border-surface-border bg-surface-2 hover:border-accent/60"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={onInputChange}
        />
        <Upload className="h-10 w-10 text-surface-fg-muted" />
        {file ? (
          <div className="text-center">
            <p className="font-medium">{file.name}</p>
            <p className="text-body-sm text-surface-fg-muted">{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium">Drop your PDF here</p>
            <p className="text-body-sm text-surface-fg-muted">or click to browse</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Watermark text */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-body-sm font-medium" htmlFor="wm-text">
            Watermark text
          </label>
          <input
            id="wm-text"
            type="text"
            placeholder="CONFIDENTIAL"
            value={options.text}
            onChange={(e) => setOptions((o) => ({ ...o, text: e.target.value }))}
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium" htmlFor="wm-opacity">
            Opacity — {Math.round(options.opacity * 100)}%
          </label>
          <input
            id="wm-opacity"
            type="range"
            min={0.05}
            max={0.5}
            step={0.01}
            value={options.opacity}
            onChange={(e) => setOptions((o) => ({ ...o, opacity: parseFloat(e.target.value) }))}
            className="w-full accent-accent"
          />
        </div>

        {/* Font size */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium" htmlFor="wm-size">
            Font size (pt)
          </label>
          <input
            id="wm-size"
            type="number"
            min={24}
            max={120}
            value={options.fontSize}
            onChange={(e) =>
              setOptions((o) => ({
                ...o,
                fontSize: Math.min(120, Math.max(24, parseInt(e.target.value, 10) || 48)),
              }))
            }
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Position */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium" htmlFor="wm-position">
            Position
          </label>
          <select
            id="wm-position"
            value={options.position}
            onChange={(e) => setOptions((o) => ({ ...o, position: e.target.value as Position }))}
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="center-diagonal">Center Diagonal</option>
            <option value="center-horizontal">Center Horizontal</option>
            <option value="top-left">Top Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>

        {/* Color */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium" htmlFor="wm-color">
            Color
          </label>
          <select
            id="wm-color"
            value={options.color}
            onChange={(e) => setOptions((o) => ({ ...o, color: e.target.value as ColorKey }))}
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="gray">Gray</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="black">Black</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <Button
        disabled={!file || isProcessing}
        onClick={handleProcess}
        className="w-full sm:w-auto"
      >
        <Stamp className="mr-2 h-4 w-4" />
        {isProcessing ? "Adding watermark…" : "Add Watermark"}
      </Button>
    </div>
  );
}
