"use client";

import { useRef, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── helpers ───────────────────────────────────────────────────────────────────

/** Strip <script> tags from SVG code before rendering. */
function sanitizeSvg(code: string): string {
  return code.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
}

interface SvgDims {
  w: number | null;
  h: number | null;
  source: "viewBox" | "attributes" | "none";
}

function parseSvgDims(code: string): SvgDims {
  const viewBox = code.match(/viewBox=["']([^"']+)["']/i)?.[1];
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    const w = parts[2];
    const h = parts[3];
    if (w && h && w > 0 && h > 0) return { w: Math.round(w), h: Math.round(h), source: "viewBox" };
  }
  const wAttr = code.match(/\bwidth=["']([0-9.]+)(px)?["']/i)?.[1];
  const hAttr = code.match(/\bheight=["']([0-9.]+)(px)?["']/i)?.[1];
  const w = wAttr ? Math.round(parseFloat(wAttr)) : null;
  const h = hAttr ? Math.round(parseFloat(hAttr)) : null;
  if (w && h) return { w, h, source: "attributes" };
  return { w: null, h: null, source: "none" };
}

const PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#6366f1" />
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="16">SVG</text>
</svg>`;

// ── Root form ─────────────────────────────────────────────────────────────────

export function SvgViewerForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [svgCode, setSvgCode] = useState(PLACEHOLDER);
  const [fileName, setFileName] = useState("");

  const dims = parseSvgDims(svgCode);
  const sanitized = sanitizeSvg(svgCode);

  // ── load SVG ────────────────────────────────────────────────────────────────

  const loadFile = (file: File) => {
    if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
      toast.error("Please select an SVG file.");
      return;
    }
    fire("process_start", { tool_id: "svg-viewer" });
    const reader = new FileReader();
    reader.onload = () => {
      setSvgCode(reader.result as string);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  // ── actions ─────────────────────────────────────────────────────────────────

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      toast.success("SVG code copied!");
    } catch {
      toast.error("Clipboard access denied.");
    }
  };

  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "image.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    fire("download_click", { tool_id: "svg-viewer", output_type: "image/svg+xml" });
  };

  const clearCode = () => {
    setSvgCode("");
    setFileName("");
  };

  const loadExample = () => {
    setSvgCode(PLACEHOLDER);
    setFileName("example.svg");
    fire("process_start", { tool_id: "svg-viewer" });
  };

  const hasSvg = svgCode.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload SVG
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button size="sm" variant="soft" onClick={loadExample}>
          Load example
        </Button>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="soft" onClick={copyCode} disabled={!hasSvg}>
            Copy code
          </Button>
          <Button size="sm" variant="outline" onClick={downloadSvg} disabled={!hasSvg}>
            Download SVG
          </Button>
          <Button size="sm" variant="soft" onClick={clearCode} disabled={!hasSvg}>
            Clear
          </Button>
        </div>
      </div>

      {/* File name indicator */}
      {fileName && (
        <p className="text-body-xs text-surface-fg-muted">
          Loaded: <span className="font-medium text-surface-fg">{fileName}</span>
        </p>
      )}

      {/* Dimensions badge */}
      {dims.source !== "none" && dims.w && dims.h && (
        <p className="text-body-xs text-surface-fg-muted">
          Dimensions from {dims.source}:{" "}
          <span className="font-medium text-surface-fg">
            {dims.w} &times; {dims.h} px
          </span>
        </p>
      )}

      {/* Drop zone overlay when empty */}
      {!hasSvg && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-border bg-surface-1 px-6 py-10 text-center text-body-sm text-surface-fg-muted transition-colors hover:border-primary-500 hover:bg-surface-2"
        >
          <span className="text-body-base font-medium text-surface-fg">Drop SVG here</span>
          <span>or click to browse, or paste code below</span>
        </div>
      )}

      {/* Split pane: code editor + preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: editor */}
        <div className="space-y-1">
          <label className="block text-body-xs font-medium text-surface-fg-muted uppercase tracking-wide">
            SVG Code
          </label>
          <textarea
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            rows={20}
            spellCheck={false}
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 font-mono text-body-xs text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            placeholder="Paste SVG code here or upload a file above…"
          />
          <p className="text-body-xs text-surface-fg-muted">
            {svgCode.length.toLocaleString()} characters
          </p>
        </div>

        {/* Right: preview */}
        <div className="space-y-1">
          <span className="block text-body-xs font-medium text-surface-fg-muted uppercase tracking-wide">
            Live Preview
          </span>
          <div className="flex min-h-[320px] items-center justify-center overflow-auto rounded-md border border-surface-border bg-surface-1 p-4">
            {hasSvg ? (
              <div
                className="max-w-full max-h-full [&_svg]:max-w-full [&_svg]:h-auto"
                // eslint-disable-next-line react/no-danger -- SVG preview, scripts stripped
                dangerouslySetInnerHTML={{ __html: sanitized }}
              />
            ) : (
              <p className="text-body-sm text-surface-fg-muted">Preview will appear here</p>
            )}
          </div>
          {hasSvg && sanitized !== svgCode && (
            <p className="text-body-xs text-amber-600">
              Script tags were removed for safe preview.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
