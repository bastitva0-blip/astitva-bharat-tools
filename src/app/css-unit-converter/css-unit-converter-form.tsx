"use client";

import { useState, useCallback } from "react";
import { fire } from "@/lib/analytics/events";

// ---------------------------------------------------------------------------
// Conversion core
// ---------------------------------------------------------------------------

interface Context {
  baseFontSize: number; // px, root font size (rem base)
  parentFontSize: number; // px, parent element font size (em / % base)
  viewportWidth: number; // px
  viewportHeight: number; // px
}

const PT_PER_PX = 72 / 96; // 0.75pt per px  (1pt = 1.3333px)

function pxToAll(px: number, ctx: Context) {
  return {
    px: round(px, 4),
    rem: round(px / ctx.baseFontSize, 4),
    em: round(px / ctx.parentFontSize, 4),
    pt: round(px * PT_PER_PX, 4),
    vw: round((px / ctx.viewportWidth) * 100, 4),
    vh: round((px / ctx.viewportHeight) * 100, 4),
    pct: round((px / ctx.parentFontSize) * 100, 4),
  };
}

function unitToPx(value: number, unit: string, ctx: Context): number {
  switch (unit) {
    case "px":
      return value;
    case "rem":
      return value * ctx.baseFontSize;
    case "em":
      return value * ctx.parentFontSize;
    case "pt":
      return value / PT_PER_PX;
    case "vw":
      return (value / 100) * ctx.viewportWidth;
    case "vh":
      return (value / 100) * ctx.viewportHeight;
    case "pct":
      return (value / 100) * ctx.parentFontSize;
    default:
      return value;
  }
}

function round(n: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

// ---------------------------------------------------------------------------
// Common spacing reference values in px
// ---------------------------------------------------------------------------
const SPACING_PX = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
const UNIT_LABELS: { key: keyof ReturnType<typeof pxToAll>; label: string }[] = [
  { key: "px", label: "px" },
  { key: "rem", label: "rem" },
  { key: "em", label: "em" },
  { key: "pt", label: "pt" },
  { key: "vw", label: "vw" },
  { key: "vh", label: "vh" },
  { key: "pct", label: "%" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-body-xs font-semibold text-surface-fg-muted uppercase tracking-wide mb-1">
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  step,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="number"
      min={min ?? 0}
      step={step ?? 1}
      value={value}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) onChange(v);
      }}
      className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function CssUnitConverterForm() {
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [parentFontSize, setParentFontSize] = useState(16);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [viewportHeight, setViewportHeight] = useState(900);

  // Active unit input
  const [activeUnit, setActiveUnit] = useState<string>("px");
  const [inputValue, setInputValue] = useState<string>("16");

  const [fired, setFired] = useState(false);

  const ctx: Context = {
    baseFontSize: baseFontSize > 0 ? baseFontSize : 16,
    parentFontSize: parentFontSize > 0 ? parentFontSize : 16,
    viewportWidth: viewportWidth > 0 ? viewportWidth : 1440,
    viewportHeight: viewportHeight > 0 ? viewportHeight : 900,
  };

  const fireOnce = useCallback(() => {
    if (!fired) {
      fire("process_start", { tool_id: "css-unit-converter" });
      setFired(true);
    }
  }, [fired]);

  const handleUnitInput = (unit: string, raw: string) => {
    setActiveUnit(unit);
    setInputValue(raw);
    fireOnce();
  };

  // Compute all values from the active unit input
  const numVal = parseFloat(inputValue);
  const validNum = !isNaN(numVal);

  const allValues = validNum
    ? pxToAll(unitToPx(numVal, activeUnit, ctx), ctx)
    : null;

  const displayFor = (key: string) => {
    if (!allValues) return "";
    if (key === activeUnit) return inputValue;
    return String((allValues as Record<string, number>)[key === "pct" ? "pct" : key] ?? "");
  };

  return (
    <div className="space-y-6">
      {/* Context settings */}
      <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
        <h2 className="text-heading-sm font-semibold text-surface-fg mb-4">Conversion Context</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label>Base font size (px)</Label>
            <NumberInput
              id="base-font-size"
              value={baseFontSize}
              min={1}
              step={1}
              onChange={(v) => { setBaseFontSize(v); fireOnce(); }}
            />
            <p className="mt-1 text-body-xs text-surface-fg-muted">Root / html — used for rem</p>
          </div>
          <div>
            <Label>Parent font size (px)</Label>
            <NumberInput
              id="parent-font-size"
              value={parentFontSize}
              min={1}
              step={1}
              onChange={(v) => { setParentFontSize(v); fireOnce(); }}
            />
            <p className="mt-1 text-body-xs text-surface-fg-muted">Used for em and %</p>
          </div>
          <div>
            <Label>Viewport width (px)</Label>
            <NumberInput
              id="viewport-width"
              value={viewportWidth}
              min={1}
              step={1}
              onChange={(v) => { setViewportWidth(v); fireOnce(); }}
            />
            <p className="mt-1 text-body-xs text-surface-fg-muted">Used for vw</p>
          </div>
          <div>
            <Label>Viewport height (px)</Label>
            <NumberInput
              id="viewport-height"
              value={viewportHeight}
              min={1}
              step={1}
              onChange={(v) => { setViewportHeight(v); fireOnce(); }}
            />
            <p className="mt-1 text-body-xs text-surface-fg-muted">Used for vh</p>
          </div>
        </div>
      </div>

      {/* Unit converter */}
      <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
        <h2 className="text-heading-sm font-semibold text-surface-fg mb-1">Unit Converter</h2>
        <p className="text-body-xs text-surface-fg-muted mb-5">
          Type a value in any field — all other units update instantly.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {UNIT_LABELS.map(({ key, label }) => (
            <div key={key}>
              <Label>{label}</Label>
              <input
                type="number"
                step="any"
                value={activeUnit === key ? inputValue : (allValues ? String((allValues as Record<string, number>)[key]) : "")}
                onChange={(e) => handleUnitInput(key, e.target.value)}
                onFocus={() => {
                  if (allValues) {
                    setInputValue(String((allValues as Record<string, number>)[key]));
                    setActiveUnit(key);
                  }
                }}
                placeholder="0"
                className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                aria-label={`${label} value`}
              />
            </div>
          ))}
        </div>

        {allValues && (
          <div className="mt-5 rounded-lg bg-surface-2 border border-surface-border/60 p-4">
            <p className="text-body-xs text-surface-fg-muted font-medium mb-2">Conversion summary</p>
            <p className="text-body-sm text-surface-fg font-mono leading-relaxed">
              {displayFor(activeUnit)}{activeUnit === "pct" ? "%" : activeUnit}
              {" = "}
              {UNIT_LABELS.filter((u) => u.key !== activeUnit)
                .map((u) => `${displayFor(u.key)}${u.key === "pct" ? "%" : u.key}`)
                .join(" = ")}
            </p>
          </div>
        )}
      </div>

      {/* Quick reference table */}
      <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
        <h2 className="text-heading-sm font-semibold text-surface-fg mb-1">Common Spacing Reference</h2>
        <p className="text-body-xs text-surface-fg-muted mb-4">
          Based on your current context settings. Values update when you change font size or viewport above.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-body-xs">
            <thead>
              <tr className="border-b border-surface-border">
                {UNIT_LABELS.map(({ key, label }) => (
                  <th
                    key={key}
                    className="pb-2 pr-4 text-left font-semibold text-surface-fg-muted uppercase tracking-wide"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPACING_PX.map((px) => {
                const vals = pxToAll(px, ctx);
                return (
                  <tr key={px} className="border-b border-surface-border/50 last:border-0">
                    <td className="py-2 pr-4 font-mono text-surface-fg font-semibold">{vals.px}</td>
                    <td className="py-2 pr-4 font-mono text-surface-fg">{vals.rem}</td>
                    <td className="py-2 pr-4 font-mono text-surface-fg">{vals.em}</td>
                    <td className="py-2 pr-4 font-mono text-surface-fg">{vals.pt}</td>
                    <td className="py-2 pr-4 font-mono text-surface-fg">{vals.vw}</td>
                    <td className="py-2 pr-4 font-mono text-surface-fg">{vals.vh}</td>
                    <td className="py-2 pr-4 font-mono text-surface-fg">{vals.pct}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unit reference info */}
      <div className="rounded-xl border border-surface-border bg-surface-2 p-5">
        <h3 className="text-body-sm font-semibold text-surface-fg mb-3">Unit Reference</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { unit: "px", desc: "Absolute pixels. 1px = 1 device-independent pixel in CSS." },
            { unit: "rem", desc: `Relative to root font size. 1rem = ${baseFontSize}px with your current setting.` },
            { unit: "em", desc: `Relative to parent font size. 1em = ${parentFontSize}px with your current setting.` },
            { unit: "pt", desc: "Points. 1pt = 1.3333px at 96 DPI. Common in print and some design tools." },
            { unit: "vw", desc: `1vw = 1% of viewport width. 1vw = ${round(viewportWidth / 100, 2)}px with your setting.` },
            { unit: "vh", desc: `1vh = 1% of viewport height. 1vh = ${round(viewportHeight / 100, 2)}px with your setting.` },
            { unit: "%", desc: `Percentage of parent font size. 100% = ${parentFontSize}px with your setting.` },
          ].map(({ unit, desc }) => (
            <div key={unit} className="flex gap-2">
              <span className="shrink-0 font-mono text-body-xs font-semibold text-primary-600 w-8">{unit}</span>
              <span className="text-body-xs text-surface-fg-muted">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
