"use client";

import * as React from "react";

export interface AuroraPalette {
  colors: [string, string, string, string, string];
  ground: string;
  isDark: boolean;
}

const FALLBACK_LIGHT: AuroraPalette = {
  colors: ["#fafafa", "#fce8ef", "#e58fb0", "#a23f6a", "#c66b8e"],
  ground: "#fafafa",
  isDark: false,
};

const FALLBACK_DARK: AuroraPalette = {
  colors: ["#0a0a0a", "#2b1320", "#7a2a4a", "#c66b8e", "#fce8ef"],
  ground: "#0a0a0a",
  isDark: true,
};

const ACCENT_STOPS = [
  "--color-accent-1",
  "--color-accent-3",
  "--color-accent-9",
  "--color-accent-11",
  "--color-accent-12",
] as const;

// Normalise any CSS colour string (rgb, oklch, oklab, color(srgb …), hex,
// named) to `#rrggbb`. Canvas2D's fillStyle setter parses any valid CSS
// colour and round-trips it as `#rrggbb` or `rgba(…)`. This is the only
// reliable way to bridge the OKLCH-defined tokens to the hex string the
// shader / lerp code expects, because modern Chrome's getComputedStyle
// returns colours in their authored colour space (oklab/oklch), not rgb.
function cssColorToHex(input: string, ctx: CanvasRenderingContext2D): string | null {
  if (!input) return null;
  ctx.fillStyle = "#000000";
  ctx.fillStyle = input;
  const out = ctx.fillStyle;
  if (typeof out !== "string") return null;
  if (out.startsWith("#")) {
    if (out.length === 7) return out;
    if (out.length === 4) {
      return `#${out[1]}${out[1]}${out[2]}${out[2]}${out[3]}${out[3]}`;
    }
  }
  const m = out.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) {
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    return `#${[r, g, b]
      .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"))
      .join("")}`;
  }
  return null;
}

function resolveCssVar(
  name: string,
  host: HTMLElement,
  ctx: CanvasRenderingContext2D,
): string | null {
  host.style.color = `var(${name})`;
  const c = getComputedStyle(host).color;
  return cssColorToHex(c, ctx);
}

export function readAuroraPalette(): AuroraPalette {
  if (typeof document === "undefined") return FALLBACK_LIGHT;
  const isDark = document.documentElement.classList.contains("dark");
  const fallback = isDark ? FALLBACK_DARK : FALLBACK_LIGHT;

  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return fallback;

  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);

  try {
    const colors = ACCENT_STOPS.map(
      (name, i) => resolveCssVar(name, probe, ctx) ?? fallback.colors[i],
    ) as AuroraPalette["colors"];
    const ground = resolveCssVar("--color-surface-base", probe, ctx) ?? fallback.ground;
    return { colors, ground, isDark };
  } finally {
    probe.remove();
  }
}

export function useAuroraPalette(): AuroraPalette {
  const [p, setP] = React.useState<AuroraPalette>(FALLBACK_LIGHT);
  React.useEffect(() => {
    const update = () => setP(readAuroraPalette());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-brand", "data-shape"],
    });
    return () => obs.disconnect();
  }, []);
  return p;
}
