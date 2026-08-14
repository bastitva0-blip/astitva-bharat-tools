"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Upload, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

const SCALE = 1.5;

interface PageCanvas {
  dataUrl: string;
  width: number;
  height: number;
  pdfWidth: number;
  pdfHeight: number;
}

interface Rect {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Drawing {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfRedactForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCanvases, setPageCanvases] = useState<PageCanvas[]>([]);
  const [rects, setRects] = useState<Rect[]>([]);
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyticsFirstRect, setAnalyticsFirstRect] = useState(false);

  const currentCanvas = pageCanvases[currentPage - 1] ?? null;
  const currentRects = rects.filter((r) => r.page === currentPage);

  // Draw preview overlay
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || !currentCanvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw committed rects for this page
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    for (const r of currentRects) {
      // Convert PDF coords back to display coords for preview
      const dispX = (r.x / currentCanvas.pdfWidth) * currentCanvas.width;
      const dispY =
        ((currentCanvas.pdfHeight - r.y - r.h) / currentCanvas.pdfHeight) *
        currentCanvas.height;
      const dispW = (r.w / currentCanvas.pdfWidth) * currentCanvas.width;
      const dispH = (r.h / currentCanvas.pdfHeight) * currentCanvas.height;
      ctx.fillRect(dispX, dispY, dispW, dispH);
    }

    // Draw in-progress rect
    if (drawing) {
      const x = Math.min(drawing.startX, drawing.currentX);
      const y = Math.min(drawing.startY, drawing.currentY);
      const w = Math.abs(drawing.currentX - drawing.startX);
      const h = Math.abs(drawing.currentY - drawing.startY);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(x, y, w, h);
    }
  }, [drawing, currentRects, currentCanvas]);

  async function renderPages(f: File) {
    setLoading(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/_next/static/chunks/pdf.worker.min.mjs";

      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const count = pdf.numPages;
      setPageCount(count);

      const canvases: PageCanvas[] = [];
      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const pdfViewport = page.getViewport({ scale: 1 });
        canvases.push({
          dataUrl: canvas.toDataURL("image/png"),
          width: viewport.width,
          height: viewport.height,
          pdfWidth: pdfViewport.width,
          pdfHeight: pdfViewport.height,
        });
      }
      setPageCanvases(canvases);
      setCurrentPage(1);
    } catch {
      toast.error("Could not read PDF. Make sure it is a valid PDF file.");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(f: File) {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setRects([]);
    setDrawing(null);
    setPageCanvases([]);
    setPageCount(0);
    setAnalyticsFirstRect(false);
    renderPages(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function getRelativeCoords(
    e: React.MouseEvent<HTMLCanvasElement>
  ): { x: number; y: number } {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = getRelativeCoords(e);
    setDrawing({ startX: x, startY: y, currentX: x, currentY: y });
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const { x, y } = getRelativeCoords(e);
    setDrawing((d) => (d ? { ...d, currentX: x, currentY: y } : null));
  }

  const commitRect = useCallback(() => {
    if (!drawing || !currentCanvas) {
      setDrawing(null);
      return;
    }
    const dispX = Math.min(drawing.startX, drawing.currentX);
    const dispY = Math.min(drawing.startY, drawing.currentY);
    const dispW = Math.abs(drawing.currentX - drawing.startX);
    const dispH = Math.abs(drawing.currentY - drawing.startY);

    if (dispW < 4 || dispH < 4) {
      setDrawing(null);
      return;
    }

    // Convert display → PDF coordinate space (bottom-left origin)
    const pdfX = (dispX / currentCanvas.width) * currentCanvas.pdfWidth;
    const pdfY =
      currentCanvas.pdfHeight -
      ((dispY + dispH) / currentCanvas.height) * currentCanvas.pdfHeight;
    const pdfW = (dispW / currentCanvas.width) * currentCanvas.pdfWidth;
    const pdfH = (dispH / currentCanvas.height) * currentCanvas.pdfHeight;

    if (!analyticsFirstRect) {
      fire("process_start", { tool_id: "pdf-redact" });
      setAnalyticsFirstRect(true);
    }

    setRects((prev) => [
      ...prev,
      { page: currentPage, x: pdfX, y: pdfY, w: pdfW, h: pdfH },
    ]);
    setDrawing(null);
  }, [drawing, currentCanvas, currentPage, analyticsFirstRect]);

  function deleteRect(idx: number) {
    const pageRects = currentRects;
    const globalIdx = rects.indexOf(pageRects[idx]);
    setRects((prev) => prev.filter((_, i) => i !== globalIdx));
  }

  async function applyAndDownload() {
    if (!file) return;
    setLoading(true);
    try {
      const { PDFDocument, rgb } = await import("@cantoo/pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      for (const r of rects) {
        const page = pages[r.page - 1];
        if (!page) continue;
        page.drawRectangle({
          x: r.x,
          y: r.y,
          width: r.w,
          height: r.h,
          color: rgb(0, 0, 0),
        });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redacted-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);

      fire("download_click", {
        tool_id: "pdf-redact",
        output_type: "application/pdf",
      });
      toast.success("Redacted PDF downloaded.");
    } catch {
      toast.error("Could not apply redactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setPageCanvases([]);
    setPageCount(0);
    setCurrentPage(1);
    setRects([]);
    setDrawing(null);
    setAnalyticsFirstRect(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Drop zone
  if (!file || (pageCanvases.length === 0 && !loading)) {
    return (
      <div className="flex flex-col gap-6">
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
            <p className="text-body-md font-semibold text-surface-fg">
              Drop your PDF here
            </p>
            <p className="mt-1 text-body-sm text-surface-fg-muted">
              or click to browse — PDF files only
            </p>
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
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-surface-border bg-surface p-12">
        <p className="text-body-md text-surface-fg-muted">Rendering pages…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* File bar */}
      <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-medium text-surface-fg">
            {file.name}
          </p>
          <p className="text-body-xs text-surface-fg-muted">
            {formatBytes(file.size)} · {pageCount} page{pageCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="shrink-0 text-body-xs text-surface-fg-muted underline underline-offset-2 hover:text-surface-fg"
        >
          Remove
        </button>
      </div>

      {/* Page navigator */}
      <div className="flex items-center justify-between">
        <Button
          variant="soft"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Prev
        </Button>
        <p className="text-body-sm text-surface-fg-muted">
          Page {currentPage} of {pageCount}
        </p>
        <Button
          variant="soft"
          size="sm"
          disabled={currentPage >= pageCount}
          onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>

      {/* Canvas area */}
      {currentCanvas && (
        <div
          className="relative mx-auto overflow-hidden rounded-lg border border-surface-border shadow-sm"
          style={{ width: currentCanvas.width, height: currentCanvas.height, maxWidth: "100%" }}
        >
          {/* Rendered page image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentCanvas.dataUrl}
            alt={`Page ${currentPage}`}
            width={currentCanvas.width}
            height={currentCanvas.height}
            style={{ display: "block", maxWidth: "100%", height: "auto" }}
            draggable={false}
          />
          {/* Drawing overlay */}
          <canvas
            ref={overlayRef}
            width={currentCanvas.width}
            height={currentCanvas.height}
            style={{
              position: "absolute",
              inset: 0,
              cursor: "crosshair",
              touchAction: "none",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={commitRect}
            onMouseLeave={() => {
              if (drawing) commitRect();
            }}
          />
        </div>
      )}

      {/* Rect list for current page */}
      {currentRects.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-body-sm font-medium text-surface-fg">
            Redactions on this page ({currentRects.length})
          </p>
          {currentRects.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface px-3 py-2"
            >
              <div className="size-4 shrink-0 rounded-sm bg-black" aria-hidden />
              <p className="flex-1 text-body-xs text-surface-fg-muted">
                x: {r.x.toFixed(1)}, y: {r.y.toFixed(1)}, w: {r.w.toFixed(1)}, h:{" "}
                {r.h.toFixed(1)}
              </p>
              <button
                type="button"
                aria-label={`Delete redaction ${i + 1}`}
                onClick={() => deleteRect(i)}
                className="shrink-0 text-surface-fg-muted hover:text-red-500"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="solid"
          size="lg"
          disabled={rects.length === 0 || loading}
          onClick={applyAndDownload}
          className="flex-1"
        >
          <Check className="size-4" aria-hidden />
          {loading ? "Applying…" : `Apply & Download (${rects.length} redaction${rects.length !== 1 ? "s" : ""})`}
        </Button>
      </div>

      <p className="text-body-xs text-surface-fg-muted text-center">
        Draw rectangles on the page to mark areas for redaction. All processing happens in your browser.
      </p>
    </div>
  );
}
