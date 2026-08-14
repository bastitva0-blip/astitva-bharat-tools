"use client";

import { useRef, useState } from "react";
import { Upload, Check, Hash } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

type Position =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";

type Format = "n" | "page-n" | "n-of-total" | "page-n-of-total";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "top-center", label: "Top Center" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
];

const FORMATS: { value: Format; label: string }[] = [
  { value: "n", label: "1" },
  { value: "page-n", label: "Page 1" },
  { value: "n-of-total", label: "1 / {total}" },
  { value: "page-n-of-total", label: "Page 1 of {total}" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildLabel(format: Format, pageNum: number, total: number): string {
  switch (format) {
    case "n":
      return String(pageNum);
    case "page-n":
      return `Page ${pageNum}`;
    case "n-of-total":
      return `${pageNum} / ${total}`;
    case "page-n-of-total":
    default:
      return `Page ${pageNum} of ${total}`;
  }
}

function calcXY(
  position: Position,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  fontSize: number,
  margin: number
): { x: number; y: number } {
  let x: number;
  let y: number;

  switch (position) {
    case "bottom-left":
      x = margin;
      y = margin;
      break;
    case "bottom-right":
      x = pageWidth - textWidth - margin;
      y = margin;
      break;
    case "bottom-center":
      x = (pageWidth - textWidth) / 2;
      y = margin;
      break;
    case "top-left":
      x = margin;
      y = pageHeight - fontSize - margin;
      break;
    case "top-right":
      x = pageWidth - textWidth - margin;
      y = pageHeight - fontSize - margin;
      break;
    case "top-center":
      x = (pageWidth - textWidth) / 2;
      y = pageHeight - fontSize - margin;
      break;
    default:
      x = (pageWidth - textWidth) / 2;
      y = margin;
  }

  return { x, y };
}

export function PdfPageNumbersForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [format, setFormat] = useState<Format>("page-n-of-total");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("");

  function handleFile(f: File) {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setDownloadUrl(null);
    setDownloadName("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function reset() {
    setFile(null);
    setDownloadUrl(null);
    setDownloadName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    fire("process_start", { tool_id: "pdf-page-numbers" });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument, rgb } = await import("@cantoo/pdf-lib");
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const total = pages.length;
      const MARGIN = 20;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNum = startNumber + i;
        const label = buildLabel(format, pageNum, total + startNumber - 1);

        // Approximate text width: each character is roughly 0.6 × fontSize wide
        const approxTextWidth = label.length * fontSize * 0.6;
        const { x, y } = calcXY(position, width, height, approxTextWidth, fontSize, MARGIN);

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          color: rgb(0.3, 0.3, 0.3),
        });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const outName = `numbered-${file.name}`;

      setDownloadUrl(url);
      setDownloadName(outName);
    } catch {
      toast.error("Could not add page numbers to this PDF.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    fire("download_click", { tool_id: "pdf-page-numbers", output_type: "application/pdf" });
  }

  // Success state
  if (downloadUrl) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-surface-border bg-surface p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
          <Check className="size-8 text-green-500" aria-hidden />
        </div>
        <div>
          <p className="text-body-lg font-semibold text-surface-fg">Page numbers added successfully</p>
          <p className="mt-1 text-body-sm text-surface-fg-muted">
            Your numbered PDF is ready to download.
          </p>
        </div>
        <Button asChild variant="solid" size="lg" onClick={handleDownload}>
          <a href={downloadUrl} download={downloadName}>
            Download {downloadName}
          </a>
        </Button>
        <button
          type="button"
          onClick={reset}
          className="text-body-sm text-surface-fg-muted underline underline-offset-2 hover:text-surface-fg"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Drop zone */}
      {!file ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload PDF file"
          className="flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-surface-border bg-surface px-8 py-12 text-center transition hover:border-[var(--bt-saffron-ink)] hover:bg-[var(--bt-saffron-ink)]/5"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-surface-raised">
            <Upload className="size-6 text-surface-fg-muted" aria-hidden />
          </div>
          <div>
            <p className="text-body-md font-semibold text-surface-fg">Drop your PDF here</p>
            <p className="mt-1 text-body-sm text-surface-fg-muted">or click to browse — PDF files only</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleInputChange}
            aria-hidden
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3">
          <Hash className="size-5 shrink-0 text-[var(--bt-saffron-ink)]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-surface-fg">{file.name}</p>
            <p className="text-body-xs text-surface-fg-muted">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-body-xs text-surface-fg-muted underline underline-offset-2 hover:text-surface-fg"
          >
            Remove
          </button>
        </div>
      )}

      {/* Options panel */}
      <div className="grid gap-4 rounded-2xl border border-surface-border bg-surface p-5 sm:grid-cols-2">
        {/* Position */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pn-position" className="text-body-sm font-medium text-surface-fg">
            Position
          </label>
          <select
            id="pn-position"
            value={position}
            onChange={(e) => setPosition(e.target.value as Position)}
            className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-[var(--bt-saffron-ink)]/50"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pn-format" className="text-body-sm font-medium text-surface-fg">
            Format
          </label>
          <select
            id="pn-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-[var(--bt-saffron-ink)]/50"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start number */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pn-start" className="text-body-sm font-medium text-surface-fg">
            Start number
          </label>
          <input
            id="pn-start"
            type="number"
            min={1}
            value={startNumber}
            onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-[var(--bt-saffron-ink)]/50"
          />
        </div>

        {/* Font size */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pn-fontsize" className="text-body-sm font-medium text-surface-fg">
            Font size (pt)
          </label>
          <input
            id="pn-fontsize"
            type="number"
            min={8}
            max={24}
            value={fontSize}
            onChange={(e) =>
              setFontSize(Math.min(24, Math.max(8, parseInt(e.target.value, 10) || 12)))
            }
            className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-[var(--bt-saffron-ink)]/50"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="solid"
        size="lg"
        disabled={!file || loading}
        className="w-full"
      >
        {loading ? "Adding page numbers…" : "Add Page Numbers"}
      </Button>
    </form>
  );
}
