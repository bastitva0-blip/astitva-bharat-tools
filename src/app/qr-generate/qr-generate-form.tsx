"use client";

import { useCallback, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { Slider } from "@devalok/shilp-sutra/ui/slider";
import { GenerateShell, type GenerateResult } from "@/components/tool-shells";
import { fire } from "@/lib/analytics";
import { getToolBySlug } from "@/lib/tools";

type QrContent = "text" | "url" | "upi" | "phone";

interface QrConfig {
  contentType: QrContent;
  value: string;
  size: number; // px
  errorLevel: "L" | "M" | "Q" | "H";
}

const CONTENT_OPTIONS: { id: QrContent; text: string; placeholder: string; prefix?: string }[] = [
  { id: "text", text: "Text", placeholder: "Any text" },
  { id: "url", text: "URL", placeholder: "https://example.com" },
  { id: "upi", text: "UPI", placeholder: "yourname@bank", prefix: "upi://pay?pa=" },
  { id: "phone", text: "Phone", placeholder: "9876543210", prefix: "tel:" },
];

function encodeValue(cfg: QrConfig): string {
  const opt = CONTENT_OPTIONS.find((o) => o.id === cfg.contentType);
  if (!opt) return cfg.value;
  if (opt.id === "upi" && cfg.value) return `upi://pay?pa=${encodeURIComponent(cfg.value)}`;
  if (opt.id === "phone" && cfg.value) return `tel:${cfg.value.replace(/\s+/g, "")}`;
  return cfg.value;
}

export function QrGenerateForm() {
  const tool = getToolBySlug("qr-generate");
  if (!tool) throw new Error("qr-generate tool missing from registry");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // The canvas already reflects the latest config via the live preview; we
  // just serialise whatever's currently rendered.
  const onProcess = useCallback(async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _cfg: QrConfig,
  ): Promise<GenerateResult> => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("QR canvas not mounted");
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
        "image/png",
      );
    });
    return { blob, bytes: blob.size };
  }, []);

  return (
    <GenerateShell<QrConfig>
      tool={tool}
      initialConfig={{ contentType: "url", value: "", size: 320, errorLevel: "M" }}
      submitLabel="Build QR PNG"
      outputType="image/png"
      outputFilename={(cfg) => `bharattools-qr-${cfg.contentType}.png`}
      isReady={(cfg) => cfg.value.trim().length > 0}
      renderConfig={({ config, setConfig }) => {
        const opt = CONTENT_OPTIONS.find((o) => o.id === config.contentType);
        return (
          <>
            <div>
              <Label className="block mb-2">Content type</Label>
              <SegmentedControl
                size="md"
                variant="soft"
                options={CONTENT_OPTIONS.map((o) => ({ id: o.id, text: o.text }))}
                value={config.contentType}
                onValueChange={(id) => {
                  setConfig({ ...config, contentType: id as QrContent, value: "" });
                  fire("preset_selected", { tool_id: tool.slug, preset_id: id });
                }}
              />
            </div>

            <div>
              <Label htmlFor="qr-value" className="block mb-2">
                {opt?.text}
              </Label>
              <Input
                id="qr-value"
                value={config.value}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                placeholder={opt?.placeholder}
              />
              {opt?.prefix && config.value && (
                <p className="mt-1 text-body-xs text-surface-fg-muted break-all">
                  Encodes as: <code className="rounded bg-surface-2 px-1 py-0.5">{encodeValue(config)}</code>
                </p>
              )}
            </div>

            <div>
              <Label className="block mb-2">Size · {config.size} px</Label>
              <Slider
                value={[config.size]}
                onValueChange={(v) => setConfig({ ...config, size: v[0] ?? 320 })}
                min={128}
                max={1024}
                step={32}
              />
            </div>

            <div>
              <Label className="block mb-2">Error correction</Label>
              <SegmentedControl
                size="sm"
                variant="soft"
                options={[
                  { id: "L", text: "L (low)" },
                  { id: "M", text: "M" },
                  { id: "Q", text: "Q" },
                  { id: "H", text: "H (high)" },
                ]}
                value={config.errorLevel}
                onValueChange={(id) =>
                  setConfig({ ...config, errorLevel: id as "L" | "M" | "Q" | "H" })
                }
              />
              <p className="mt-1 text-body-xs text-surface-fg-muted">
                Higher correction = scannable even when partially damaged. M is typical.
              </p>
            </div>
          </>
        );
      }}
      renderLivePreview={(config) =>
        config.value.trim() ? (
          <QRCodeCanvas
            ref={canvasRef}
            value={encodeValue(config)}
            size={Math.min(config.size, 360)}
            level={config.errorLevel}
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#000000"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        ) : (
          <p className="text-body-sm text-surface-fg-muted">Type something to preview the QR.</p>
        )
      }
      onProcess={onProcess}
    />
  );
}
