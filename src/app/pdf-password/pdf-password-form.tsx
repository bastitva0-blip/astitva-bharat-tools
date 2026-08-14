"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff, Lock, Upload, Check } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfPasswordForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    setConfirm("");
    setDownloadUrl(null);
    setDownloadName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      fire("process_start", { tool_id: "pdf-password" });

      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      await pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: "highResolution",
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: false,
        },
      });

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const outName = `protected-${file.name}`;

      setDownloadUrl(url);
      setDownloadName(outName);
    } catch {
      toast.error("Could not encrypt PDF. Make sure it isn't already password-protected.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    fire("download_click", { tool_id: "pdf-password", output_type: "application/pdf" });
  }

  // Success state
  if (downloadUrl) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-surface-border bg-surface p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
          <Check className="size-8 text-green-500" aria-hidden />
        </div>
        <div>
          <p className="text-body-lg font-semibold text-surface-fg">PDF encrypted successfully</p>
          <p className="mt-1 text-body-sm text-surface-fg-muted">
            Your password-protected PDF is ready to download.
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
          <Lock className="size-5 shrink-0 text-[var(--bt-saffron-ink)]" aria-hidden />
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

      {/* Password fields */}
      <div className="flex flex-col gap-4">
        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pdf-password" className="text-body-sm font-medium text-surface-fg">
            Password
          </label>
          <div className="relative">
            <input
              id="pdf-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
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
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pdf-confirm" className="text-body-sm font-medium text-surface-fg">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="pdf-confirm"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 pr-10 text-body-sm text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-[var(--bt-saffron-ink)]/50"
            />
            <button
              type="button"
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-surface-fg-muted hover:text-surface-fg"
            >
              {showConfirm ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="solid"
        size="lg"
        disabled={!file || loading}
        className="w-full"
      >
        {loading ? "Encrypting…" : "Protect PDF"}
      </Button>
    </form>
  );
}
