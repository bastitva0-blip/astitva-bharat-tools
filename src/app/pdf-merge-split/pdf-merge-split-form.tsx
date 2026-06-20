"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { durationBucket, fire, sizeBucket, useToolAnalytics } from "@/lib/analytics";
import { formatKb } from "@/lib/processing/image";
import {
  getPdfPageCount,
  mergePdfs,
  parseRanges,
  splitPdfByRanges,
  splitPdfEveryPage,
  type SplitResult,
} from "@/lib/processing/pdf-merge-split";

const TOOL = "pdf-merge-split";

type Mode = "merge" | "split";
type SplitMode = "ranges" | "every";

interface MergeItem {
  id: string;
  file: File;
}

interface MergeOutput {
  url: string;
  bytes: number;
}

interface SplitOutput {
  url: string;
  label: string;
  bytes: number;
}

export function PdfMergeSplitForm() {
  useToolAnalytics(TOOL);
  const [mode, setMode] = useState<Mode>("merge");

  return (
    <div className="space-y-6">
      <SegmentedControl
        size="lg"
        variant="default"
        options={[
          { id: "merge", text: "Merge PDFs" },
          { id: "split", text: "Split PDF" },
        ]}
        selectedId={mode}
        onSelect={(id) => {
          setMode(id as Mode);
          fire("preset_selected", { tool_id: TOOL, preset_id: id });
        }}
      />
      {mode === "merge" ? <MergePanel /> : <SplitPanel />}
    </div>
  );
}

function MergePanel() {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState<MergeOutput | null>(null);

  useEffect(() => () => {
    if (output) URL.revokeObjectURL(output.url);
  }, [output]);

  const addFiles = (files: File[]) => {
    if (files.length === 0) return;
    setItems((cur) => [
      ...cur,
      ...files.map((f) => ({
        id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2)}`,
        file: f,
      })),
    ]);
    fire("file_added", {
      tool_id: TOOL,
      file_count: files.length,
      file_size_bucket: sizeBucket(files.reduce((s, f) => s + f.size, 0)),
      file_type: "application/pdf",
    });
  };

  const remove = (id: string) => {
    setItems((cur) => cur.filter((i) => i.id !== id));
  };

  const move = (id: string, dir: -1 | 1) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.id === id);
      if (idx < 0) return cur;
      const target = idx + dir;
      if (target < 0 || target >= cur.length) return cur;
      const next = [...cur];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const run = async () => {
    if (items.length < 2) {
      toast.error("Add at least two PDFs to merge.");
      return;
    }
    setSubmitting(true);
    if (output) URL.revokeObjectURL(output.url);
    setOutput(null);

    fire("process_start", { tool_id: TOOL, preset: "merge" });
    const t0 = performance.now();
    const inputBytes = items.reduce((s, i) => s + i.file.size, 0);
    try {
      const merged = await mergePdfs(items.map((i) => i.file));
      const blob = new Blob([new Uint8Array(merged)], { type: "application/pdf" });
      setOutput({ url: URL.createObjectURL(blob), bytes: merged.length });
      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(inputBytes),
        output_size_bucket: sizeBucket(merged.length),
      });
      toast.success(`Merged ${items.length} PDFs.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to merge.");
      fire("process_error", {
        tool_id: TOOL,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. PDFs to merge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="application/pdf,.pdf"
            multiple
            maxSize={50 * 1024 * 1024}
            onFiles={addFiles}
            label="Drop PDFs here"
            sublabel="Up to 50 MB each. Drop again to add more."
          />

          {items.length > 0 && (
            <ul className="divide-y divide-surface-border-subtle rounded-md border border-surface-border-subtle">
              {items.map((it, idx) => (
                <li key={it.id} className="flex items-center gap-3 p-3">
                  <span className="w-6 text-body-sm text-surface-fg-muted">{idx + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-body-sm font-medium">{it.file.name}</div>
                    <div className="text-body-xs text-surface-fg-muted">
                      {formatKb(it.file.size)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move up"
                    disabled={idx === 0}
                    onClick={() => move(it.id, -1)}
                  >
                    <ArrowUp size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move down"
                    disabled={idx === items.length - 1}
                    onClick={() => move(it.id, 1)}
                  >
                    <ArrowDown size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove"
                    onClick={() => remove(it.id)}
                  >
                    <X size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={items.length < 2 || submitting}
            onClick={run}
          >
            Merge into one PDF
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>2. Result</CardTitle>
        </CardHeader>
        <CardContent>
          {output ? (
            <div className="space-y-4">
              <iframe
                title="Merged PDF preview"
                src={output.url}
                className="h-[60vh] w-full rounded-md border border-surface-fg bg-surface-2"
              />
              <Button asChild variant="solid" fullWidth size="lg">
                <a
                  href={output.url}
                  download="bharattools-merged.pdf"
                  onClick={() => fire("download_click", { tool_id: TOOL, output_type: "application/pdf" })}
                >
                  Download merged PDF · {formatKb(output.bytes)}
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Merge to see the preview here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SplitPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>("ranges");
  const [rangesText, setRangesText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [outputs, setOutputs] = useState<SplitOutput[]>([]);

  useEffect(() => () => {
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
  }, [outputs]);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const total = await getPdfPageCount(file);
        if (!cancelled) setPageCount(total);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Could not read PDF.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const setSourceFile = (next: File | null) => {
    setFile(next);
    setPageCount(null);
    if (next) {
      fire("file_added", {
        tool_id: TOOL,
        file_count: 1,
        file_size_bucket: sizeBucket(next.size),
        file_type: next.type || "application/pdf",
      });
    }
  };

  const run = async () => {
    if (!file) {
      toast.error("Upload a PDF first.");
      return;
    }
    setSubmitting(true);
    outputs.forEach((o) => URL.revokeObjectURL(o.url));
    setOutputs([]);

    fire("process_start", { tool_id: TOOL, preset: `split-${splitMode}` });
    const t0 = performance.now();
    try {
      let results: SplitResult[];
      if (splitMode === "every") {
        results = await splitPdfEveryPage(file);
      } else {
        if (!pageCount) throw new Error("Still reading the PDF - try again.");
        const ranges = parseRanges(rangesText, pageCount);
        results = await splitPdfByRanges(file, ranges);
      }
      const next: SplitOutput[] = results.map((r) => {
        const blob = new Blob([new Uint8Array(r.bytes)], { type: "application/pdf" });
        return { url: URL.createObjectURL(blob), label: r.label, bytes: r.bytes.length };
      });
      setOutputs(next);
      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(file.size),
        output_size_bucket: sizeBucket(next.reduce((s, o) => s + o.bytes, 0)),
      });
      toast.success(`Split into ${next.length} PDF${next.length === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to split.");
      fire("process_error", {
        tool_id: TOOL,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const baseName = file ? file.name.replace(/\.pdf$/i, "") : "split";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. Source PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="application/pdf,.pdf"
            maxSize={50 * 1024 * 1024}
            onFiles={(files) => setSourceFile(files[0] ?? null)}
            label="Drop a PDF here"
            sublabel="Up to 50 MB."
          />

          {file && (
            <div className="flex items-start justify-between gap-3 rounded-md border border-surface-border-subtle p-3 text-body-sm">
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-surface-fg-muted">
                  {formatKb(file.size)}
                  {pageCount !== null ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
                </div>
              </div>
              <Button variant="ghost" size="compact-sm" onClick={() => setSourceFile(null)}>
                Remove
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label className="block">Split mode</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                { id: "ranges", text: "Page ranges" },
                { id: "every", text: "Every page" },
              ]}
              selectedId={splitMode}
              onSelect={(id) => setSplitMode(id as SplitMode)}
            />
          </div>

          {splitMode === "ranges" && (
            <div className="space-y-2">
              <Label htmlFor="ranges" className="block">
                Pages
              </Label>
              <Input
                id="ranges"
                value={rangesText}
                onChange={(e) => setRangesText(e.target.value)}
                placeholder="e.g. 1-3, 5, 7-9"
              />
              <p className="text-body-xs text-surface-fg-muted">
                Comma-separated. Each range becomes a separate PDF.
              </p>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={!file || submitting || (splitMode === "ranges" && !rangesText.trim())}
            onClick={run}
          >
            Split PDF
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>2. Result</CardTitle>
        </CardHeader>
        <CardContent>
          {outputs.length > 0 ? (
            <ul className="space-y-2">
              {outputs.map((o) => (
                <li
                  key={o.url}
                  className="flex items-center justify-between gap-3 rounded-md border border-surface-border-subtle p-3 text-body-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{`${baseName}-${o.label}.pdf`}</div>
                    <div className="text-body-xs text-surface-fg-muted">{formatKb(o.bytes)}</div>
                  </div>
                  <Button asChild variant="solid" size="sm">
                    <a
                      href={o.url}
                      download={`${baseName}-${o.label}.pdf`}
                      onClick={() => fire("download_click", { tool_id: TOOL, output_type: "application/pdf" })}
                    >
                      Download
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Split a PDF to see the parts here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
