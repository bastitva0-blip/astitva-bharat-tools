"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, ScanText, Copy, Check, Download } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

type LangOption = { value: string; label: string };

const LANG_OPTIONS: LangOption[] = [
  { value: "eng", label: "English" },
  { value: "hin", label: "Hindi" },
  { value: "eng+hin", label: "English + Hindi" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfOcrForm() {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState("eng");
  const [progress, setProgress] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const busy = progress !== null;

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setFile(f);
    setResult(null);
    setCopied(false);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (busy) return;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const extract = async () => {
    if (!file) return;
    setResult(null);
    setCopied(false);

    fire("process_start", { tool_id: "pdf-ocr" });

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "/_next/static/chunks/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const { createWorker } = await import("tesseract.js");
      setProgress(`Loading OCR engine for "${lang}"…`);
      const worker = await createWorker(lang);

      const parts: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress(`Processing page ${i} of ${totalPages}…`);

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const { data } = await worker.recognize(canvas);
        parts.push(`--- Page ${i} ---\n${data.text}`);
      }

      await worker.terminate();

      const fullText = parts.join("\n\n");
      setResult(fullText);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "OCR failed. Please try again.",
      );
    } finally {
      setProgress(null);
    }
  };

  const copyAll = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select and copy manually.");
    }
  };

  const downloadTxt = () => {
    if (!result || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-${baseName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    fire("download_click", { tool_id: "pdf-ocr", output_type: "text/plain" });
  };

  return (
    <div className="space-y-ds-05">
      {/* Language selector */}
      <div className="space-y-ds-02">
        <p className="text-body-sm font-medium text-surface-fg">Language</p>
        <div className="flex flex-wrap gap-2">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLang(opt.value)}
              className={[
                "rounded-md border px-3 py-1.5 text-body-sm font-medium transition-colors",
                lang === opt.value
                  ? "border-accent-7 bg-accent-3 text-accent-11"
                  : "border-surface-border-subtle bg-surface-1 text-surface-fg hover:border-accent-5 hover:bg-accent-2",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={dragRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !busy && inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-border-subtle bg-surface-1 px-ds-04 py-ds-08 text-center transition-colors hover:border-accent-7 hover:bg-accent-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
        aria-disabled={busy}
      >
        <Upload className="size-6 text-surface-fg-subtle" aria-hidden />
        {file ? (
          <>
            <p className="text-body-sm font-medium text-surface-fg">{file.name}</p>
            <p className="text-body-xs text-surface-fg-muted">{formatSize(file.size)}</p>
          </>
        ) : (
          <>
            <p className="text-body-sm font-medium text-surface-fg">
              Drop a scanned PDF here
            </p>
            <p className="text-body-xs text-surface-fg-muted">
              PDF only. OCR runs entirely on your device — nothing is uploaded.
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onInputChange}
          disabled={busy}
        />
      </div>

      {/* Extract button */}
      <Button
        onClick={() => void extract()}
        disabled={!file || busy}
        variant="solid"
        className="w-full"
      >
        <ScanText className="size-4" aria-hidden />
        {busy ? progress : "Extract Text"}
      </Button>

      {/* Result */}
      {result !== null && (
        <div className="space-y-ds-03">
          <textarea
            value={result}
            readOnly
            rows={16}
            aria-label="Extracted text"
            className="w-full resize-y rounded-md border border-surface-border-subtle bg-surface-1 p-3 font-mono text-body-sm text-surface-fg focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void copyAll()} variant="solid">
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              {copied ? "Copied!" : "Copy all text"}
            </Button>
            <Button onClick={downloadTxt} variant="soft">
              <Download className="size-4" aria-hidden />
              Download .txt
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
