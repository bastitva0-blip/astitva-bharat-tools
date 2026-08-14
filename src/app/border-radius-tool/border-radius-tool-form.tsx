"use client";

import { useState, useCallback, useId } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── Types ─────────────────────────────────────────────────────────────────────

type Unit = "px" | "%" | "rem";

interface Corners {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number, unit: Unit): string {
  return `${v}${unit}`;
}

function buildShorthand(c: Corners, unit: Unit): string {
  const tl = fmt(c.tl, unit);
  const tr = fmt(c.tr, unit);
  const br = fmt(c.br, unit);
  const bl = fmt(c.bl, unit);

  // All same
  if (c.tl === c.tr && c.tr === c.br && c.br === c.bl) {
    return `border-radius: ${tl};`;
  }
  // TL==BR and TR==BL
  if (c.tl === c.br && c.tr === c.bl) {
    return `border-radius: ${tl} ${tr};`;
  }
  // TR==BL
  if (c.tr === c.bl) {
    return `border-radius: ${tl} ${tr} ${br};`;
  }
  return `border-radius: ${tl} ${tr} ${br} ${bl};`;
}

function buildLonghand(c: Corners, unit: Unit): string {
  return [
    `border-top-left-radius: ${fmt(c.tl, unit)};`,
    `border-top-right-radius: ${fmt(c.tr, unit)};`,
    `border-bottom-right-radius: ${fmt(c.br, unit)};`,
    `border-bottom-left-radius: ${fmt(c.bl, unit)};`,
  ].join("\n");
}

function buildPreviewStyle(c: Corners, unit: Unit): string {
  return `${fmt(c.tl, unit)} ${fmt(c.tr, unit)} ${fmt(c.br, unit)} ${fmt(c.bl, unit)}`;
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  } catch {
    toast.error("Clipboard access denied.");
  }
}

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS: Array<{ label: string; corners: Corners; unit: Unit }> = [
  {
    label: "Sharp",
    corners: { tl: 0, tr: 0, br: 0, bl: 0 },
    unit: "px",
  },
  {
    label: "Slight",
    corners: { tl: 4, tr: 4, br: 4, bl: 4 },
    unit: "px",
  },
  {
    label: "Rounded",
    corners: { tl: 12, tr: 12, br: 12, bl: 12 },
    unit: "px",
  },
  {
    label: "Pill",
    corners: { tl: 9999, tr: 9999, br: 9999, bl: 9999 },
    unit: "px",
  },
  {
    label: "Circle",
    corners: { tl: 50, tr: 50, br: 50, bl: 50 },
    unit: "%",
  },
];

// ── Corner input ──────────────────────────────────────────────────────────────

function CornerInput({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit: Unit;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const max = unit === "%" ? 100 : unit === "rem" ? 20 : 200;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-body-xs font-medium text-surface-fg-muted"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={0}
          max={max}
          step={unit === "rem" ? 0.25 : 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <input
          type="number"
          min={0}
          max={max}
          step={unit === "rem" ? 0.25 : 1}
          value={value}
          onChange={(e) =>
            onChange(Math.max(0, Math.min(max, Number(e.target.value))))
          }
          className="w-16 rounded-md border border-surface-border bg-surface-2 px-2 py-1.5 text-body-xs text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}

// ── Root form ─────────────────────────────────────────────────────────────────

export function BorderRadiusToolForm() {
  const [corners, setCorners] = useState<Corners>({
    tl: 12,
    tr: 12,
    br: 12,
    bl: 12,
  });
  const [unit, setUnit] = useState<Unit>("px");
  const [linked, setLinked] = useState(true);
  const [fired, setFired] = useState(false);
  const [outputTab, setOutputTab] = useState<"shorthand" | "longhand">(
    "shorthand",
  );

  const touch = useCallback(() => {
    if (!fired) {
      fire("process_start", { tool_id: "border-radius-tool" });
      setFired(true);
    }
  }, [fired]);

  const setCorner = useCallback(
    (key: keyof Corners, value: number) => {
      touch();
      if (linked) {
        setCorners({ tl: value, tr: value, br: value, bl: value });
      } else {
        setCorners((prev) => ({ ...prev, [key]: value }));
      }
    },
    [linked, touch],
  );

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    touch();
    setCorners(preset.corners);
    setUnit(preset.unit);
  };

  const switchUnit = (newUnit: Unit) => {
    touch();
    // Convert values when switching
    const convert = (v: number): number => {
      if (unit === "px" && newUnit === "rem") return Math.round((v / 16) * 4) / 4;
      if (unit === "rem" && newUnit === "px") return Math.round(v * 16);
      if (unit === "%" && newUnit === "px") return Math.round(v * 2);
      if (unit === "px" && newUnit === "%") return Math.min(100, Math.round(v / 2));
      if (unit === "%" && newUnit === "rem") return Math.round((v / 8) * 4) / 4;
      if (unit === "rem" && newUnit === "%") return Math.min(100, Math.round(v * 8));
      return v;
    };
    setCorners((prev) => ({
      tl: convert(prev.tl),
      tr: convert(prev.tr),
      br: convert(prev.br),
      bl: convert(prev.bl),
    }));
    setUnit(newUnit);
  };

  const shorthand = buildShorthand(corners, unit);
  const longhand = buildLonghand(corners, unit);
  const currentOutput = outputTab === "shorthand" ? shorthand : longhand;
  const previewRadius = buildPreviewStyle(corners, unit);

  return (
    <div className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: controls */}
        <div className="space-y-6">
          {/* Unit selector */}
          <div className="space-y-2">
            <p className="text-body-sm font-medium text-surface-fg">Unit</p>
            <div className="flex gap-2">
              {(["px", "%", "rem"] as Unit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => switchUnit(u)}
                  className={[
                    "rounded-md px-4 py-1.5 text-body-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                    unit === u
                      ? "bg-primary-600 text-white"
                      : "bg-surface-2 text-surface-fg hover:bg-surface-3",
                  ].join(" ")}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Link toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-body-sm text-surface-fg">
            <input
              type="checkbox"
              checked={linked}
              onChange={(e) => setLinked(e.target.checked)}
              className="rounded"
            />
            Link all corners
          </label>

          {/* Corner inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Visual layout matching actual corners */}
            <div className="space-y-2 rounded-md border border-surface-border bg-surface-1 p-3">
              <p className="text-body-xs text-surface-fg-muted">Top-left</p>
              <CornerInput
                label="TL"
                value={corners.tl}
                unit={unit}
                onChange={(v) => setCorner("tl", v)}
              />
            </div>
            <div className="space-y-2 rounded-md border border-surface-border bg-surface-1 p-3">
              <p className="text-body-xs text-surface-fg-muted">Top-right</p>
              <CornerInput
                label="TR"
                value={corners.tr}
                unit={unit}
                onChange={(v) => setCorner("tr", v)}
              />
            </div>
            <div className="space-y-2 rounded-md border border-surface-border bg-surface-1 p-3">
              <p className="text-body-xs text-surface-fg-muted">Bottom-left</p>
              <CornerInput
                label="BL"
                value={corners.bl}
                unit={unit}
                onChange={(v) => setCorner("bl", v)}
              />
            </div>
            <div className="space-y-2 rounded-md border border-surface-border bg-surface-1 p-3">
              <p className="text-body-xs text-surface-fg-muted">Bottom-right</p>
              <CornerInput
                label="BR"
                value={corners.br}
                unit={unit}
                onChange={(v) => setCorner("br", v)}
              />
            </div>
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
              className="h-36 w-56 bg-primary-500"
              style={{ borderRadius: previewRadius }}
              aria-label="Border radius preview"
            />
          </div>

          {/* CSS output */}
          <div className="space-y-3 rounded-md border border-surface-border bg-surface-1 p-4">
            <p className="text-body-sm font-semibold text-surface-fg">
              Generated CSS
            </p>
            <div className="flex gap-2">
              {(["shorthand", "longhand"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOutputTab(t)}
                  className={[
                    "rounded-md px-3 py-1.5 text-body-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                    outputTab === t
                      ? "bg-primary-600 text-white"
                      : "bg-surface-2 text-surface-fg hover:bg-surface-3",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
            <pre className="overflow-x-auto rounded-md border border-surface-border bg-surface-2 px-4 py-3 font-mono text-body-xs text-surface-fg whitespace-pre-wrap break-all">
              {currentOutput}
            </pre>
            <Button
              onClick={() =>
                copyText(currentOutput, outputTab === "shorthand" ? "Shorthand CSS" : "Longhand CSS")
              }
              size="sm"
            >
              Copy CSS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
