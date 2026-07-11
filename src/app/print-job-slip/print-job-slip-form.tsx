"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus, Send, X } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { NumberInput } from "@devalok/shilp-sutra/ui/number-input";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { Textarea } from "@devalok/shilp-sutra/ui/textarea";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { durationBucket, fire, sizeBucket, useToolAnalytics } from "@/lib/analytics";
import { formatKb } from "@/lib/processing/image";
import {
  buildPrintJobPdf,
  readPdfPageCount,
  type ColorMode,
  type PaperSize,
  type PrintJobItem,
  type Sides,
} from "@/lib/processing/print-job-slip";
import { DownloadBar } from "@/components/tool-shells/primitives";

const TOOL = "print-job-slip";

type Row = {
  id: string;
  copies: number;
  colorMode: ColorMode;
  sides: Sides;
  paperSize: PaperSize;
  pageRanges: string;
};

type SourceFile = {
  id: string;
  file: File;
  fileKind: "pdf" | "image";
  bytes: Uint8Array;
  sourcePages: number;
  rows: Row[];
};

interface RunResult {
  url: string;
  bytes: number;
}

const ACCEPT = "application/pdf,.pdf,image/*";

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultRow(): Row {
  return {
    id: newId("row"),
    copies: 1,
    colorMode: "bw",
    sides: "single",
    paperSize: "a4",
    pageRanges: "",
  };
}

export function PrintJobSlipForm() {
  useToolAnalytics(TOOL);
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  const addFiles = async (incoming: File[]) => {
    const additions = await Promise.all(
      incoming.map(async (f) => {
        const kind: "pdf" | "image" = f.type === "application/pdf" || /\.pdf$/i.test(f.name)
          ? "pdf"
          : "image";
        const bytes = new Uint8Array(await f.arrayBuffer());
        let sourcePages = 1;
        if (kind === "pdf") {
          try {
            sourcePages = await readPdfPageCount(bytes);
          } catch {
            sourcePages = 1;
          }
        }
        const source: SourceFile = {
          id: newId("file"),
          file: f,
          fileKind: kind,
          bytes,
          sourcePages,
          rows: [defaultRow()],
        };
        return source;
      }),
    );
    if (additions.length === 0) return;
    setFiles((cur) => [...cur, ...additions]);
    fire("file_added", {
      tool_id: TOOL,
      file_count: additions.length,
      file_size_bucket: sizeBucket(additions.reduce((s, a) => s + a.file.size, 0)),
      file_type: additions[0]?.file.type || "unknown",
    });
  };

  const removeFile = (fileId: string) => {
    setFiles((cur) => cur.filter((f) => f.id !== fileId));
  };

  const moveFile = (fileId: string, dir: -1 | 1) => {
    setFiles((cur) => {
      const idx = cur.findIndex((f) => f.id === fileId);
      if (idx < 0) return cur;
      const target = idx + dir;
      if (target < 0 || target >= cur.length) return cur;
      const next = [...cur];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const addRow = (fileId: string) => {
    setFiles((cur) =>
      cur.map((f) => (f.id === fileId ? { ...f, rows: [...f.rows, defaultRow()] } : f)),
    );
  };

  const updateRow = (fileId: string, rowId: string, patch: Partial<Row>) => {
    setFiles((cur) =>
      cur.map((f) =>
        f.id === fileId
          ? { ...f, rows: f.rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)) }
          : f,
      ),
    );
  };

  const removeRow = (fileId: string, rowId: string) => {
    setFiles((cur) =>
      cur.map((f) => {
        if (f.id !== fileId) return f;
        if (f.rows.length <= 1) return f;
        return { ...f, rows: f.rows.filter((r) => r.id !== rowId) };
      }),
    );
  };

  const moveRow = (fileId: string, rowId: string, dir: -1 | 1) => {
    setFiles((cur) =>
      cur.map((f) => {
        if (f.id !== fileId) return f;
        const idx = f.rows.findIndex((r) => r.id === rowId);
        if (idx < 0) return f;
        const target = idx + dir;
        if (target < 0 || target >= f.rows.length) return f;
        const rows = [...f.rows];
        [rows[idx], rows[target]] = [rows[target], rows[idx]];
        return { ...f, rows };
      }),
    );
  };

  const totalRows = files.reduce((sum, f) => sum + f.rows.length, 0);

  const run = async () => {
    if (files.length === 0) {
      toast.error("Add at least one file.");
      return;
    }
    setSubmitting(true);
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);

    fire("process_start", { tool_id: TOOL });
    const t0 = performance.now();
    const inputBytes = files.reduce((s, f) => s + f.file.size, 0);
    try {
      const payload: PrintJobItem[] = [];
      for (const f of files) {
        for (const r of f.rows) {
          payload.push({
            fileName: f.file.name,
            fileKind: f.fileKind,
            copies: Math.max(1, Math.round(r.copies)),
            colorMode: r.colorMode,
            sides: r.sides,
            paperSize: r.paperSize,
            pageRanges: r.pageRanges,
            sourcePages: f.sourcePages,
            bytes: f.bytes,
            mimeType: f.file.type,
          });
        }
      }
      const out = await buildPrintJobPdf({ items: payload, notes });
      const blob = new Blob([new Uint8Array(out)], { type: "application/pdf" });
      setResult({ url: URL.createObjectURL(blob), bytes: out.length });
      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(inputBytes),
        output_size_bucket: sizeBucket(out.length),
      });
      toast.success("Print job slip ready.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to build slip.");
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
          <CardTitle>1. Files to print</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept={ACCEPT}
            multiple
            maxSize={50 * 1024 * 1024}
            onFiles={(incoming) => {
              void addFiles(incoming);
            }}
            label="Drop PDFs or images"
            sublabel="Up to 50 MB each. Add as many as you need."
          />

          {files.length > 0 && (
            <ul className="space-y-4">
              {files.map((f, fileIdx) => (
                <li
                  key={f.id}
                  className="rounded-md border border-surface-border-subtle bg-surface-1"
                >
                  <div className="flex items-start gap-3 border-b border-surface-border-subtle p-3">
                    <span className="w-6 pt-1 text-body-sm text-surface-fg-muted">
                      {fileIdx + 1}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body-sm font-medium">{f.file.name}</div>
                      <div className="text-body-xs text-surface-fg-muted">
                        {formatKb(f.file.size)} ·{" "}
                        {f.fileKind === "pdf"
                          ? `${f.sourcePages} page${f.sourcePages === 1 ? "" : "s"}`
                          : "image"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move file up"
                      disabled={fileIdx === 0}
                      onClick={() => moveFile(f.id, -1)}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move file down"
                      disabled={fileIdx === files.length - 1}
                      onClick={() => moveFile(f.id, 1)}
                    >
                      <ArrowDown size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove file"
                      onClick={() => removeFile(f.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>

                  <div className="space-y-3 p-3">
                    {f.rows.map((r, rowIdx) => (
                      <div
                        key={r.id}
                        className="rounded-md border border-surface-border-subtle p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-body-xs font-semibold text-surface-fg-muted">
                            Print row {rowIdx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Move row up"
                              disabled={rowIdx === 0}
                              onClick={() => moveRow(f.id, r.id, -1)}
                            >
                              <ArrowUp size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Move row down"
                              disabled={rowIdx === f.rows.length - 1}
                              onClick={() => moveRow(f.id, r.id, 1)}
                            >
                              <ArrowDown size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Remove row"
                              disabled={f.rows.length <= 1}
                              onClick={() => removeRow(f.id, r.id)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <Label className="block text-body-xs mb-1">Copies</Label>
                            <NumberInput
                              value={r.copies}
                              onValueChange={(v) => updateRow(f.id, r.id, { copies: v })}
                              min={1}
                              max={500}
                              step={1}
                              size="sm"
                              className="[&_button:hover]:bg-transparent [&_button:hover]:text-surface-fg"
                            />
                          </div>
                          <div>
                            <Label className="block text-body-xs mb-1">Color</Label>
                            <SegmentedControl
                              size="sm"
                              variant="default"
                              options={[
                                { id: "bw", text: "B&W" },
                                { id: "color", text: "Color" },
                              ]}
                              selectedId={r.colorMode}
                              onSelect={(id) =>
                                updateRow(f.id, r.id, { colorMode: id as ColorMode })
                              }
                            />
                          </div>
                          <div>
                            <Label className="block text-body-xs mb-1">Sides</Label>
                            <SegmentedControl
                              size="sm"
                              variant="default"
                              options={[
                                { id: "single", text: "Single" },
                                { id: "double", text: "Double" },
                              ]}
                              selectedId={r.sides}
                              onSelect={(id) => updateRow(f.id, r.id, { sides: id as Sides })}
                            />
                          </div>
                          <div>
                            <Label className="block text-body-xs mb-1">Paper</Label>
                            <SegmentedControl
                              size="sm"
                              variant="default"
                              options={[
                                { id: "a4", text: "A4" },
                                { id: "a3", text: "A3" },
                                { id: "letter", text: "Letter" },
                                { id: "legal", text: "Legal" },
                              ]}
                              selectedId={r.paperSize}
                              onSelect={(id) =>
                                updateRow(f.id, r.id, { paperSize: id as PaperSize })
                              }
                            />
                          </div>
                          {f.fileKind === "pdf" && (
                            <div className="col-span-2">
                              <Label className="block text-body-xs mb-1">Pages</Label>
                              <Input
                                value={r.pageRanges}
                                onChange={(e) =>
                                  updateRow(f.id, r.id, { pageRanges: e.target.value })
                                }
                                placeholder={`All ${f.sourcePages} pages. Or "1-3, 5".`}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {f.fileKind === "pdf" && (
                      <Button
                        variant="soft"
                        size="sm"
                        fullWidth
                        onClick={() => addRow(f.id)}
                      >
                        <Plus size={14} />
                        Add another row for this file
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div>
            <Label htmlFor="notes" className="block">
              Notes for the print shop (English)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Staple top-left. Use thick paper for the last file."
              rows={3}
              className="mt-1"
            />
            <p className="mt-1 text-body-xs text-surface-fg-muted">
              Roman script only. Hindi notes won&apos;t render on the cover sheet for now.
            </p>
          </div>

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={files.length === 0 || submitting}
            onClick={run}
          >
            Build print job slip ({totalRows} row{totalRows === 1 ? "" : "s"})
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>2. Result</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <iframe
                title="Print job slip preview"
                src={result.url}
                className="h-[60vh] w-full rounded-md border border-surface-fg bg-surface-2"
              />
              <DownloadBar
                url={result.url}
                filename="bharattools-print-job.pdf"
                toolSlug={TOOL}
                outputType="application/pdf"
                label={`Download · ${formatKb(result.bytes)}`}
                secondaryActions={
                  <Button asChild variant="soft" size="lg">
                    <Link
                      href="/quick-send"
                      onClick={() => fire("cross_tool_click", { from_tool: TOOL, to_tool: "quick-send" })}
                    >
                      <Send size={16} />
                      Send via Quick Send
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Build a print job slip to preview it here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
