"use client";

import { useCallback, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Pencil } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { useT } from "@/i18n/provider";
import { durationBucket, fire, sizeBucket } from "@/lib/analytics";
import { usePipeline, useConsumePipelineFile } from "@/lib/pipeline";
import type { CropRegionPx } from "@/lib/processing/image";
import { formatKb } from "@/lib/processing/image";
import { useBlobUrl } from "@/lib/processing/kernel";
import type { PhotoSpec } from "@/lib/spec-db";
import type { Tool } from "@/lib/tools";
import { ShellChrome } from "./primitives";

export interface ResizeResult {
  blob: Blob;
  bytes: number;
  hitTarget: boolean;
}

interface ResizeToSpecShellProps {
  tool: Tool;
  preset: PhotoSpec;
  /** Per-tool processor — owns the crop → canvas → JPG pipeline. */
  onProcess: (img: HTMLImageElement, cropPx: CropRegionPx) => Promise<ResizeResult>;
  /** Download filename, e.g. "bharattools-upsc.jpg". */
  outputFilename: string;
  /** Disable submit + show a "Coming soon" banner. Layout still renders. */
  comingSoon?: boolean;
}

// ResizeToSpecShell — base-infrastructure-plan §3.
//
// Distinct interaction shape from CompressToTargetShell:
//   - Hero is the crop canvas (full width) — the user is COMPOSING, not just
//     hitting a number.
//   - A compact "spec contract" strip pins the target dims + KB band so the
//     user always knows what they're matching.
//   - Result REPLACES the crop view inline (with an "Edit crop" affordance)
//     instead of sitting in a separate column. The crop is the work; the
//     result is the proof.
export function ResizeToSpecShell({
  tool,
  preset,
  onProcess,
  outputFilename,
  comingSoon = false,
}: ResizeToSpecShellProps) {
  const dict = useT();
  const { set: setPipeline } = usePipeline();

  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultMeta, setResultMeta] = useState<{ bytes: number; hitTarget: boolean } | null>(null);

  // Object URLs managed by the kernel hook — created on blob change, revoked
  // on unmount or replacement. No manual revoke needed.
  const fileUrl = useBlobUrl(file);
  const resultUrl = useBlobUrl(resultBlob);

  const aspect = preset.dimensions.widthPx / preset.dimensions.heightPx;

  // Single entry point for setting the source file — both the picker and the
  // pipeline consumer route through here so reset state + analytics stay in
  // one place.
  const adoptFile = useCallback(
    (next: File | null) => {
      setFile(next);
      setCrop(undefined);
      setCompletedCrop(null);
      setResultBlob(null);
      setResultMeta(null);
      if (next) {
        fire("file_added", {
          tool_id: tool.slug,
          file_count: 1,
          file_size_bucket: sizeBucket(next.size),
        });
      }
    },
    [tool.slug],
  );

  // Pick up an image handed off from a previous tool.
  useConsumePipelineFile({
    accept: "image/*",
    onFile: adoptFile,
  });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
      width,
      height,
    );
    setCrop(initial);
  };

  const submit = useCallback(async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error(dict.shell.errors.noFile);
      return;
    }
    if (completedCrop.width <= 0 || completedCrop.height <= 0) {
      toast.error(dict.shell.errors.processFailed);
      return;
    }

    setSubmitting(true);
    setResultBlob(null);
    setResultMeta(null);

    fire("process_start", { tool_id: tool.slug, preset: preset.slug });
    const t0 = performance.now();
    try {
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      const cropPx: CropRegionPx = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      const r = await onProcess(img, cropPx);
      setResultBlob(r.blob);
      setResultMeta({ bytes: r.bytes, hitTarget: r.hitTarget });

      fire("process_complete", {
        tool_id: tool.slug,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(file?.size ?? 0),
        output_size_bucket: sizeBucket(r.bytes),
      });

      // Hand the output to the pipeline.
      setPipeline({
        blob: r.blob,
        meta: { name: outputFilename, type: r.blob.type || "image/jpeg" },
        fromTool: tool.slug,
        createdAt: Date.now(),
      });

      const max = preset.kbRange.max * 1024;
      if (r.hitTarget) {
        toast.success(`Saved at ${formatKb(r.bytes)}.`);
      } else if (r.bytes <= max) {
        toast.success(`Saved at ${formatKb(r.bytes)} (under upper limit).`);
      } else {
        toast.error(`Could not hit the KB target — closest was ${formatKb(r.bytes)}.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : dict.shell.errors.processFailed;
      toast.error(message);
      fire("process_error", {
        tool_id: tool.slug,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  }, [completedCrop, onProcess, tool.slug, preset.slug, preset.kbRange.max, dict.shell.errors, setPipeline, outputFilename, file]);

  const onDownloadClick = useCallback(() => {
    fire("download_click", { tool_id: tool.slug, output_type: "image/jpeg" });
  }, [tool.slug]);

  const onEditAgain = () => {
    setResultBlob(null);
    setResultMeta(null);
  };

  return (
    <ShellChrome tool={tool} comingSoon={comingSoon}>
      {/* Compact spec contract strip — the target stays visible above the work. */}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-surface-border-subtle bg-surface-2 px-4 py-3 text-body-sm">
        <SpecPill label={preset.name} value={preset.fullName} highlight />
        <SpecPill
          label="Dimensions"
          value={`${preset.dimensions.widthPx}×${preset.dimensions.heightPx} px`}
        />
        <SpecPill
          label="File size"
          value={
            preset.kbRange.min === 0
              ? `up to ${preset.kbRange.max} KB`
              : `${preset.kbRange.min}–${preset.kbRange.max} KB`
          }
        />
        <SpecPill label="Format" value="JPG · white bg" />
      </div>

      {/* Hero: the crop canvas (or file picker before upload). Result
          replaces the crop view inline once processing finishes. */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>
            {resultMeta ? "Done · download below" : fileUrl ? "Adjust the crop" : "Upload a photo"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!fileUrl && (
            <FileUpload
              accept="image/*"
              maxSize={25 * 1024 * 1024}
              onFiles={(files) => adoptFile(files[0] ?? null)}
              label="Drop a photo here"
              sublabel="JPG, PNG or HEIC up to 25 MB"
            />
          )}

          {fileUrl && !resultMeta && (
            <>
              <div className="rounded-md border border-surface-border-subtle bg-surface-1 p-3">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percent) => setCrop(percent)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  keepSelection
                  minWidth={50}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
                  <img
                    ref={imgRef}
                    src={fileUrl}
                    alt="Source"
                    onLoad={onImageLoad}
                    className="mx-auto block max-h-[60vh] max-w-full w-auto"
                  />
                </ReactCrop>
                <p className="mt-3 text-body-xs text-surface-fg-muted">
                  Drag the corners to adjust. Aspect locked to{" "}
                  {preset.dimensions.widthPx}×{preset.dimensions.heightPx} px.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  loading={submitting}
                  disabled={!completedCrop || submitting || comingSoon}
                  onClick={submit}
                >
                  Generate {preset.name} photo
                </Button>
                <Button variant="soft" size="lg" onClick={() => adoptFile(null)}>
                  Choose a different photo
                </Button>
              </div>
            </>
          )}

          {resultMeta && resultUrl && (
            <>
              <div className="rounded-md border border-surface-fg bg-surface-2 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
                <img
                  src={resultUrl}
                  alt="Generated photo"
                  className="mx-auto block max-h-[60vh] max-w-full w-auto"
                />
              </div>

              <ResultStrip result={resultMeta} preset={preset} />

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="solid" size="lg">
                  <a href={resultUrl} download={outputFilename} onClick={onDownloadClick}>
                    {dict.common.download}
                  </a>
                </Button>
                <Button variant="soft" size="lg" onClick={onEditAgain}>
                  <Pencil className="mr-1.5 size-4" aria-hidden />
                  Edit crop
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {preset.notes && preset.notes.length > 0 && (
        <section className="mt-6 rounded-md border border-dashed border-surface-border-subtle p-4">
          <h3 className="text-body-sm font-semibold">Watch out for</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-body-sm text-surface-fg-muted">
            {preset.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}
    </ShellChrome>
  );
}

function SpecPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-body-xs uppercase tracking-wide text-surface-fg-muted">{label}</span>
      <span className={highlight ? "font-semibold text-accent-11" : "font-medium text-surface-fg"}>
        {value}
      </span>
    </div>
  );
}

function ResultStrip({
  result,
  preset,
}: {
  result: { bytes: number; hitTarget: boolean };
  preset: PhotoSpec;
}) {
  const max = preset.kbRange.max * 1024;
  const min = preset.kbRange.min * 1024;
  const overLimit = result.bytes > max;
  let label: string;
  let cls: string;
  if (result.hitTarget) {
    label = "Within KB target";
    cls = "text-success-11";
  } else if (overLimit) {
    label = `Over upper limit (${preset.kbRange.max} KB)`;
    cls = "text-error-11";
  } else if (min === 0) {
    label = "Saved · safe to upload";
    cls = "text-success-11";
  } else {
    label = "Under upper limit · safe to upload";
    cls = "text-success-11";
  }
  return (
    <div className="flex items-center justify-between text-body-sm">
      <span>
        <span className="font-semibold">
          {preset.dimensions.widthPx}×{preset.dimensions.heightPx} px
        </span>
        {" · "}
        <span>{formatKb(result.bytes)}</span>
      </span>
      <span className={cls}>{label}</span>
    </div>
  );
}
