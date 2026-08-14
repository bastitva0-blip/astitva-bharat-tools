"use client";

import { useRef, useState } from "react";
import { Trash2, ChevronUp, ChevronDown, Upload, Check } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

interface PageItem {
  originalIndex: number;
  dataUrl: string;
}

export function PdfPageManagerForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("");
  const [analyticsStartFired, setAnalyticsStartFired] = useState(false);

  function fireStartOnce() {
    if (!analyticsStartFired) {
      fire("process_start", { tool_id: "pdf-page-manager" });
      setAnalyticsStartFired(true);
    }
  }

  async function handleFile(f: File) {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setDownloadUrl(null);
    setDownloadName("");
    setPages([]);
    setRendering(true);
    fireStartOnce();

    try {
      const buffer = await f.arrayBuffer();
      setFileBuffer(buffer);

      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
      GlobalWorkerOptions.workerSrc = "/_next/static/chunks/pdf.worker.min.mjs";

      const loadingTask = getDocument({ data: buffer.slice(0) });
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;
      const items: PageItem[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        items.push({ originalIndex: i - 1, dataUrl });
      }

      setPages(items);
    } catch {
      toast.error("Could not read PDF. The file may be corrupted or password-protected.");
      setFile(null);
      setFileBuffer(null);
    } finally {
      setRendering(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function movePage(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= pages.length) return;
    const updated = [...pages];
    [updated[index], updated[next]] = [updated[next], updated[index]];
    setPages(updated);
  }

  function deletePage(index: number) {
    if (pages.length === 1) {
      toast.error("A PDF must have at least one page.");
      return;
    }
    setPages(pages.filter((_, i) => i !== index));
  }

  function reset() {
    setFile(null);
    setFileBuffer(null);
    setPages([]);
    setDownloadUrl(null);
    setDownloadName("");
    setAnalyticsStartFired(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleApply() {
    if (!fileBuffer || pages.length === 0) return;
    setLoading(true);
    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const srcDoc = await PDFDocument.load(fileBuffer.slice(0));
      const outDoc = await PDFDocument.create();
      const indices = pages.map((p) => p.originalIndex);
      const copied = await outDoc.copyPages(srcDoc, indices);
      for (const page of copied) {
        outDoc.addPage(page);
      }
      const bytes = await outDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const outName = `reordered-${file?.name ?? "document.pdf"}`;
      setDownloadUrl(url);
      setDownloadName(outName);
    } catch {
      toast.error("Could not process PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    fire("download_click", { tool_id: "pdf-page-manager", output_type: "application/pdf" });
  }

  if (downloadUrl) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-surface-border bg-surface p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
          <Check className="size-8 text-green-500" aria-hidden />
        </div>
        <div>
          <p className="text-body-lg font-semibold text-surface-fg">PDF ready</p>
          <p className="mt-1 text-body-sm text-surface-fg-muted">
            Your reordered PDF is ready to download.
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
    <div className="flex flex-col gap-6">
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
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-surface-fg">{file.name}</p>
            <p className="text-body-xs text-surface-fg-muted">
              {rendering ? "Rendering thumbnails…" : `${pages.length} page${pages.length !== 1 ? "s" : ""}`}
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
      )}

      {/* Page thumbnails */}
      {pages.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-body-sm font-medium text-surface-fg">
            Pages — use arrows to reorder, trash to delete
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {pages.map((page, idx) => (
              <div
                key={`${page.originalIndex}-${idx}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-surface-border bg-surface p-2"
              >
                <img
                  src={page.dataUrl}
                  alt={`Page ${idx + 1}`}
                  width={120}
                  height={170}
                  className="rounded object-contain"
                  style={{ width: 120, height: 170 }}
                />
                <p className="text-body-xs text-surface-fg-muted">Page {idx + 1}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Move page ${idx + 1} up`}
                    disabled={idx === 0}
                    onClick={() => movePage(idx, -1)}
                    className="rounded p-1 text-surface-fg-muted hover:bg-surface-raised hover:text-surface-fg disabled:opacity-30"
                  >
                    <ChevronUp className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move page ${idx + 1} down`}
                    disabled={idx === pages.length - 1}
                    onClick={() => movePage(idx, 1)}
                    className="rounded p-1 text-surface-fg-muted hover:bg-surface-raised hover:text-surface-fg disabled:opacity-30"
                  >
                    <ChevronDown className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete page ${idx + 1}`}
                    onClick={() => deletePage(idx)}
                    className="rounded p-1 text-surface-fg-muted hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pages.length > 0 && (
        <Button
          type="button"
          variant="solid"
          size="lg"
          disabled={loading}
          className="w-full"
          onClick={handleApply}
        >
          {loading ? "Processing…" : "Apply & Download"}
        </Button>
      )}
    </div>
  );
}
