"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff, Upload, Check, Unlock } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfUnlockForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    setPassword("");
    setDownloadUrl(null);
    setDownloadName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      fire("process_start", { tool_id: "pdf-unlock" });

      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await import("@cantoo/pdf-lib");

      // First try loading without a password — if it works, the PDF isn't protected.
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer);
        toast.info("This PDF is not password-protected.");
      } catch {
        // PDF is encrypted — try with the supplied password.
        try {
          pdfDoc = await PDFDocument.load(arrayBuffer, { password });
        } catch {
          toast.error("Wrong password or PDF is not encrypted.");
          return;
        }
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const outName = `unlocked-${file.name}`;

      setDownloadUrl(url);
      setDownloadName(outName);
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    fire("download_click", { tool_id: "pdf-unlock", output_type: "application/pdf" });
  }

  // Success state
  if (downloadUrl) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-surface-border bg-surface p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
          <Check className="size-8 text-green-500" aria-hidden />
        </div>
        <div>
          <p className="text-body-lg font-semibold text-surface-fg">PDF unlocked successfully</p>
          <p className="mt-1 text-body-sm text-surface-fg-muted">
            Your unlocked PDF is ready to download.
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
          <Unlock className="size-5 shrink-0 text-[var(--bt-saffron-ink)]" aria-hidden />
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

      {/* Password field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="pdf-unlock-password" className="text-body-sm font-medium text-surface-fg">
          Password
        </label>
        <div className="relative">
          <input
            id="pdf-unlock-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter PDF password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 pr-10 text-body-sm text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-[var(--bt-saffron-ink)]/50"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-surface-fg-muted hover:text-surface-fg"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
        <p className="text-body-xs text-surface-fg-muted">
          Leave blank to check if the PDF is password-protected.
        </p>
      </div>

      <Button
        type="submit"
        variant="solid"
        size="lg"
        disabled={!file || loading}
        className="w-full"
      >
        {loading ? "Unlocking…" : "Unlock PDF"}
      </Button>
    </form>
  );
}
