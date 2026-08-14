"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

type BarcodeType = {
  bcid: string;
  label: string;
  placeholder: string;
  hint?: string;
};

const BARCODE_TYPES: BarcodeType[] = [
  { bcid: "code128", label: "Code 128", placeholder: "Any text or number", hint: "Encodes any ASCII text." },
  { bcid: "ean13", label: "EAN-13", placeholder: "123456789012 (12 digits)", hint: "12 numeric digits — check digit is computed automatically." },
  { bcid: "ean8", label: "EAN-8", placeholder: "1234567 (7 digits)", hint: "7 numeric digits — check digit is computed automatically." },
  { bcid: "upca", label: "UPC-A", placeholder: "01234567890 (11 digits)", hint: "11 numeric digits — check digit is computed automatically." },
  { bcid: "qrcode", label: "QR Code", placeholder: "URL, text, UPI…", hint: "Encodes any UTF-8 text including URLs." },
  { bcid: "pdf417", label: "PDF417", placeholder: "Any text or number", hint: "High-capacity 2-D barcode." },
  { bcid: "datamatrix", label: "DataMatrix", placeholder: "Any text or number", hint: "Compact 2-D barcode used in logistics and manufacturing." },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function BarcodeGeneratorForm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedBcid, setSelectedBcid] = useState("code128");
  const [text, setText] = useState("BharatTools");
  const [scale, setScale] = useState(3);
  const [height, setHeight] = useState(10);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  const selectedType = BARCODE_TYPES.find((t) => t.bcid === selectedBcid) ?? BARCODE_TYPES[0]!;

  const renderBarcode = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!text.trim()) {
      setRenderError(null);
      setIsRendered(false);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 1;
        canvas.height = 1;
        ctx.clearRect(0, 0, 1, 1);
      }
      return;
    }

    try {
      // @ts-ignore
      const bwipjs = await import("bwip-js");
      bwipjs.toCanvas(canvas, {
        bcid: selectedBcid,
        text: text.trim(),
        scale,
        height,
        includetext: true,
        textxalign: "center",
      });
      setRenderError(null);
      setIsRendered(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setRenderError(message);
      setIsRendered(false);
    }
  }, [selectedBcid, text, scale, height]);

  useEffect(() => {
    void renderBarcode();
  }, [renderBarcode]);

  const handleDownloadPng = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !isRendered) return;

    fire("process_start", { tool_id: "barcode-generator" });

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png");
    });
    if (!blob) {
      toast.error("Failed to export PNG.");
      return;
    }
    fire("download_click", { tool_id: "barcode-generator", output_type: "image/png" });
    downloadBlob(blob, `barcode-${selectedBcid}.png`);
  }, [isRendered, selectedBcid]);

  const handleDownloadSvg = useCallback(async () => {
    if (!text.trim() || !isRendered) return;

    fire("process_start", { tool_id: "barcode-generator" });

    try {
      // @ts-ignore
      const bwipjs = await import("bwip-js");
      const svgString: string = bwipjs.toSVG({
        bcid: selectedBcid,
        text: text.trim(),
        scale,
        height,
        includetext: true,
        textxalign: "center",
      });
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      fire("download_click", { tool_id: "barcode-generator", output_type: "image/svg+xml" });
      downloadBlob(blob, `barcode-${selectedBcid}.svg`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`SVG export failed: ${message}`);
    }
  }, [isRendered, selectedBcid, text, scale, height]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Controls */}
      <div className="flex flex-col gap-6">
        {/* Barcode type */}
        <div>
          <label className="mb-2 block text-body-sm font-medium text-surface-fg">
            Barcode type
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {BARCODE_TYPES.map((t) => (
              <button
                key={t.bcid}
                type="button"
                onClick={() => {
                  setSelectedBcid(t.bcid);
                  setText("");
                }}
                className={[
                  "rounded-md border px-3 py-2 text-body-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                  selectedBcid === t.bcid
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-surface-border bg-surface-1 text-surface-fg hover:bg-surface-2",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>
          {selectedType.hint && (
            <p className="mt-2 text-body-xs text-surface-fg-muted">{selectedType.hint}</p>
          )}
        </div>

        {/* Text input */}
        <div>
          <label htmlFor="barcode-text" className="mb-2 block text-body-sm font-medium text-surface-fg">
            Value to encode
          </label>
          <input
            id="barcode-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={selectedType.placeholder}
            className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Scale slider */}
        <div>
          <label htmlFor="barcode-scale" className="mb-2 block text-body-sm font-medium text-surface-fg">
            Scale &middot; {scale}x
          </label>
          <input
            id="barcode-scale"
            type="range"
            min={1}
            max={5}
            step={1}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="mt-1 flex justify-between text-body-xs text-surface-fg-muted">
            <span>1x (small)</span>
            <span>5x (large)</span>
          </div>
        </div>

        {/* Height (for 1-D barcodes) */}
        {!["qrcode", "datamatrix"].includes(selectedBcid) && (
          <div>
            <label htmlFor="barcode-height" className="mb-2 block text-body-sm font-medium text-surface-fg">
              Bar height &middot; {height} mm
            </label>
            <input
              id="barcode-height"
              type="range"
              min={5}
              max={40}
              step={1}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="mt-1 flex justify-between text-body-xs text-surface-fg-muted">
              <span>5 mm</span>
              <span>40 mm</span>
            </div>
          </div>
        )}

        {/* Download buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            disabled={!isRendered}
            onClick={() => void handleDownloadPng()}
          >
            Download PNG
          </Button>
          <Button
            variant="outline"
            disabled={!isRendered}
            onClick={() => void handleDownloadSvg()}
          >
            Download SVG
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-1 p-6 min-h-[240px]">
        {renderError ? (
          <div className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-700">
            <p className="font-medium">Invalid input</p>
            <p className="mt-1 text-body-xs">{renderError}</p>
          </div>
        ) : text.trim() ? (
          <div className="flex flex-col items-center gap-3">
            <canvas
              ref={canvasRef}
              className="max-w-full"
              style={{ imageRendering: "pixelated" }}
            />
            <p className="text-body-xs text-surface-fg-muted">
              {selectedType.label} &middot; scale {scale}x
              {!["qrcode", "datamatrix"].includes(selectedBcid) && ` · height ${height} mm`}
            </p>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="hidden" />
            <p className="text-body-sm text-surface-fg-muted">
              Enter a value above to preview the barcode.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
