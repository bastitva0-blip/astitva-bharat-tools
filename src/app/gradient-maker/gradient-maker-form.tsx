"use client";

import { useState, useCallback, useId } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── Types ─────────────────────────────────────────────────────────────────────

type GradientType = "linear" | "radial" | "conic";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientState {
  type: GradientType;
  stops: ColorStop[];
  angle: number;
  radialShape: "circle" | "ellipse";
  radialPosition: string;
  conicAngle: number;
  conicPosition: string;
}

// ── Preset gradients ──────────────────────────────────────────────────────────

const PRESETS: Array<{ label: string; state: Partial<GradientState> }> = [
  {
    label: "Sunset",
    state: {
      type: "linear",
      angle: 135,
      stops: [
        { id: "p1", color: "#ff6b6b", position: 0 },
        { id: "p2", color: "#feca57", position: 50 },
        { id: "p3", color: "#ff9ff3", position: 100 },
      ],
    },
  },
  {
    label: "Ocean",
    state: {
      type: "linear",
      angle: 160,
      stops: [
        { id: "p1", color: "#0f3460", position: 0 },
        { id: "p2", color: "#16213e", position: 50 },
        { id: "p3", color: "#0f3460", position: 100 },
      ],
    },
  },
  {
    label: "Mint",
    state: {
      type: "linear",
      angle: 90,
      stops: [
        { id: "p1", color: "#a8edea", position: 0 },
        { id: "p2", color: "#fed6e3", position: 100 },
      ],
    },
  },
  {
    label: "Aurora",
    state: {
      type: "radial",
      radialShape: "ellipse",
      radialPosition: "center center",
      stops: [
        { id: "p1", color: "#00f2fe", position: 0 },
        { id: "p2", color: "#4facfe", position: 50 },
        { id: "p3", color: "#a8c0ff", position: 100 },
      ],
    },
  },
  {
    label: "Fire",
    state: {
      type: "linear",
      angle: 0,
      stops: [
        { id: "p1", color: "#f7971e", position: 0 },
        { id: "p2", color: "#ffd200", position: 100 },
      ],
    },
  },
  {
    label: "Purple Haze",
    state: {
      type: "linear",
      angle: 45,
      stops: [
        { id: "p1", color: "#7b2ff7", position: 0 },
        { id: "p2", color: "#f107a3", position: 100 },
      ],
    },
  },
  {
    label: "Rainbow Conic",
    state: {
      type: "conic",
      conicAngle: 0,
      conicPosition: "center center",
      stops: [
        { id: "p1", color: "#ff0000", position: 0 },
        { id: "p2", color: "#ffff00", position: 25 },
        { id: "p3", color: "#00ff00", position: 50 },
        { id: "p4", color: "#0000ff", position: 75 },
        { id: "p5", color: "#ff0000", position: 100 },
      ],
    },
  },
  {
    label: "Dark Radial",
    state: {
      type: "radial",
      radialShape: "circle",
      radialPosition: "center center",
      stops: [
        { id: "p1", color: "#434343", position: 0 },
        { id: "p2", color: "#000000", position: 100 },
      ],
    },
  },
];

const RADIAL_POSITIONS = [
  "center center",
  "top left",
  "top center",
  "top right",
  "center left",
  "center right",
  "bottom left",
  "bottom center",
  "bottom right",
];

// ── CSS generation ────────────────────────────────────────────────────────────

function stopsString(stops: ColorStop[]): string {
  return stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");
}

function buildCss(g: GradientState): string {
  const s = stopsString(g.stops);
  if (g.type === "linear") {
    return `background: linear-gradient(${g.angle}deg, ${s});`;
  }
  if (g.type === "radial") {
    return `background: radial-gradient(${g.radialShape} at ${g.radialPosition}, ${s});`;
  }
  return `background: conic-gradient(from ${g.conicAngle}deg at ${g.conicPosition}, ${s});`;
}

function buildTailwind(g: GradientState): string {
  const s = stopsString(g.stops);
  if (g.type === "linear") {
    return `bg-[linear-gradient(${g.angle}deg,${s.replace(/ /g, "_")})]`;
  }
  if (g.type === "radial") {
    return `bg-[radial-gradient(${g.radialShape}_at_${g.radialPosition.replace(/ /g, "_")},${s.replace(/ /g, "_")})]`;
  }
  return `bg-[conic-gradient(from_${g.conicAngle}deg_at_${g.conicPosition.replace(/ /g, "_")},${s.replace(/ /g, "_")})]`;
}

function buildSvg(g: GradientState): string {
  const sorted = g.stops.slice().sort((a, b) => a.position - b.position);
  const stopEls = sorted
    .map(
      (s) =>
        `  <stop offset="${s.position}%" stop-color="${s.color}" />`,
    )
    .join("\n");

  if (g.type === "linear") {
    const rad = (g.angle - 90) * (Math.PI / 180);
    const x2 = (50 + 50 * Math.cos(rad)).toFixed(2);
    const y2 = (50 + 50 * Math.sin(rad)).toFixed(2);
    return `<linearGradient id="grad" x1="50%" y1="50%" x2="${x2}%" y2="${y2}%" gradientUnits="userSpaceOnUse">\n${stopEls}\n</linearGradient>`;
  }
  if (g.type === "radial") {
    return `<radialGradient id="grad" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">\n${stopEls}\n</radialGradient>`;
  }
  // conic — SVG doesn't natively support conic, provide a note
  return `<!-- SVG does not natively support conic gradients.\n     Use the CSS output instead. -->`;
}

function buildPreviewStyle(g: GradientState): string {
  const s = stopsString(g.stops);
  if (g.type === "linear") {
    return `linear-gradient(${g.angle}deg, ${s})`;
  }
  if (g.type === "radial") {
    return `radial-gradient(${g.radialShape} at ${g.radialPosition}, ${s})`;
  }
  return `conic-gradient(from ${g.conicAngle}deg at ${g.conicPosition}, ${s})`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Default state ─────────────────────────────────────────────────────────────

const DEFAULT_STATE: GradientState = {
  type: "linear",
  angle: 135,
  stops: [
    { id: "a", color: "#6366f1", position: 0 },
    { id: "b", color: "#ec4899", position: 100 },
  ],
  radialShape: "ellipse",
  radialPosition: "center center",
  conicAngle: 0,
  conicPosition: "center center",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ColorStopRow({
  stop,
  onChange,
  onRemove,
  canRemove,
}: {
  stop: ColorStop;
  onChange: (updated: ColorStop) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const colorId = useId();
  const posId = useId();
  return (
    <div className="flex items-center gap-3 rounded-md border border-surface-border bg-surface-1 px-3 py-2">
      <div className="flex items-center gap-2">
        <label htmlFor={colorId} className="text-body-xs text-surface-fg-muted">
          Color
        </label>
        <input
          id={colorId}
          type="color"
          value={stop.color}
          onChange={(e) => onChange({ ...stop, color: e.target.value })}
          className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="font-mono text-body-xs text-surface-fg">
          {stop.color}
        </span>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <label htmlFor={posId} className="text-body-xs text-surface-fg-muted">
          Position
        </label>
        <input
          id={posId}
          type="range"
          min={0}
          max={100}
          value={stop.position}
          onChange={(e) =>
            onChange({ ...stop, position: Number(e.target.value) })
          }
          className="flex-1"
        />
        <input
          type="number"
          min={0}
          max={100}
          value={stop.position}
          onChange={(e) =>
            onChange({
              ...stop,
              position: Math.max(0, Math.min(100, Number(e.target.value))),
            })
          }
          className="w-14 rounded-md border border-surface-border bg-surface-2 px-2 py-1 text-body-xs text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <span className="text-body-xs text-surface-fg-muted">%</span>
      </div>
      {canRemove && (
        <button
          onClick={onRemove}
          title="Remove stop"
          className="rounded text-surface-fg-muted hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── Export tabs ───────────────────────────────────────────────────────────────

function ExportPanel({ g }: { g: GradientState }) {
  const [tab, setTab] = useState<"css" | "tailwind" | "svg">("css");

  const outputs = {
    css: { label: "CSS", value: buildCss(g) },
    tailwind: { label: "Tailwind", value: buildTailwind(g) },
    svg: { label: "SVG Gradient", value: buildSvg(g) },
  } as const;

  const current = outputs[tab];

  return (
    <div className="space-y-3 rounded-md border border-surface-border bg-surface-1 p-4">
      <p className="text-body-sm font-semibold text-surface-fg">
        Generated Output
      </p>
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(outputs) as Array<keyof typeof outputs>).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={[
              "rounded-md px-3 py-1.5 text-body-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
              tab === k
                ? "bg-primary-600 text-white"
                : "bg-surface-2 text-surface-fg hover:bg-surface-3",
            ].join(" ")}
          >
            {outputs[k].label}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto rounded-md border border-surface-border bg-surface-2 px-4 py-3 font-mono text-body-xs text-surface-fg whitespace-pre-wrap break-all">
        {current.value}
      </pre>
      <Button
        onClick={() => copyText(current.value, current.label)}
        size="sm"
      >
        Copy {current.label}
      </Button>
    </div>
  );
}

// ── Root form ─────────────────────────────────────────────────────────────────

export function GradientMakerForm() {
  const [g, setG] = useState<GradientState>(DEFAULT_STATE);
  const [fired, setFired] = useState(false);

  const touch = useCallback(() => {
    if (!fired) {
      fire("process_start", { tool_id: "gradient-maker" });
      setFired(true);
    }
  }, [fired]);

  const update = useCallback(
    (patch: Partial<GradientState>) => {
      touch();
      setG((prev) => ({ ...prev, ...patch }));
    },
    [touch],
  );

  const updateStop = useCallback(
    (updated: ColorStop) => {
      touch();
      setG((prev) => ({
        ...prev,
        stops: prev.stops.map((s) => (s.id === updated.id ? updated : s)),
      }));
    },
    [touch],
  );

  const addStop = () => {
    touch();
    setG((prev) => ({
      ...prev,
      stops: [...prev.stops, { id: makeId(), color: "#ffffff", position: 50 }],
    }));
  };

  const removeStop = (id: string) => {
    setG((prev) => ({
      ...prev,
      stops: prev.stops.filter((s) => s.id !== id),
    }));
  };

  const applyPreset = (preset: Partial<GradientState>) => {
    touch();
    setG((prev) => ({ ...prev, ...preset }));
  };

  const previewBg = buildPreviewStyle(g);

  return (
    <div className="space-y-6">
      {/* Gradient type tabs */}
      <div className="flex gap-2">
        {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
          <button
            key={t}
            onClick={() => update({ type: t })}
            className={[
              "rounded-md px-4 py-2 text-body-sm font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
              g.type === t
                ? "bg-primary-600 text-white"
                : "bg-surface-2 text-surface-fg hover:bg-surface-3",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: controls */}
        <div className="space-y-5">
          {/* Type-specific controls */}
          {g.type === "linear" && (
            <div className="space-y-2">
              <label className="text-body-sm font-medium text-surface-fg">
                Angle: {g.angle}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={g.angle}
                onChange={(e) => update({ angle: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          {g.type === "radial" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-body-sm font-medium text-surface-fg">
                  Shape
                </label>
                <div className="flex gap-2">
                  {(["circle", "ellipse"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update({ radialShape: s })}
                      className={[
                        "rounded-md px-3 py-1.5 text-body-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                        g.radialShape === s
                          ? "bg-primary-600 text-white"
                          : "bg-surface-2 text-surface-fg hover:bg-surface-3",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-body-sm font-medium text-surface-fg">
                  Position
                </label>
                <select
                  value={g.radialPosition}
                  onChange={(e) => update({ radialPosition: e.target.value })}
                  className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {RADIAL_POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {g.type === "conic" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-body-sm font-medium text-surface-fg">
                  Start angle: {g.conicAngle}°
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={g.conicAngle}
                  onChange={(e) =>
                    update({ conicAngle: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-body-sm font-medium text-surface-fg">
                  Position
                </label>
                <select
                  value={g.conicPosition}
                  onChange={(e) => update({ conicPosition: e.target.value })}
                  className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {RADIAL_POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Color stops */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-body-sm font-medium text-surface-fg">
                Color stops
              </p>
              <Button
                onClick={addStop}
                size="sm"
                variant="outline"
                disabled={g.stops.length >= 8}
              >
                + Add stop
              </Button>
            </div>
            <div className="space-y-2">
              {g.stops.map((stop) => (
                <ColorStopRow
                  key={stop.id}
                  stop={stop}
                  onChange={updateStop}
                  onRemove={() => removeStop(stop.id)}
                  canRemove={g.stops.length > 2}
                />
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <p className="text-body-sm font-medium text-surface-fg">Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.state)}
                  className="rounded-md border border-surface-border bg-surface-2 px-3 py-1.5 text-body-xs text-surface-fg transition-colors hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-4">
          <p className="text-body-sm font-medium text-surface-fg">Preview</p>
          <div
            className="h-64 w-full rounded-xl border border-surface-border shadow-sm"
            style={{ background: previewBg }}
            aria-label="Gradient preview"
          />

          {/* Export panel */}
          <ExportPanel g={g} />
        </div>
      </div>
    </div>
  );
}
