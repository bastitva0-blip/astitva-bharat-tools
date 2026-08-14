"use client";

import { useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaletteEntry {
  id: string;
  name: string;
  hex: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Ensure name is a safe CSS / JS identifier token. */
function sanitizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "") || "color";
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  } catch {
    toast.error("Clipboard access denied.");
  }
}

// ── Export builders ───────────────────────────────────────────────────────────

function buildCss(entries: PaletteEntry[]): string {
  const vars = entries
    .map((e) => `  --${sanitizeName(e.name)}: ${e.hex};`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}

function buildTailwind(entries: PaletteEntry[]): string {
  const lines = entries
    .map((e) => `    '${sanitizeName(e.name)}': '${e.hex}',`)
    .join("\n");
  return `colors: {\n${lines}\n}`;
}

function buildFigma(entries: PaletteEntry[]): string {
  const tokens: Record<string, { value: string; $type: string }> = {};
  for (const e of entries) {
    tokens[sanitizeName(e.name)] = { value: e.hex, $type: "color" };
  }
  return JSON.stringify(tokens, null, 2);
}

// ── Default palette ───────────────────────────────────────────────────────────

const DEFAULT_ENTRIES: PaletteEntry[] = [
  { id: uid(), name: "primary", hex: "#3B82F6" },
  { id: uid(), name: "secondary", hex: "#8B5CF6" },
  { id: uid(), name: "accent", hex: "#10B981" },
  { id: uid(), name: "surface", hex: "#F9FAFB" },
  { id: uid(), name: "text", hex: "#111827" },
];

// ── Swatch row ────────────────────────────────────────────────────────────────

function SwatchRow({
  entry,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  entry: PaletteEntry;
  index: number;
  total: number;
  onChange: (id: string, field: "name" | "hex", value: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-surface-border bg-surface-1 px-3 py-2">
      {/* Color swatch + picker */}
      <label className="relative flex-shrink-0 cursor-pointer" title="Pick color">
        <div
          className="h-9 w-9 rounded border border-surface-border shadow-sm"
          style={{ backgroundColor: entry.hex }}
        />
        <input
          type="color"
          value={entry.hex}
          onChange={(e) => onChange(entry.id, "hex", e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Color picker"
        />
      </label>

      {/* HEX display */}
      <code className="w-20 shrink-0 rounded bg-surface-2 px-2 py-1 font-mono text-body-xs text-surface-fg">
        {entry.hex.toUpperCase()}
      </code>

      {/* Name input */}
      <input
        type="text"
        value={entry.name}
        onChange={(e) => onChange(entry.id, "name", e.target.value)}
        placeholder="color-name"
        className="flex-1 rounded-md border border-surface-border bg-surface-2 px-3 py-1.5 text-body-sm text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Color name"
      />

      {/* Reorder + delete */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onMoveUp(entry.id)}
          disabled={index === 0}
          className="rounded px-1.5 py-1 text-body-xs text-surface-fg-muted transition-colors hover:bg-surface-2 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Move up"
          title="Move up"
        >
          ↑
        </button>
        <button
          onClick={() => onMoveDown(entry.id)}
          disabled={index === total - 1}
          className="rounded px-1.5 py-1 text-body-xs text-surface-fg-muted transition-colors hover:bg-surface-2 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Move down"
          title="Move down"
        >
          ↓
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="rounded px-1.5 py-1 text-body-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Delete color"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Export panel ──────────────────────────────────────────────────────────────

type ExportTab = "css" | "tailwind" | "figma";

function ExportPanel({ entries }: { entries: PaletteEntry[] }) {
  const [tab, setTab] = useState<ExportTab>("css");

  const tabs: { key: ExportTab; label: string; build: (e: PaletteEntry[]) => string }[] = [
    { key: "css", label: "CSS Variables", build: buildCss },
    { key: "tailwind", label: "Tailwind Config", build: buildTailwind },
    { key: "figma", label: "Figma Tokens", build: buildFigma },
  ];

  const current = tabs.find((t) => t.key === tab)!;
  const output = entries.length > 0 ? current.build(entries) : "";

  return (
    <div className="rounded-md border border-surface-border bg-surface-1 p-4 space-y-3">
      <p className="text-body-sm font-semibold text-surface-fg">Export</p>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "rounded-md px-3 py-1.5 text-body-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
              tab === t.key
                ? "bg-primary-600 text-white"
                : "bg-surface-2 text-surface-fg hover:bg-surface-3",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="text-body-xs text-surface-fg-muted">
          Add at least one color to generate an export.
        </p>
      ) : (
        <>
          <pre className="overflow-x-auto rounded-md border border-surface-border bg-surface-2 px-4 py-3 font-mono text-body-xs text-surface-fg whitespace-pre-wrap break-all">
            {output}
          </pre>
          <Button onClick={() => copyText(output, current.label)} size="sm">
            Copy {current.label}
          </Button>
        </>
      )}
    </div>
  );
}

// ── Root form ─────────────────────────────────────────────────────────────────

export function PaletteBuilderForm() {
  const [entries, setEntries] = useState<PaletteEntry[]>(DEFAULT_ENTRIES);
  const [newHex, setNewHex] = useState("#6366F1");
  const [newName, setNewName] = useState("");
  const [started, setStarted] = useState(false);

  const fireStart = () => {
    if (!started) {
      fire("process_start", { tool_id: "palette-builder" });
      setStarted(true);
    }
  };

  const handleChange = (id: string, field: "name" | "hex", value: string) => {
    fireStart();
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleMoveUp = (id: string) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
      return next;
    });
  };

  const handleMoveDown = (id: string) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!];
      return next;
    });
  };

  const handleAdd = () => {
    const name = newName.trim() || `color-${entries.length + 1}`;
    fireStart();
    setEntries((prev) => [...prev, { id: uid(), name, hex: newHex }]);
    setNewName("");
  };

  return (
    <div className="space-y-6">
      {/* Add color row */}
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-surface-border bg-surface-1 px-4 py-3">
        <div className="flex flex-col gap-1">
          <label className="text-body-xs font-medium text-surface-fg-muted">
            Color
          </label>
          <label className="relative flex cursor-pointer items-center gap-2">
            <div
              className="h-9 w-9 rounded border border-surface-border shadow-sm"
              style={{ backgroundColor: newHex }}
            />
            <input
              type="color"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="New color picker"
            />
            <code className="rounded bg-surface-2 px-2 py-1 font-mono text-body-xs text-surface-fg">
              {newHex.toUpperCase()}
            </code>
          </label>
        </div>

        <div className="flex flex-1 flex-col gap-1 min-w-36">
          <label
            htmlFor="new-color-name"
            className="text-body-xs font-medium text-surface-fg-muted"
          >
            Name
          </label>
          <input
            id="new-color-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={`color-${entries.length + 1}`}
            className="rounded-md border border-surface-border bg-surface-2 px-3 py-1.5 text-body-sm text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <Button onClick={handleAdd} size="sm">
          Add color
        </Button>
      </div>

      {/* Palette list */}
      {entries.length === 0 ? (
        <div className="rounded-md border border-surface-border bg-surface-1 px-6 py-10 text-center">
          <p className="text-body-sm text-surface-fg-muted">
            No colors yet — add one above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-body-xs text-surface-fg-muted">
            {entries.length} color{entries.length !== 1 ? "s" : ""}. Click the
            swatch to open the color picker.
          </p>
          {entries.map((entry, i) => (
            <SwatchRow
              key={entry.id}
              entry={entry}
              index={i}
              total={entries.length}
              onChange={handleChange}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      )}

      {/* Live preview strip */}
      {entries.length > 0 && (
        <div className="overflow-hidden rounded-md border border-surface-border">
          <div className="flex h-10">
            {entries.map((e) => (
              <div
                key={e.id}
                className="flex-1"
                style={{ backgroundColor: e.hex }}
                title={`${e.name}: ${e.hex}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <ExportPanel entries={entries} />
    </div>
  );
}
