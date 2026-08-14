"use client";

import { useRef, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── helpers ───────────────────────────────────────────────────────────────────

/** Parse viewBox / width / height from SVG string and return intrinsic dimensions. */
function parseSvgDimensions(svgCode: string): { w: number; h: number } {
  const viewBox = svgCode.match(/viewBox=["']([^"']+)["']/i)?.[1];
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    const vbW = parts[2];
    const vbH = parts[3];
    if (vbW && vbH && vbW > 0 && vbH > 0) return { w: Math.round(vbW), h: Math.round(vbH) };
  }
  const wAttr = svgCode.match(/\bwidth=["']([0-9.]+)(px)?["']/i)?.[1];
  const hAttr = svgCode.match(/\bheight=["']([0-9.]+)(px)?["']/i)?.[1];
  const w = wAttr ? Math.round(parseFloat(wAttr)) : 0;
  const h = hAttr ? Math.round(parseFloat(hAttr)) : 0;
  if (w > 0 && h > 0) return { w, h };
  return { w: 512, h: 512 }; // fallback
}

type Tab = "upload" | "paste";
type Scale = 1 | 2 | 3 | 4;

// ── Root form ─────────────────────────────────────────────────────────────────

export function SvgToPngForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tab, setTab] = useState<Tab>("upload");
  const [svgCode, setSvgCode] = useState("");
  const [fileName, setFileName] = useState("");

  const [width, setWidth] = useState<number>(512);
  const [height, setHeight] = useState<number>(512);
  const [scale, setScale] = useState<Scale>(1);
  const [whiteBackground, setWhiteBackground] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  // ── load SVG ────────────────────────────────────────────────────────────────

  const loadSvgText = (text: string, name = "") => {
    setSvgCode(text);
    setFileName(name);
    setPreviewUrl(null);
    const dims = parseSvgDimensions(text);
    setWidth(dims.w);
    setHeight(dims.h);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
      toast.error("Please select an SVG file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => loadSvgText(reader.result as string, file.name);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
      toast.error("Please drop an SVG file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => loadSvgText(reader.result as string, file.name);
    reader.readAsText(file);
  };

  // ── convert ─────────────────────────────────────────────────────────────────

  const convert = () => {
    if (!svgCode.trim()) {
      toast.error("No SVG code to convert.");
      return;
    }
    fire("process_start", { tool_id: "svg-to-png" });
    setConverting(true);
    setPreviewUrl(null);

    const outW = width * scale;
    const outH = height * scale;

    // Inject explicit width/height so the Image will have known size
    let processed = svgCode.trim();
    // Remove existing width/height attributes on root SVG tag to avoid conflicts
    processed = processed.replace(
      /<svg([^>]*)>/i,
      (_match: string, attrs: string) => {
        const cleaned = attrs
          .replace(/\bwidth=["'][^"']*["']/gi, "")
          .replace(/\bheight=["'][^"']*["']/gi, "");
        return `<svg${cleaned} width="${outW}" height="${outH}">`;
      },
    );

    const blob = new Blob([processed], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("Canvas not supported in this browser.");
        setConverting(false);
        URL.revokeObjectURL(url);
        return;
      }
      if (whiteBackground) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outW, outH);
      } else {
        ctx.clearRect(0, 0, outW, outH);
      }
      ctx.drawImage(img, 0, 0, outW, outH);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (pngBlob) => {
          if (!pngBlob) {
            toast.error("Failed to generate PNG.");
            setConverting(false);
            return;
          }
          const pngUrl = URL.createObjectURL(pngBlob);
          setPreviewUrl(pngUrl);
          setConverting(false);
        },
        "image/png",
      );
    };

    img.onerror = () => {
      toast.error("Could not render SVG. The file may contain unsupported features.");
      setConverting(false);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    const base = fileName ? fileName.replace(/\.svg$/i, "") : "image";
    a.download = `${base}-${width * scale}x${height * scale}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    fire("download_click", { tool_id: "svg-to-png", output_type: "image/png" });
  };

  const hasSvg = svgCode.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-surface-border bg-surface-1 p-1">
        {(["upload", "paste"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPreviewUrl(null); }}
            className={[
              "flex-1 rounded-md px-4 py-2 text-body-sm font-medium transition-colors",
              tab === t
                ? "bg-primary-600 text-white shadow-sm"
                : "text-surface-fg-muted hover:bg-surface-2 hover:text-surface-fg",
            ].join(" ")}
          >
            {t === "upload" ? "Upload SVG File" : "Paste SVG Code"}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-border bg-surface-1 px-6 py-10 text-center text-body-sm text-surface-fg-muted transition-colors hover:border-primary-500 hover:bg-surface-2"
        >
          <span className="text-body-base font-medium text-surface-fg">Drop SVG here</span>
          <span>or click to browse</span>
          {fileName && (
            <span className="mt-1 text-body-xs font-medium text-primary-600">{fileName}</span>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Paste tab */}
      {tab === "paste" && (
        <div className="space-y-2">
          <label className="block text-body-sm font-medium text-surface-fg">
            Paste SVG code
          </label>
          <textarea
            value={svgCode}
            onChange={(e) => {
              loadSvgText(e.target.value);
            }}
            rows={10}
            placeholder="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 100 100&quot;>...</svg>"
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 font-mono text-body-xs text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
          />
        </div>
      )}

      {/* Options */}
      {hasSvg && (
        <div className="rounded-md border border-surface-border bg-surface-1 p-4 space-y-4">
          <span className="block text-body-sm font-semibold text-surface-fg">Output settings</span>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <label className="block text-body-xs font-medium text-surface-fg-muted">Width (px)</label>
              <input
                type="number"
                min={1}
                max={8192}
                value={width}
                onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-body-xs font-medium text-surface-fg-muted">Height (px)</label>
              <input
                type="number"
                min={1}
                max={8192}
                value={height}
                onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-body-xs font-medium text-surface-fg-muted">Scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(parseInt(e.target.value) as Scale)}
                className="w-full rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {([1, 2, 3, 4] as Scale[]).map((s) => (
                  <option key={s} value={s}>{s}x</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end space-y-1">
              <label className="flex items-center gap-2 cursor-pointer text-body-sm text-surface-fg">
                <input
                  type="checkbox"
                  checked={whiteBackground}
                  onChange={(e) => setWhiteBackground(e.target.checked)}
                  className="h-4 w-4 rounded border-surface-border accent-primary-600"
                />
                White background
              </label>
              <p className="text-body-xs text-surface-fg-muted">
                Output: {width * scale} &times; {height * scale} px
              </p>
            </div>
          </div>

          <Button onClick={convert} disabled={converting}>
            {converting ? "Converting…" : "Convert to PNG"}
          </Button>
        </div>
      )}

      {/* Hidden canvas used for rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-4">
          <div className="overflow-auto rounded-md border border-surface-border bg-surface-1 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview */}
            <img
              src={previewUrl}
              alt="PNG preview"
              className="mx-auto block max-h-80 max-w-full w-auto rounded"
            />
          </div>
          <p className="text-body-xs text-surface-fg-muted">
            Output size: {width * scale} &times; {height * scale} px
          </p>
          <Button onClick={download} variant="outline">
            Download PNG
          </Button>
        </div>
      )}
    </div>
  );
}
