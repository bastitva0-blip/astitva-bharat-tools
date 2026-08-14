"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Check, Crop } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

const MM_TO_PT = 2.835;

interface MarginOptions {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

type ApplyTo = "all" | "first";

interface SuccessState {
  url: string;
  filename: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfCropForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [margins, setMargins] = useState<MarginOptions>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [applyTo, setApplyTo] = useState<ApplyTo>("all");

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

  const setMargin = (key: keyof MarginOptions, value: number) => {
    setMargins((prev) => ({ ...prev, [key]: value }));
  };

  const handleProcess = async () => {
    if (!file) return;

    fire("process_start", { tool_id: "pdf-crop" });
    setIsProcessing(true);

    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      const topPt = margins.top * MM_TO_PT;
      const bottomPt = margins.bottom * MM_TO_PT;
      const leftPt = margins.left * MM_TO_PT;
      const rightPt = margins.right * MM_TO_PT;

      const pagesToProcess = applyTo === "first" ? pages.slice(0, 1) : pages;

      for (const page of pagesToProcess) {
        const { x, y, width, height } = page.getMediaBox();
        page.setCropBox(
          x + leftPt,
          y + bottomPt,
          width - leftPt - rightPt,
          height - bottomPt - topPt,
        );
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `cropped-${file.name}`;

      setSuccess({ url, filename });
      toast.success("PDF cropped successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to crop PDF: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!success) return;
    fire("download_click", { tool_id: "pdf-crop", output_type: "application/pdf" });
    const a = document.createElement("a");
    a.href = success.url;
    a.download = success.filename;
    a.click();
  };

  const handleStartOver = () => {
    if (success) URL.revokeObjectURL(success.url);
    setFile(null);
    setSuccess(null);
    setMargins({ top: 0, bottom: 0, left: 0, right: 0 });
    setApplyTo("all");
    if (inputRef.current) inputRef.current.value = "";
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border border-surface-border bg-surface-2 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="h-8 w-8" />
        </div>
        <div>
          <p className="text-body-lg font-semibold">PDF cropped</p>
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
        <Upload className="h-8 w-8 text-surface-fg-muted" aria-hidden />
        <div className="text-center">
          <p className="text-body-sm font-medium">Drop a PDF here, or click to browse</p>
          <p className="text-body-xs text-surface-fg-muted">PDF files only</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={onInputChange}
        />
      </div>

      {file && (
        <div className="flex items-start justify-between gap-3 rounded-md border border-surface-border-subtle bg-surface-2 p-3 text-body-sm">
          <div className="min-w-0">
            <div className="truncate font-medium">{file.name}</div>
            <div className="text-surface-fg-muted">{formatBytes(file.size)}</div>
          </div>
          <Button
            variant="ghost"
            size="compact-sm"
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            Remove
          </Button>
        </div>
      )}

      {file && (
        <div className="space-y-5 rounded-xl border border-surface-border bg-surface-2 p-6">
          <div>
            <p className="mb-4 text-body-sm font-semibold">Margins to trim (mm)</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(["top", "bottom", "left", "right"] as const).map((side) => (
                <label key={side} className="flex flex-col gap-1.5">
                  <span className="text-body-xs font-medium capitalize text-surface-fg-muted">
                    {side}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={margins[side]}
                    onChange={(e) => setMargin(side, Math.min(50, Math.max(0, Number(e.target.value))))}
                    className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-body-sm font-semibold">Apply to</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-body-sm">
                <input
                  type="radio"
                  name="apply-to"
                  value="all"
                  checked={applyTo === "all"}
                  onChange={() => setApplyTo("all")}
                  className="accent-accent"
                />
                All pages
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-body-sm">
                <input
                  type="radio"
                  name="apply-to"
                  value="first"
                  checked={applyTo === "first"}
                  onChange={() => setApplyTo("first")}
                  className="accent-accent"
                />
                First page only
              </label>
            </div>
          </div>

          <p className="text-body-xs text-surface-fg-muted">
            Margins will be trimmed from each page edge.
          </p>

          <Button
            fullWidth
            size="lg"
            loading={isProcessing}
            disabled={isProcessing}
            onClick={handleProcess}
          >
            <Crop className="mr-2 h-4 w-4" aria-hidden />
            Crop PDF
          </Button>
        </div>
      )}
    </div>
  );
}
