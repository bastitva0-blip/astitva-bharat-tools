"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { NumberInput } from "@devalok/shilp-sutra/ui/number-input";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { Switch } from "@devalok/shilp-sutra/ui/switch";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { durationBucket, fire, sizeBucket, useToolAnalytics } from "@/lib/analytics";
import { fitGrid, photoSizePresets, sheetPresets } from "@/lib/presets/print-sheet";
import { buildPrintSheetPdf } from "@/lib/processing/print-sheet";

const TOOL = "print-sheet";

export function PrintSheetForm() {
  useToolAnalytics(TOOL);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string>("a4");
  const [photoId, setPhotoId] = useState<string>("passport");
  const [customW, setCustomW] = useState<number>(35);
  const [customH, setCustomH] = useState<number>(45);
  const [removeBg, setRemoveBg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"idle" | "bg" | "pdf">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const sheet = useMemo(
    () => sheetPresets.find((s) => s.id === sheetId) ?? sheetPresets[0],
    [sheetId],
  );
  const photoBase = useMemo(
    () => photoSizePresets.find((p) => p.id === photoId) ?? photoSizePresets[0],
    [photoId],
  );
  const isCustom = photoBase.custom === true;
  const photo = useMemo(
    () =>
      isCustom
        ? { widthMm: customW, heightMm: customH }
        : { widthMm: photoBase.widthMm, heightMm: photoBase.heightMm },
    [isCustom, customW, customH, photoBase],
  );
  const grid = useMemo(() => fitGrid(sheet, photo), [sheet, photo]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const generate = async () => {
    if (!file) {
      toast.error("Upload a photo first.");
      return;
    }
    if (grid.total === 0) {
      toast.error("Photo doesn't fit on this sheet - pick a smaller size.");
      return;
    }
    setSubmitting(true);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);

    fire("process_start", { tool_id: TOOL });
    const t0 = performance.now();
    // Background-removal failures already emit bg_process_error (+ maybe
    // library_load_error); don't also double-count them as process_error.
    let bgFailed = false;
    try {
      let image: Blob = file;
      if (removeBg) {
        setPhase("bg");
        fire("bg_process_start", { tool_id: TOOL });
        const bgT0 = performance.now();
        try {
          let mod: typeof import("@imgly/background-removal");
          try {
            mod = await import("@imgly/background-removal");
          } catch (loadErr) {
            fire("library_load_error", { lib: "background-removal" });
            throw loadErr;
          }
          image = await mod.removeBackground(file);
          fire("bg_process_complete", {
            tool_id: TOOL,
            duration_bucket: durationBucket(performance.now() - bgT0),
          });
        } catch (bgErr) {
          bgFailed = true;
          fire("bg_process_error", {
            tool_id: TOOL,
            error_type: bgErr instanceof Error ? bgErr.name : "unknown",
          });
          throw bgErr;
        }
      }
      setPhase("pdf");
      const bytes = await buildPrintSheetPdf({ image, sheet, photo });
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(file.size),
        output_size_bucket: sizeBucket(blob.size),
      });
      toast.success(`Sheet ready - ${grid.total} photos.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate PDF.");
      if (!bgFailed) {
        fire("process_error", {
          tool_id: TOOL,
          error_type: err instanceof Error ? err.name : "unknown",
        });
      }
    } finally {
      setSubmitting(false);
      setPhase("idle");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="image/*"
            maxSize={25 * 1024 * 1024}
            onFiles={(files) => {
              const f = files[0] ?? null;
              setFile(f);
              if (f) {
                fire("file_added", {
                  tool_id: TOOL,
                  file_count: 1,
                  file_size_bucket: sizeBucket(f.size),
                  file_type: f.type || "unknown",
                });
              }
            }}
            label="Drop a portrait here"
            sublabel="Best results: a passport-prepped JPG from the Exam Photo Resizer."
          />
          {previewUrl && (
            <div className="flex items-start gap-3 rounded-md border border-surface-border-subtle p-3">
              <img
                src={previewUrl}
                alt="Source preview"
                className="h-32 w-24 shrink-0 rounded object-cover object-top"
              />
              <div className="min-w-0 flex-1 text-body-sm">
                <div className="truncate font-medium">{file?.name}</div>
                <div className="text-surface-fg-muted">
                  {file ? `${(file.size / 1024).toFixed(0)} KB` : null}
                </div>
                <Button variant="ghost" size="compact-sm" className="mt-2" onClick={() => setFile(null)}>
                  Remove
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="block">Sheet size</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={sheetPresets.map((s) => ({ id: s.id, text: s.label }))}
              selectedId={sheetId}
              onSelect={setSheetId}
            />
          </div>

          <div className="space-y-2">
            <Label className="block">Photo size</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                { id: "passport", text: "Passport" },
                { id: "aadhaar", text: "Aadhaar" },
                { id: "2x2", text: "2×2 in" },
                { id: "custom", text: "Custom" },
              ]}
              selectedId={photoId}
              onSelect={setPhotoId}
            />
            <p className="text-body-xs text-surface-fg-muted">
              {isCustom
                ? "Enter dimensions below."
                : `${photoBase.widthMm}×${photoBase.heightMm} mm`}
            </p>
          </div>

          {isCustom && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cw">Width (mm)</Label>
                <NumberInput id="cw" value={customW} onValueChange={setCustomW} min={10} max={200} />
              </div>
              <div>
                <Label htmlFor="ch">Height (mm)</Label>
                <NumberInput id="ch" value={customH} onValueChange={setCustomH} min={10} max={250} />
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-4 rounded-md border border-surface-border-subtle p-3">
            <div>
              <Label htmlFor="bg-toggle" className="block font-medium">
                Remove background
              </Label>
              <p className="mt-1 text-body-xs text-surface-fg-muted">
                Cuts the subject out and places it on a clean white tile. Runs on-device - first
                run downloads a ~50 MB model.
              </p>
            </div>
            <Switch id="bg-toggle" checked={removeBg} onCheckedChange={setRemoveBg} />
          </div>

          <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-3 text-body-sm">
            {grid.total > 0 ? (
              <>
                <span className="font-semibold">
                  {grid.cols} × {grid.rows} = {grid.total} photos
                </span>{" "}
                <span className="text-surface-fg-muted">
                  on {sheet.label} at {photo.widthMm}×{photo.heightMm} mm.
                </span>
              </>
            ) : (
              <span className="text-error-11">
                Photo too large for {sheet.label}. Pick a smaller photo size.
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Button
              fullWidth
              size="lg"
              loading={submitting}
              disabled={!file || grid.total === 0 || submitting}
              onClick={generate}
            >
              {phase === "bg"
                ? "Removing background…"
                : phase === "pdf"
                  ? "Building PDF…"
                  : "Generate print sheet"}
            </Button>
            {phase === "bg" && (
              <p className="text-center text-body-xs text-surface-fg-muted">
                First run takes a moment while the model downloads.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>2. Result</CardTitle>
        </CardHeader>
        <CardContent>
          {resultUrl ? (
            <div className="space-y-4">
              <iframe
                title="Print sheet preview"
                src={resultUrl}
                className="h-[70vh] w-full rounded-md border border-surface-fg bg-surface-2"
              />
              <Button asChild variant="solid" fullWidth size="lg">
                <a href={resultUrl} download="print-sheet.pdf">
                  Download PDF
                </a>
              </Button>
              <p className="text-body-sm text-surface-fg-muted">
                Print at <span className="font-semibold">100% / Actual size</span> - do not "fit to page" - so dimensions stay accurate.
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Generate a sheet to see the preview here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
