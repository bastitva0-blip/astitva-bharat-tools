"use client";

import { useState, useCallback, useId } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  alpha: number;
  inset: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(alpha / 100).toFixed(2)})`;
}

function layerToCss(l: ShadowLayer): string {
  const rgba = hexToRgba(l.color, l.alpha);
  const inset = l.inset ? "inset " : "";
  return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba}`;
}

function buildBoxShadowCss(layers: ShadowLayer[]): string {
  if (layers.length === 0) return "box-shadow: none;";
  return `box-shadow: ${layers.map(layerToCss).join(",\n            ")};`;
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  } catch {
    toast.error("Clipboard access denied.");
  }
}

function makeId() {
  return Math.random().toString(36).slice(2, 8);
}

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS: Array<{ label: string; layers: Omit<ShadowLayer, "id">[] }> = [
  {
    label: "Subtle",
    layers: [{ x: 0, y: 1, blur: 3, spread: 0, color: "#000000", alpha: 12, inset: false }],
  },
  {
    label: "Card",
    layers: [{ x: 0, y: 4, blur: 6, spread: -1, color: "#000000", alpha: 10, inset: false }],
  },
  {
    label: "Dropdown",
    layers: [
      { x: 0, y: 4, blur: 6, spread: -2, color: "#000000", alpha: 10, inset: false },
      { x: 0, y: 2, blur: 4, spread: -1, color: "#000000", alpha: 6, inset: false },
    ],
  },
  {
    label: "Floating",
    layers: [{ x: 0, y: 20, blur: 25, spread: -5, color: "#000000", alpha: 34, inset: false }],
  },
  {
    label: "Glow Blue",
    layers: [{ x: 0, y: 0, blur: 20, spread: 5, color: "#3b82f6", alpha: 60, inset: false }],
  },
  {
    label: "Sharp",
    layers: [{ x: 4, y: 4, blur: 0, spread: 0, color: "#000000", alpha: 100, inset: false }],
  },
  {
    label: "Inset Press",
    layers: [{ x: 0, y: 2, blur: 4, spread: 0, color: "#000000", alpha: 20, inset: true }],
  },
  {
    label: "Layered",
    layers: [
      { x: 0, y: 2, blur: 4, spread: 0, color: "#000000", alpha: 8, inset: false },
      { x: 0, y: 8, blur: 16, spread: 0, color: "#000000", alpha: 12, inset: false },
      { x: 0, y: 24, blur: 48, spread: 0, color: "#000000", alpha: 16, inset: false },
    ],
  },
];

// ── Default state ─────────────────────────────────────────────────────────────

const DEFAULT_LAYER: ShadowLayer = {
  id: "default",
  x: 0,
  y: 4,
  blur: 6,
  spread: -1,
  color: "#000000",
  alpha: 10,
  inset: false,
};

// ── Layer row ─────────────────────────────────────────────────────────────────

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  unit = "px",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="w-14 shrink-0 text-body-xs text-surface-fg-muted">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Math.max(min, Math.min(max, Number(e.target.value))))
        }
        className="w-16 rounded-md border border-surface-border bg-surface-2 px-2 py-1 text-body-xs text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <span className="w-5 shrink-0 text-body-xs text-surface-fg-muted">{unit}</span>
    </div>
  );
}

function LayerEditor({
  layer,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  layer: ShadowLayer;
  index: number;
  onChange: (l: ShadowLayer) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const update = (patch: Partial<ShadowLayer>) =>
    onChange({ ...layer, ...patch });

  return (
    <div className="space-y-3 rounded-md border border-surface-border bg-surface-1 p-4">
      <div className="flex items-center justify-between">
        <p className="text-body-sm font-semibold text-surface-fg">
          Layer {index + 1}
        </p>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-body-xs text-surface-fg">
            <input
              type="checkbox"
              checked={layer.inset}
              onChange={(e) => update({ inset: e.target.checked })}
              className="rounded"
            />
            Inset
          </label>
          {canRemove && (
            <button
              onClick={onRemove}
              title="Remove layer"
              className="rounded text-surface-fg-muted hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <SliderRow
        label="X offset"
        value={layer.x}
        min={-100}
        max={100}
        onChange={(v) => update({ x: v })}
      />
      <SliderRow
        label="Y offset"
        value={layer.y}
        min={-100}
        max={100}
        onChange={(v) => update({ y: v })}
      />
      <SliderRow
        label="Blur"
        value={layer.blur}
        min={0}
        max={100}
        onChange={(v) => update({ blur: v })}
      />
      <SliderRow
        label="Spread"
        value={layer.spread}
        min={-50}
        max={50}
        onChange={(v) => update({ spread: v })}
      />
      <SliderRow
        label="Opacity"
        value={layer.alpha}
        min={0}
        max={100}
        onChange={(v) => update({ alpha: v })}
        unit="%"
      />

      <div className="flex items-center gap-3">
        <label className="text-body-xs text-surface-fg-muted w-14 shrink-0">Color</label>
        <input
          type="color"
          value={layer.color}
          onChange={(e) => update({ color: e.target.value })}
          className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="font-mono text-body-xs text-surface-fg">{layer.color}</span>
      </div>
    </div>
  );
}

// ── Root form ─────────────────────────────────────────────────────────────────

export function ShadowMakerForm() {
  const [layers, setLayers] = useState<ShadowLayer[]>([DEFAULT_LAYER]);
  const [fired, setFired] = useState(false);

  const touch = useCallback(() => {
    if (!fired) {
      fire("process_start", { tool_id: "shadow-maker" });
      setFired(true);
    }
  }, [fired]);

  const updateLayer = (updated: ShadowLayer) => {
    touch();
    setLayers((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const addLayer = () => {
    if (layers.length >= 5) return;
    touch();
    setLayers((prev) => [
      ...prev,
      { ...DEFAULT_LAYER, id: makeId(), x: 0, y: 8, blur: 16, spread: 0 },
    ]);
  };

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  };

  const applyPreset = (preset: { layers: Omit<ShadowLayer, "id">[] }) => {
    touch();
    setLayers(preset.layers.map((l) => ({ ...l, id: makeId() })));
  };

  const css = buildBoxShadowCss(layers);
  const shadowStyle = layers.map(layerToCss).join(", ");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-body-sm font-semibold text-surface-fg">
              Shadow layers
            </p>
            <Button
              onClick={addLayer}
              size="sm"
              variant="outline"
              disabled={layers.length >= 5}
            >
              + Add layer
            </Button>
          </div>

          <div className="space-y-3">
            {layers.map((layer, i) => (
              <LayerEditor
                key={layer.id}
                layer={layer}
                index={i}
                onChange={updateLayer}
                onRemove={() => removeLayer(layer.id)}
                canRemove={layers.length > 1}
              />
            ))}
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <p className="text-body-sm font-medium text-surface-fg">Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="rounded-md border border-surface-border bg-surface-2 px-3 py-1.5 text-body-xs text-surface-fg transition-colors hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: preview + output */}
        <div className="space-y-5">
          <p className="text-body-sm font-medium text-surface-fg">Preview</p>
          <div className="flex h-56 items-center justify-center rounded-xl bg-surface-3">
            <div
              className="h-32 w-48 rounded-xl bg-surface-1"
              style={{ boxShadow: shadowStyle }}
            />
          </div>

          {/* CSS output */}
          <div className="space-y-3 rounded-md border border-surface-border bg-surface-1 p-4">
            <p className="text-body-sm font-semibold text-surface-fg">
              Generated CSS
            </p>
            <pre className="overflow-x-auto rounded-md border border-surface-border bg-surface-2 px-4 py-3 font-mono text-body-xs text-surface-fg whitespace-pre-wrap break-all">
              {css}
            </pre>
            <Button onClick={() => copyText(css, "CSS")} size="sm">
              Copy CSS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
