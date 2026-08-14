"use client";

import { useRef, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

type ImageFormat = "image/png" | "image/jpeg";
type Scale = 1 | 2 | 3;

interface PageResult {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export function PdfToImagesForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [format, setFormat] = useState<ImageFormat>("image/png");
  const [scale, setScale] = useState<Scale>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [pages, setPages] = useState<PageResult[]>([]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFile = (incoming: File | null) => {
    if (!incoming) return;
    if (incoming.type !== "application/pdf" && !incoming.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a PDF file.");
      return;
    }
    setFile(incoming);
    setPages([]);
    setProgress(null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  };

  const handleProcess = async () => {
    if (!file) {
      toast.error("Upload a PDF first.");
      return;
    }

    fire("process_start", { tool_id: "pdf-to-images" });
    setIsProcessing(true);
    setPages([]);
    setProgress(null);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/_next/static/chunks/pdf.worker.min.mjs";

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ done: 0, total: numPages });

      const results: PageResult[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress({ done: i - 1, total: numPages });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get 2D canvas context.");

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const dataUrl = canvas.toDataURL(format, format === "image/jpeg" ? 0.92 : undefined);

        results.push({
          pageNumber: i,
          dataUrl,
          width: viewport.width,
          height: viewport.height,
        });

        setProgress({ done: i, total: numPages });
      }

      setPages(results);
      toast.success(`Extracted ${results.length} page${results.length === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not process this PDF.");
      fire("process_error", {
        tool_id: "pdf-to-images",
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownloadZip = async () => {
    if (pages.length === 0) return;

    fire("download_click", { tool_id: "pdf-to-images", output_type: "application/zip" });

    try {
      // @ts-ignore
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const ext = format === "image/png" ? "png" : "jpg";
      const baseName = file ? file.name.replace(/\.pdf$/i, "") : "page";

      for (const p of pages) {
        const res = await fetch(p.dataUrl);
        const blob = await res.blob();
        zip.file(`${baseName}-page-${p.pageNumber}.${ext}`, blob);
      }

      const zipBlob: Blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pdf-pages.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create ZIP.");
    }
  };

  const handleStartOver = () => {
    setFile(null);
    setPages([]);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop PDF here or click to browse"
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
          isDragging
            ? "border-primary-500 bg-primary-500/5"
            : "border-surface-border bg-surface-2 hover:border-primary-500/60"
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
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={onInputChange}
        />
        {file ? (
          <div className="text-center">
            <p className="font-medium text-surface-fg">{file.name}</p>
            <p className="text-body-sm text-surface-fg-muted">{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium text-surface-fg">Drop your PDF here</p>
            <p className="text-body-sm text-surface-fg-muted">or click to browse — up to 50 MB</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Format */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-surface-fg" htmlFor="img-format">
            Image format
          </label>
          <select
            id="img-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as ImageFormat)}
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="image/png">PNG — lossless, larger files</option>
            <option value="image/jpeg">JPEG — smaller files, slight loss</option>
          </select>
        </div>

        {/* Scale */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-surface-fg" htmlFor="img-scale">
            Render scale
          </label>
          <select
            id="img-scale"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value) as Scale)}
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={1}>1x — screen resolution, smallest files</option>
            <option value={2}>2x — sharp, good default</option>
            <option value={3}>3x — very high quality, large files</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={!file || isProcessing}
          onClick={handleProcess}
        >
          {isProcessing ? "Extracting…" : "Extract pages"}
        </Button>
        {file && (
          <Button variant="soft" onClick={handleStartOver} disabled={isProcessing}>
            Start over
          </Button>
        )}
      </div>

      {/* Progress */}
      {progress && (
        <p className="text-body-sm text-surface-fg-muted" role="status" aria-live="polite">
          {progress.done < progress.total
            ? `Rendering page ${progress.done + 1} of ${progress.total}…`
            : `Rendered ${progress.total} page${progress.total === 1 ? "" : "s"}.`}
        </p>
      )}

      {/* Results */}
      {pages.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-body-sm font-medium text-surface-fg">
              {pages.length} page{pages.length === 1 ? "" : "s"} extracted
            </p>
            <Button onClick={handleDownloadZip}>
              Download all as ZIP
            </Button>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <li
                key={p.pageNumber}
                className="space-y-2 rounded-md border border-surface-border bg-surface-1 p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.dataUrl}
                  alt={`Page ${p.pageNumber}`}
                  className="block max-h-52 w-full rounded border border-surface-border object-contain"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-body-xs text-surface-fg-muted">
                    Page {p.pageNumber} · {Math.round(p.width)}×{Math.round(p.height)} px
                  </span>
                  <a
                    href={p.dataUrl}
                    download={`${file?.name.replace(/\.pdf$/i, "") ?? "page"}-page-${p.pageNumber}.${format === "image/png" ? "png" : "jpg"}`}
                    className="text-body-xs font-medium text-primary-600 hover:underline"
                  >
                    Save
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
