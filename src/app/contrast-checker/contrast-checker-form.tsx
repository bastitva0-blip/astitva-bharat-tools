"use client";

import { useState, useCallback, useRef } from "react";
import { fire } from "@/lib/analytics/events";

// --- WCAG luminance helpers ---

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function linearize(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  const L1 = relativeLuminance(...rgb1);
  const L2 = relativeLuminance(...rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Suggest a passing shade ---
// Returns a new hex that adjusts brightness of `hex` until it passes threshold vs `against`
function suggestPassingShade(hex: string, against: string, threshold: number): string | null {
  const rgb = hexToRgb(hex);
  const rgbAgainst = hexToRgb(against);
  if (!rgb || !rgbAgainst) return null;
  const lAgainst = relativeLuminance(...rgbAgainst);

  // Try darkening: multiply each channel
  for (let factor = 0.95; factor >= 0; factor -= 0.02) {
    const r = Math.round(rgb[0] * factor);
    const g = Math.round(rgb[1] * factor);
    const b = Math.round(rgb[2] * factor);
    const L = relativeLuminance(r, g, b);
    const lighter = Math.max(L, lAgainst);
    const darker = Math.min(L, lAgainst);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    if (ratio >= threshold) {
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  }
  // Try lightening
  for (let factor = 1.05; factor <= 10; factor += 0.05) {
    const r = Math.min(255, Math.round(rgb[0] * factor));
    const g = Math.min(255, Math.round(rgb[1] * factor));
    const b = Math.min(255, Math.round(rgb[2] * factor));
    const L = relativeLuminance(r, g, b);
    const lighter = Math.max(L, lAgainst);
    const darker = Math.min(L, lAgainst);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    if (ratio >= threshold) {
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  }
  return null;
}

// --- Badge ---
function PassBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-body-xs font-semibold ${
        pass
          ? "bg-success-100 text-success-700 border border-success-300"
          : "bg-error-100 text-error-700 border border-error-300"
      }`}
    >
      <span aria-hidden="true">{pass ? "✓" : "✗"}</span>
      {label}
    </span>
  );
}

// --- Hex input with picker ---
function ColorInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [hexText, setHexText] = useState(value);

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setHexText(v);
    onChange(v);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHexText(raw);
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    if (hexToRgb(hex)) {
      onChange(hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex);
    }
  };

  // Keep hexText in sync with value when swapped externally
  const prevValue = useRef(value);
  if (prevValue.current !== value) {
    prevValue.current = value;
    if (hexText !== value) {
      setHexText(value);
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block mb-1.5 text-body-sm font-medium text-surface-fg">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.length === 7 ? value : "#000000"}
          onChange={handlePickerChange}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-surface-border p-0.5 bg-surface-1"
          aria-label={`${label} color picker`}
        />
        <input
          id={id}
          type="text"
          value={hexText}
          onChange={handleTextChange}
          maxLength={7}
          placeholder="#000000"
          className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
        />
      </div>
    </div>
  );
}

export function ContrastCheckerForm() {
  const [fg, setFg] = useState("#1a1a1a");
  const [bg, setBg] = useState("#ffffff");
  const [fired, setFired] = useState(false);

  const fireOnce = useCallback(() => {
    if (!fired) {
      fire("process_start", { tool_id: "contrast-checker" });
      setFired(true);
    }
  }, [fired]);

  const handleFgChange = (v: string) => {
    setFg(v);
    fireOnce();
  };

  const handleBgChange = (v: string) => {
    setBg(v);
    fireOnce();
  };

  const swap = () => {
    setFg(bg);
    setBg(fg);
    fireOnce();
  };

  const ratio = contrastRatio(fg, bg);
  const ratioStr = ratio !== null ? ratio.toFixed(2) : null;

  const passAaNormal = ratio !== null && ratio >= 4.5;
  const passAaLarge = ratio !== null && ratio >= 3;
  const passAaaNormal = ratio !== null && ratio >= 7;
  const passAaaLarge = ratio !== null && ratio >= 4.5;

  // Suggestion: if fails AA normal, suggest a fg adjustment
  const suggestion =
    ratio !== null && !passAaNormal
      ? suggestPassingShade(fg, bg, 4.5)
      : null;

  const validColors = hexToRgb(fg) !== null && hexToRgb(bg) !== null;

  return (
    <div className="space-y-6">
      {/* Color inputs */}
      <div className="rounded-xl border border-surface-border bg-surface-1 p-6 space-y-5">
        <h2 className="text-heading-sm font-semibold text-surface-fg">Colors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ColorInput id="fg-color" label="Foreground (Text)" value={fg} onChange={handleFgChange} />
          <ColorInput id="bg-color" label="Background" value={bg} onChange={handleBgChange} />
        </div>
        <button
          type="button"
          onClick={swap}
          className="flex items-center gap-2 rounded-md border border-surface-border bg-surface-2 px-4 py-2 text-body-sm font-medium text-surface-fg hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 16V4m0 0L3 8m4-4 4 4" />
            <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
          </svg>
          Swap Colors
        </button>
      </div>

      {/* Preview */}
      {validColors && (
        <div className="rounded-xl border border-surface-border overflow-hidden">
          <div
            style={{ backgroundColor: bg }}
            className="p-6 space-y-3"
          >
            <p style={{ color: fg }} className="text-2xl font-bold leading-snug">
              Large Text Sample (24px Bold)
            </p>
            <p style={{ color: fg }} className="text-base leading-relaxed">
              Normal text sample — The quick brown fox jumps over the lazy dog. This line demonstrates
              how your foreground color looks on the chosen background at regular body size.
            </p>
            <p style={{ color: fg }} className="text-sm leading-relaxed">
              Small body text — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="px-4 py-2 bg-surface-2 border-t border-surface-border text-body-xs text-surface-fg-muted">
            Live preview — text color <span className="font-mono">{fg}</span> on background{" "}
            <span className="font-mono">{bg}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {ratio !== null && (
        <div className="rounded-xl border border-surface-border bg-surface-1 p-6 space-y-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-body-xs text-surface-fg-muted uppercase tracking-wide font-medium">
                Contrast Ratio
              </p>
              <p className="text-display-sm font-bold text-surface-fg mt-0.5">{ratioStr}:1</p>
            </div>
            <div
              className="w-8 h-8 rounded-full border border-surface-border shrink-0"
              style={{ background: `linear-gradient(135deg, ${fg} 50%, ${bg} 50%)` }}
              aria-hidden="true"
            />
          </div>

          {/* WCAG table */}
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="py-2 px-3 text-left font-semibold text-surface-fg-muted">Level</th>
                  <th className="py-2 px-3 text-left font-semibold text-surface-fg-muted">
                    Normal Text (&lt;18pt)
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-surface-fg-muted">
                    Large Text (18pt+ or 14pt+ bold)
                  </th>
                  <th className="py-2 px-3 text-left font-semibold text-surface-fg-muted">Required Ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-surface-border/50">
                  <td className="py-2.5 px-3 font-semibold text-surface-fg">WCAG AA</td>
                  <td className="py-2.5 px-3">
                    <PassBadge pass={passAaNormal} label={passAaNormal ? "Pass" : "Fail"} />
                  </td>
                  <td className="py-2.5 px-3">
                    <PassBadge pass={passAaLarge} label={passAaLarge ? "Pass" : "Fail"} />
                  </td>
                  <td className="py-2.5 px-3 text-surface-fg-muted">4.5:1 / 3:1</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-surface-fg">WCAG AAA</td>
                  <td className="py-2.5 px-3">
                    <PassBadge pass={passAaaNormal} label={passAaaNormal ? "Pass" : "Fail"} />
                  </td>
                  <td className="py-2.5 px-3">
                    <PassBadge pass={passAaaLarge} label={passAaaLarge ? "Pass" : "Fail"} />
                  </td>
                  <td className="py-2.5 px-3 text-surface-fg-muted">7:1 / 4.5:1</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Suggestion */}
          {suggestion && (
            <div className="rounded-lg bg-warning-50 border border-warning-200 px-4 py-3 flex items-center gap-3 flex-wrap">
              <div>
                <p className="text-body-sm font-medium text-warning-800">
                  Suggested foreground to pass WCAG AA:
                </p>
                <p className="text-body-sm font-mono text-warning-700 mt-0.5">{suggestion}</p>
              </div>
              <div
                className="w-8 h-8 rounded-md border border-warning-300 shrink-0"
                style={{ backgroundColor: suggestion }}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => handleFgChange(suggestion)}
                className="rounded-md bg-warning-600 px-3 py-1.5 text-body-xs font-semibold text-white hover:bg-warning-700 focus:outline-none focus:ring-2 focus:ring-warning-500 transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {/* Guide */}
      <div className="rounded-xl border border-surface-border bg-surface-2 p-5 text-body-sm text-surface-fg-muted space-y-1.5">
        <p className="font-semibold text-surface-fg">WCAG Contrast Quick Reference</p>
        <p>AA Normal text: 4.5:1 minimum &nbsp;|&nbsp; AA Large text: 3:1 minimum</p>
        <p>AAA Normal text: 7:1 minimum &nbsp;|&nbsp; AAA Large text: 4.5:1 minimum</p>
        <p>Large text = 18pt (24px) regular, or 14pt (approximately 18.67px) bold and above.</p>
      </div>
    </div>
  );
}
