"use client";

import { useState, useCallback, useRef } from "react";
import { fire } from "@/lib/analytics/events";

// ---------------------------------------------------------------------------
// Conversion helpers — pure math, no external lib
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return [h, Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return [h, Math.round(s * 100), Math.round(v * 100)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return [0, 0, 0, 100];
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)];
}

// sRGB → XYZ (D65) → OKLab → oklch
function linearizeC(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const rl = linearizeC(r);
  const gl = linearizeC(g);
  const bl = linearizeC(b);

  // sRGB → XYZ D65
  const x = 0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl;
  const y = 0.2126729 * rl + 0.7151522 * gl + 0.0721750 * bl;
  const z = 0.0193339 * rl + 0.1191920 * gl + 0.9503041 * bl;

  // XYZ → OKLab (Björn Ottosson's linear transform)
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bOklab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + bOklab * bOklab);
  let H = Math.atan2(bOklab, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return [
    Math.round(L * 1000) / 1000,
    Math.round(C * 1000) / 1000,
    Math.round(H * 10) / 10,
  ];
}

// ---------------------------------------------------------------------------
// CSS named colors (subset of common ones)
// ---------------------------------------------------------------------------
const CSS_NAMED_COLORS: Record<string, string> = {
  "#000000": "black",
  "#ffffff": "white",
  "#ff0000": "red",
  "#00ff00": "lime",
  "#0000ff": "blue",
  "#ffff00": "yellow",
  "#00ffff": "cyan",
  "#ff00ff": "magenta",
  "#ffa500": "orange",
  "#800080": "purple",
  "#008000": "green",
  "#800000": "maroon",
  "#000080": "navy",
  "#808000": "olive",
  "#008080": "teal",
  "#c0c0c0": "silver",
  "#808080": "gray",
  "#ffc0cb": "pink",
  "#a52a2a": "brown",
  "#add8e6": "lightblue",
  "#90ee90": "lightgreen",
  "#ffb6c1": "lightpink",
  "#d3d3d3": "lightgray",
  "#f0e68c": "khaki",
  "#e6e6fa": "lavender",
  "#f5deb3": "wheat",
  "#ffe4c4": "bisque",
  "#dda0dd": "plum",
  "#ff69b4": "hotpink",
  "#ff6347": "tomato",
  "#40e0d0": "turquoise",
  "#4b0082": "indigo",
  "#ffe4b5": "moccasin",
  "#b0e0e6": "powderblue",
  "#7fffd4": "aquamarine",
  "#dc143c": "crimson",
  "#00ced1": "darkturquoise",
  "#1e90ff": "dodgerblue",
  "#b22222": "firebrick",
  "#228b22": "forestgreen",
  "#ff7f50": "coral",
  "#daa520": "goldenrod",
  "#adff2f": "greenyellow",
  "#f0fff0": "honeydew",
  "#ff4500": "orangered",
  "#da70d6": "orchid",
  "#f0e6ff": "lavenderblush",
  "#7cfc00": "lawngreen",
  "#fffacd": "lemonchiffon",
  "#20b2aa": "lightseagreen",
  "#87ceeb": "skyblue",
  "#6a5acd": "slateblue",
  "#708090": "slategray",
  "#fffafa": "snow",
  "#00ff7f": "springgreen",
  "#d2b48c": "tan",
  "#ff8c00": "darkorange",
  "#9400d3": "darkviolet",
  "#00bfff": "deepskyblue",
  "#696969": "dimgray",
  "#1c86ee": "dodgerblue3",
  "#b8860b": "darkgoldenrod",
  "#006400": "darkgreen",
  "#bdb76b": "darkkhaki",
  "#8b008b": "darkmagenta",
  "#556b2f": "darkolivegreen",
  "#ff8c00b": "darkorange2",
  "#e9967a": "darksalmon",
  "#8fbc8f": "darkseagreen",
  "#483d8b": "darkslateblue",
  "#2f4f4f": "darkslategray",
  "#9932cc": "darkorchid",
  "#8b0000": "darkred",
};

function namedColor(hex: string): string | null {
  return CSS_NAMED_COLORS[hex.toLowerCase()] ?? null;
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`shrink-0 rounded-md px-2.5 py-1 text-body-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
        copied
          ? "bg-success-100 text-success-700 border border-success-300"
          : "bg-surface-2 text-surface-fg-muted border border-surface-border hover:bg-surface-3"
      }`}
      aria-label={`Copy ${text}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Format row
// ---------------------------------------------------------------------------
function FormatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-surface-border/60 last:border-0">
      <span className="text-body-xs font-semibold text-surface-fg-muted uppercase tracking-wide w-14 shrink-0">
        {label}
      </span>
      <span className="flex-1 font-mono text-body-sm text-surface-fg break-all">{value}</span>
      <CopyButton text={value} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------
export function ColorConvertForm() {
  const [hex, setHex] = useState("#3b82f6");
  const [hexText, setHexText] = useState("#3b82f6");
  const [fired, setFired] = useState(false);

  const fireOnce = useCallback(() => {
    if (!fired) {
      fire("process_start", { tool_id: "color-convert" });
      setFired(true);
    }
  }, [fired]);

  const applyHex = (raw: string) => {
    const h = raw.startsWith("#") ? raw : `#${raw}`;
    const rgb = hexToRgb(h);
    if (rgb) {
      const canonical =
        h.length === 4
          ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
          : h.slice(0, 7).toLowerCase();
      setHex(canonical);
    }
    fireOnce();
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setHex(v);
    setHexText(v);
    fireOnce();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHexText(raw);
    applyHex(raw);
  };

  const rgb = hexToRgb(hex);

  let formats: { label: string; value: string }[] = [];
  let named: string | null = null;

  if (rgb) {
    const [r, g, b] = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);
    const [hv, sv, v] = rgbToHsv(r, g, b);
    const [c, m, y, k] = rgbToCmyk(r, g, b);
    const [oL, oC, oH] = rgbToOklch(r, g, b);
    named = namedColor(rgbToHex(r, g, b));

    formats = [
      { label: "HEX", value: rgbToHex(r, g, b).toUpperCase() },
      { label: "rgb()", value: `rgb(${r}, ${g}, ${b})` },
      { label: "R", value: String(r) },
      { label: "G", value: String(g) },
      { label: "B", value: String(b) },
      { label: "hsl()", value: `hsl(${h}, ${s}%, ${l}%)` },
      { label: "H", value: `${h}°` },
      { label: "S (hsl)", value: `${s}%` },
      { label: "L", value: `${l}%` },
      { label: "hsv()", value: `hsv(${hv}, ${sv}%, ${v}%)` },
      { label: "S (hsv)", value: `${sv}%` },
      { label: "V", value: `${v}%` },
      { label: "cmyk()", value: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)` },
      { label: "C", value: `${c}%` },
      { label: "M", value: `${m}%` },
      { label: "Y", value: `${y}%` },
      { label: "K", value: `${k}%` },
      { label: "oklch", value: `oklch(${oL} ${oC} ${oH})` },
    ];
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="rounded-xl border border-surface-border bg-surface-1 p-6 space-y-5">
        <h2 className="text-heading-sm font-semibold text-surface-fg">Enter a Color</h2>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={hex.length === 7 ? hex : "#3b82f6"}
            onChange={handlePickerChange}
            className="h-12 w-12 shrink-0 cursor-pointer rounded-xl border border-surface-border p-0.5 bg-surface-1"
            aria-label="Color picker"
          />
          <input
            type="text"
            value={hexText}
            onChange={handleTextChange}
            maxLength={7}
            placeholder="#3b82f6"
            className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2.5 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            aria-label="Hex color value"
          />
        </div>

        {/* Swatch + named */}
        {rgb && (
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="h-16 w-32 rounded-xl border border-surface-border shadow-sm"
              style={{ backgroundColor: hex }}
              aria-label={`Color swatch for ${hex}`}
            />
            <div className="space-y-1">
              <p className="font-mono text-body-sm font-semibold text-surface-fg">{hex.toUpperCase()}</p>
              {named && (
                <p className="text-body-xs text-surface-fg-muted">
                  CSS name: <span className="font-semibold text-surface-fg">{named}</span>
                </p>
              )}
              <p className="text-body-xs text-surface-fg-muted">
                rgb({rgb[0]}, {rgb[1]}, {rgb[2]})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* All formats */}
      {rgb && (
        <>
          {/* Group: HEX + RGB */}
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
            <h3 className="text-body-sm font-semibold text-surface-fg mb-3">HEX &amp; RGB</h3>
            {formats.slice(0, 5).map((f) => (
              <FormatRow key={f.label} label={f.label} value={f.value} />
            ))}
          </div>

          {/* Group: HSL */}
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
            <h3 className="text-body-sm font-semibold text-surface-fg mb-3">HSL</h3>
            {formats.slice(5, 9).map((f) => (
              <FormatRow key={f.label} label={f.label} value={f.value} />
            ))}
          </div>

          {/* Group: HSV */}
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
            <h3 className="text-body-sm font-semibold text-surface-fg mb-3">HSV</h3>
            {formats.slice(9, 12).map((f) => (
              <FormatRow key={f.label} label={f.label} value={f.value} />
            ))}
          </div>

          {/* Group: CMYK */}
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
            <h3 className="text-body-sm font-semibold text-surface-fg mb-3">CMYK</h3>
            {formats.slice(12, 17).map((f) => (
              <FormatRow key={f.label} label={f.label} value={f.value} />
            ))}
          </div>

          {/* Group: oklch */}
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
            <h3 className="text-body-sm font-semibold text-surface-fg mb-3">
              oklch{" "}
              <span className="text-body-xs font-normal text-surface-fg-muted">(perceptual, CSS Color 4)</span>
            </h3>
            {formats.slice(17).map((f) => (
              <FormatRow key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
