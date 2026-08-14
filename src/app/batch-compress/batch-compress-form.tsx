"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { Check, Download, Lock, Sparkles, X } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";
import { compressImageToTargetKb, formatKb } from "@/lib/processing/image";

const PRESETS = [
  { label: "20 KB", targetKb: 20, toleranceKb: 3 },
  { label: "50 KB", targetKb: 50, toleranceKb: 5 },
  { label: "100 KB", targetKb: 100, toleranceKb: 8 },
  { label: "200 KB", targetKb: 200, toleranceKb: 12 },
];

const MAX_FILES = 20;
const MAX_BYTES = 25 * 1024 * 1024;
const FREE_RUNS = 3;
const TRIAL_KEY = "bt-batch-compress-trials";

function getTrialsUsed(): number {
  try {
    return parseInt(localStorage.getItem(TRIAL_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function incrementTrials(): number {
  try {
    const next = getTrialsUsed() + 1;
    localStorage.setItem(TRIAL_KEY, String(next));
    return next;
  } catch {
    return FREE_RUNS;
  }
}

interface FileEntry {
  id: string;
  file: File;
  status: "pending" | "processing" | "done" | "error";
  resultUrl?: string;
  resultName?: string;
  resultBytes?: number;
  errorMsg?: string;
}

function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

function UpgradeGate() {
  return (
    <div className="rounded-xl border border-[var(--bt-saffron-ink)]/30 bg-[var(--bt-saffron-ink)]/5 px-6 py-8 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--bt-saffron-ink)]/10">
        <Lock className="size-5 text-[var(--bt-saffron-ink)]" aria-hidden />
      </div>
      <h3 className="text-body-md font-semibold text-surface-fg">
        Free trial used up
      </h3>
      <p className="mt-2 text-body-sm text-surface-fg-muted">
        Batch compression is a Pro feature. You&apos;ve used your {FREE_RUNS} free runs.
        Upgrade to compress unlimited batches, unlock higher file counts, and
        get priority processing.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button
          asChild
          variant="solid"
          size="md"
          onClick={() => fire("upsell_clicked", { tool_id: "batch-compress", tier: "499" })}
        >
          <Link href="/pricing">
            <Sparkles className="mr-1.5 size-4" aria-hidden />
            See Pro plans
          </Link>
        </Button>
        <p className="text-body-xs text-surface-fg-subtle">
          Plans from ₹499 / year
        </p>
      </div>
    </div>
  );
}

export function BatchCompressForm() {
  const [preset, setPreset] = useState(PRESETS[1]);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [trialsUsed, setTrialsUsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTrialsUsed(getTrialsUsed());
  }, []);

  const updateEntry = (id: string, patch: Partial<FileEntry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const toAdd = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_FILES - entries.length);

    if (toAdd.length === 0) {
      toast.error("Only image files are supported.");
      return;
    }

    setEntries((prev) => [
      ...prev,
      ...toAdd.map((f) => ({
        id: `${f.name}-${f.size}-${Date.now()}`,
        file: f,
        status: "pending" as const,
      })),
    ]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const e = prev.find((x) => x.id === id);
      if (e?.resultUrl) URL.revokeObjectURL(e.resultUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const runBatch = async () => {
    const pending = entries.filter((e) => e.status === "pending");
    if (pending.length === 0) { toast.error("No pending files."); return; }
    setRunning(true);
    fire("process_start", { tool_id: "batch-compress" });

    for (const entry of pending) {
      if (entry.file.size > MAX_BYTES) {
        updateEntry(entry.id, { status: "error", errorMsg: "File too large (25 MB max)" });
        continue;
      }
      updateEntry(entry.id, { status: "processing" });
      try {
        const r = await compressImageToTargetKb(entry.file, { targetKb: preset.targetKb, toleranceKb: preset.toleranceKb });
        const url = URL.createObjectURL(r.blob);
        updateEntry(entry.id, {
          status: "done",
          resultUrl: url,
          resultName: `${baseName(entry.file.name)}-${preset.targetKb}kb.jpg`,
          resultBytes: r.bytes,
        });
      } catch {
        updateEntry(entry.id, { status: "error", errorMsg: "Compression failed" });
      }
    }

    fire("process_complete", { tool_id: "batch-compress", duration_bucket: "1-5s", input_size_bucket: "1-10MB", output_size_bucket: "<100KB" });
    setRunning(false);

    const next = incrementTrials();
    setTrialsUsed(next);
    if (next >= FREE_RUNS) {
      fire("upsell_shown", { tool_id: "batch-compress", trigger: "batch-initiated" });
    }
  };

  const clearAll = () => {
    entries.forEach((e) => { if (e.resultUrl) URL.revokeObjectURL(e.resultUrl); });
    setEntries([]);
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const doneCount = entries.filter((e) => e.status === "done").length;
  const trialExhausted = trialsUsed >= FREE_RUNS;
  const runsLeft = Math.max(0, FREE_RUNS - trialsUsed);

  return (
    <div className="space-y-6">
      {/* Preset picker */}
      <div>
        <p className="mb-2 text-body-sm font-medium text-surface-fg">Target size</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPreset(p)}
              className={`rounded-full border px-4 py-1.5 text-body-sm font-semibold transition-colors ${
                preset.label === p.label
                  ? "border-[var(--bt-saffron-ink)] bg-[var(--bt-saffron-ink)] text-white"
                  : "border-surface-border-subtle bg-surface-1 text-surface-fg hover:border-[var(--bt-saffron-ink)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-surface-border-subtle bg-surface-2 py-10 transition-colors hover:border-[var(--bt-saffron-ink)]"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Drop images or click to select"
      >
        <span className="text-2xl" aria-hidden>📂</span>
        <div className="text-center">
          <p className="text-body-sm font-semibold text-surface-fg">Drop images here or click to select</p>
          <p className="text-body-xs text-surface-fg-muted">JPG, PNG, WebP — up to {MAX_FILES} files, 25 MB each</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-body-sm font-medium text-surface-fg">
              {entries.length} file{entries.length !== 1 ? "s" : ""}
              {doneCount > 0 && <span className="ml-2 text-success-11">· {doneCount} done</span>}
            </p>
            <button onClick={clearAll} className="text-body-xs text-surface-fg-muted hover:text-surface-fg">
              Clear all
            </button>
          </div>

          <div className="divide-y divide-surface-border-subtle rounded-lg border border-surface-border-subtle">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-medium text-surface-fg">{entry.file.name}</p>
                  <p className="text-body-xs text-surface-fg-muted">
                    {formatKb(entry.file.size)}
                    {entry.status === "done" && entry.resultBytes != null && (
                      <span className="ml-2 text-success-11">→ {formatKb(entry.resultBytes)}</span>
                    )}
                    {entry.status === "error" && (
                      <span className="ml-2 text-error-11">{entry.errorMsg}</span>
                    )}
                    {entry.status === "processing" && (
                      <span className="ml-2 text-[var(--bt-saffron-ink)]">Compressing…</span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {entry.status === "done" && entry.resultUrl && (
                    <a
                      href={entry.resultUrl}
                      download={entry.resultName}
                      onClick={() => fire("download_click", { tool_id: "batch-compress", output_type: "image/jpeg" })}
                      className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1.5 text-body-xs font-semibold text-surface-fg transition-colors hover:bg-surface-3"
                    >
                      <Download className="size-3.5" aria-hidden />
                      Save
                    </a>
                  )}
                  {entry.status === "done" && (
                    <Check className="size-4 text-success-11" aria-hidden />
                  )}
                  <button
                    onClick={() => removeEntry(entry.id)}
                    aria-label="Remove"
                    className="rounded p-0.5 text-surface-fg-muted hover:text-surface-fg"
                    disabled={entry.status === "processing"}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pendingCount > 0 && (
            trialExhausted ? (
              <UpgradeGate />
            ) : (
              <div className="space-y-2">
                {runsLeft <= FREE_RUNS && (
                  <p className="text-center text-body-xs text-surface-fg-muted">
                    {runsLeft === 1
                      ? "1 free run remaining after this"
                      : `${runsLeft} free run${runsLeft !== 1 ? "s" : ""} remaining`}
                  </p>
                )}
                <Button
                  variant="solid"
                  size="lg"
                  onClick={runBatch}
                  disabled={running}
                  fullWidth
                >
                  {running
                    ? "Compressing…"
                    : `Compress ${pendingCount} file${pendingCount !== 1 ? "s" : ""} to ${preset.label}`}
                </Button>
              </div>
            )
          )}
        </div>
      )}

      {/* Paywall shown when no files loaded but trials exhausted */}
      {entries.length === 0 && trialExhausted && <UpgradeGate />}
    </div>
  );
}
