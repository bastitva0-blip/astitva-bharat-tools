"use client";

import { useRef, useState } from "react";
import { Upload, Check, Wrench } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfRepairForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; pageCount: number } | null>(null);

  function handleFile(f: File) {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setResult(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function repairAndDownload() {
    if (!file) return;
    setLoading(true);
    fire("process_start", { tool_id: "pdf-repair" });
    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false,
      });
      const bytes = await pdfDoc.save();
      const pageCount = pdfDoc.getPageCount();
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const name = `repaired-${file.name}`;
      setResult({ url, name, pageCount });
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      fire("download_click", {
        tool_id: "pdf-repair",
        output_type: "application/pdf",
      });
    } catch {
      toast.error("Could not repair this PDF. The file may be too severely damaged.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Success state
  if (result) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-surface-border bg-surface px-8 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="size-6 text-green-600 dark:text-green-400" aria-hidden />
        </div>
        <div>
          <p className="text-body-md font-semibold text-surface-fg">
            PDF repaired successfully — {result.pageCount} page{result.pageCount !== 1 ? "s" : ""} recovered.
          </p>
          <p className="mt-1 text-body-sm text-surface-fg-muted">
            Your download should have started automatically.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="solid"
            size="md"
            onClick={() => {
              const a = document.createElement("a");
              a.href = result.url;
              a.download = result.name;
              a.click();
              fire("download_click", {
                tool_id: "pdf-repair",
                output_type: "application/pdf",
              });
            }}
          >
            <Wrench className="size-4" aria-hidden />
            Download again
          </Button>
          <Button variant="soft" size="md" onClick={reset}>
            Start over
          </Button>
        </div>
      </div>
    );
  }

  // Drop zone
  if (!file) {
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

  // File ready state
  return (
    <div className="flex flex-col gap-6">
      {/* Explanation banner */}
      <div className="rounded-xl border border-surface-border bg-surface-raised px-4 py-3">
        <p className="text-body-sm text-surface-fg-muted">
          Attempts to recover and re-save a corrupted or damaged PDF. Works best on minor corruption. Severely damaged files may not be recoverable.
        </p>
      </div>

      {/* File info */}
      <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-raised">
          <Wrench className="size-4 text-surface-fg-muted" aria-hidden />
        </div>
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

      {/* Action */}
      <Button
        variant="solid"
        size="lg"
        disabled={loading}
        onClick={repairAndDownload}
        className="w-full"
      >
        <Wrench className="size-4" aria-hidden />
        {loading ? "Repairing…" : "Repair PDF"}
      </Button>

      <p className="text-center text-body-xs text-surface-fg-muted">
        All processing happens in your browser — your file is never uploaded.
      </p>
    </div>
  );
}
