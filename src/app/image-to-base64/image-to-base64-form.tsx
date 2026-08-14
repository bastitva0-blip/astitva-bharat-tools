"use client";

import { useRef, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Normalise input: accept a bare base64 blob or a full data URI. */
function normaliseBase64(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("data:")) return trimmed;
  // Guess a type — we just need something browsers will accept for preview.
  return `data:image/png;base64,${trimmed}`;
}

// ── Encode tab ────────────────────────────────────────────────────────────────

function EncodeTab() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const base64Only = dataUrl ? dataUrl.split(",")[1] ?? "" : "";
  const charCount = dataUrl ? dataUrl.length : 0;
  const approxBytes = Math.round((base64Only.length * 3) / 4);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUrl(result);
      fire("process_start", { tool_id: "image-to-base64" });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else {
      toast.error("Please drop an image file.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const copyDataUri = async () => {
    if (!dataUrl) return;
    try {
      await navigator.clipboard.writeText(dataUrl);
      toast.success("Full data URI copied!");
    } catch {
      toast.error("Clipboard access denied.");
    }
  };

  const copyBase64Only = async () => {
    if (!base64Only) return;
    try {
      await navigator.clipboard.writeText(base64Only);
      toast.success("Base64 string copied!");
    } catch {
      toast.error("Clipboard access denied.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-border bg-surface-1 px-6 py-10 text-center text-body-sm text-surface-fg-muted transition-colors hover:border-primary-500 hover:bg-surface-2"
      >
        <span className="text-body-base font-medium text-surface-fg">Drop an image here</span>
        <span>or click to browse — JPG, PNG, WebP, GIF, SVG</span>
        {fileName && (
          <span className="mt-1 text-body-xs text-primary-600 font-medium">{fileName}</span>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {dataUrl && (
        <>
          {/* Image preview */}
          <div className="overflow-hidden rounded-md border border-surface-border bg-surface-1 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URI preview */}
            <img
              src={dataUrl}
              alt="Encoded image preview"
              className="mx-auto block max-h-64 max-w-full w-auto rounded"
            />
          </div>

          {/* Stats */}
          <p className="text-body-xs text-surface-fg-muted">
            {charCount.toLocaleString()} characters &middot; approx. {formatBytes(approxBytes)} decoded
          </p>

          {/* Full data URI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-medium text-surface-fg">Full Data URI</span>
              <Button size="sm" variant="ghost" onClick={copyDataUri}>
                Copy Data URI
              </Button>
            </div>
            <textarea
              readOnly
              value={dataUrl}
              rows={5}
              className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 font-mono text-body-xs text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none break-all"
            />
          </div>

          {/* Base64 only */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-medium text-surface-fg">Base64 String Only</span>
              <Button size="sm" variant="ghost" onClick={copyBase64Only}>
                Copy Base64
              </Button>
            </div>
            <textarea
              readOnly
              value={base64Only}
              rows={5}
              className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 font-mono text-body-xs text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none break-all"
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Decode tab ────────────────────────────────────────────────────────────────

function DecodeTab() {
  const [input, setInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decode = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.error("Paste a Base64 string first.");
      return;
    }
    fire("process_start", { tool_id: "image-to-base64" });
    setError(null);
    setPreviewUrl(null);

    try {
      const url = normaliseBase64(trimmed);
      // Validate: try decoding the base64 portion
      const b64 = url.split(",")[1] ?? "";
      atob(b64); // throws if invalid
      setPreviewUrl(url);
    } catch {
      setError("Invalid Base64 string — could not decode. Make sure you pasted a valid Base64 or data URI.");
      toast.error("Invalid Base64 string.");
    }
  };

  const download = () => {
    if (!previewUrl) return;
    // Derive extension from MIME type if possible
    const mime = previewUrl.split(";")[0]?.split(":")[1] ?? "image/png";
    const ext = mime.split("/")[1] ?? "png";
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `decoded-image.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    fire("download_click", { tool_id: "image-to-base64", output_type: mime });
  };

  const charCount = input.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="b64-input" className="block text-body-sm font-medium text-surface-fg">
          Paste Base64 string or data URI
        </label>
        <textarea
          id="b64-input"
          value={input}
          onChange={(e) => { setInput(e.target.value); setPreviewUrl(null); setError(null); }}
          rows={7}
          placeholder="data:image/png;base64,iVBORw0K... or just the raw Base64 string"
          className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 font-mono text-body-xs text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y break-all placeholder:text-surface-fg-muted"
        />
        {charCount > 0 && (
          <p className="text-body-xs text-surface-fg-muted">
            {charCount.toLocaleString()} characters pasted
          </p>
        )}
      </div>

      <Button onClick={decode} disabled={!input.trim()}>
        Decode Image
      </Button>

      {error && (
        <p className="rounded-md border border-error-border bg-error-bg px-3 py-2 text-body-sm text-error-fg">
          {error}
        </p>
      )}

      {previewUrl && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-md border border-surface-border bg-surface-1 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URI preview */}
            <img
              src={previewUrl}
              alt="Decoded image"
              className="mx-auto block max-h-64 max-w-full w-auto rounded"
              onError={() => setError("Could not render image — the Base64 data may be corrupt or an unsupported format.")}
            />
          </div>
          <Button onClick={download} variant="outline">
            Download Image
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Root form ─────────────────────────────────────────────────────────────────

type Tab = "encode" | "decode";

export function ImageToBase64Form() {
  const [tab, setTab] = useState<Tab>("encode");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-surface-border bg-surface-1 p-1">
        {(["encode", "decode"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "flex-1 rounded-md px-4 py-2 text-body-sm font-medium capitalize transition-colors",
              tab === t
                ? "bg-primary-600 text-white shadow-sm"
                : "text-surface-fg-muted hover:bg-surface-2 hover:text-surface-fg",
            ].join(" ")}
          >
            {t === "encode" ? "Encode (Image → Base64)" : "Decode (Base64 → Image)"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "encode" ? <EncodeTab /> : <DecodeTab />}
    </div>
  );
}
