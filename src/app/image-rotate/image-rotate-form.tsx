"use client";

import { useCallback, useState } from "react";
import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { durationBucket, fire, sizeBucket } from "@/lib/analytics";
import { useConsumePipelineFile, usePipeline } from "@/lib/pipeline";
import { formatKb } from "@/lib/processing/image";
import { rotateImage, type ImageRotation } from "@/lib/processing/image-rotate";
import { useBlobUrl } from "@/lib/processing/kernel";
import { getToolBySlug } from "@/lib/tools";
import { DownloadBar, ShellChrome } from "@/components/tool-shells/primitives";

const TOOL = "image-rotate";
const MAX_BYTES = 25 * 1024 * 1024;

type OutputMime = "image/jpeg" | "image/png" | "image/webp";

function outputMimeFor(inputType: string): OutputMime {
  if (inputType === "image/png") return "image/png";
  if (inputType === "image/webp") return "image/webp";
  return "image/jpeg";
}

function extFor(mime: OutputMime): string {
  return mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
}

export function ImageRotateForm() {
  const tool = getToolBySlug(TOOL)!;
  const { set: setPipeline } = usePipeline();

  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<ImageRotation>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; width: number; height: number } | null>(null);

  const fileUrl = useBlobUrl(file);
  const resultUrl = useBlobUrl(result?.blob ?? null);

  const adoptFile = useCallback((next: File | null) => {
    setFile(next);
    setResult(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    if (next) {
      fire("file_added", {
        tool_id: TOOL,
        file_count: 1,
        file_size_bucket: sizeBucket(next.size),
        file_type: next.type || "unknown",
      });
    }
  }, []);

  useConsumePipelineFile({ accept: "image/*", onFile: adoptFile, hasFile: file !== null });

  const turn = (by: 90 | 270) => {
    setRotation((cur) => (((cur + by) % 360) as ImageRotation));
    setResult(null);
  };

  const untouched = rotation === 0 && !flipH && !flipV;
  const mime = file ? outputMimeFor(file.type) : "image/jpeg";

  const submit = async () => {
    if (!file) {
      toast.error("Upload a photo first.");
      return;
    }
    if (result) fire("process_retry", { tool_id: TOOL, after: "complete" });
    setSubmitting(true);
    setResult(null);

    fire("process_start", { tool_id: TOOL, preset: `r${rotation}${flipH ? "h" : ""}${flipV ? "v" : ""}` });
    const t0 = performance.now();
    try {
      const rotated = await rotateImage(file, {
        rotation,
        flipHorizontal: flipH,
        flipVertical: flipV,
        mime,
      });
      setResult({ blob: rotated.blob, width: rotated.width, height: rotated.height });

      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(file.size),
        output_size_bucket: sizeBucket(rotated.bytes),
      });

      setPipeline({
        blob: rotated.blob,
        meta: {
          name: filenameFor(file, mime),
          type: mime,
          dims: { w: rotated.width, h: rotated.height },
        },
        fromTool: TOOL,
        createdAt: Date.now(),
      });

      toast.success(`Saved at ${rotated.width}×${rotated.height} px.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rotate this photo.");
      fire("process_error", {
        tool_id: TOOL,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShellChrome tool={tool}>
      <Card variant="outline">
        <CardHeader>
          <CardTitle>
            {result ? "Done · download below" : file ? "Turn it the right way up" : "Upload a photo"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file && (
            <FileUpload
              accept="image/*"
              maxSize={MAX_BYTES}
              onFiles={(files) => adoptFile(files[0] ?? null)}
              label="Drop a photo here"
              sublabel="JPG, PNG or WebP up to 25 MB"
            />
          )}

          {file && !result && fileUrl && (
            <>
              <div className="flex flex-wrap gap-2">
                <Button variant="soft" size="compact-sm" onClick={() => turn(270)}>
                  <RotateCcw className="mr-1.5 size-4" aria-hidden />
                  Rotate left
                </Button>
                <Button variant="soft" size="compact-sm" onClick={() => turn(90)}>
                  <RotateCw className="mr-1.5 size-4" aria-hidden />
                  Rotate right
                </Button>
                <Button
                  variant={flipH ? "solid" : "soft"}
                  size="compact-sm"
                  aria-pressed={flipH}
                  onClick={() => {
                    setFlipH((v) => !v);
                    setResult(null);
                  }}
                >
                  <FlipHorizontal2 className="mr-1.5 size-4" aria-hidden />
                  Flip horizontal
                </Button>
                <Button
                  variant={flipV ? "solid" : "soft"}
                  size="compact-sm"
                  aria-pressed={flipV}
                  onClick={() => {
                    setFlipV((v) => !v);
                    setResult(null);
                  }}
                >
                  <FlipVertical2 className="mr-1.5 size-4" aria-hidden />
                  Flip vertical
                </Button>
              </div>

              {/* Live preview. The CSS transform mirrors exactly what the
                  canvas will do on submit, so there is no surprise between
                  what the user sees here and what downloads. */}
              <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-md border border-surface-border-subtle bg-surface-2 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
                <img
                  src={fileUrl}
                  alt="Preview"
                  className="max-h-[55vh] w-auto max-w-full transition-transform duration-200"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                  }}
                />
              </div>

              <p className="text-body-xs text-surface-fg-muted">
                {untouched
                  ? "Rotate or flip to enable the download."
                  : `${rotation}° clockwise${flipH ? " · mirrored left–right" : ""}${flipV ? " · mirrored top–bottom" : ""}`}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" loading={submitting} disabled={untouched || submitting} onClick={submit}>
                  Apply and save
                </Button>
                <Button variant="soft" size="lg" onClick={() => adoptFile(null)}>
                  Choose a different photo
                </Button>
              </div>
            </>
          )}

          {result && resultUrl && (
            <>
              <div className="flex justify-center rounded-md border border-surface-border-subtle bg-surface-2 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
                <img src={resultUrl} alt="Rotated result" className="max-h-[55vh] w-auto max-w-full" />
              </div>
              <p className="text-body-xs text-surface-fg-muted">
                {result.width}×{result.height} px · {formatKb(result.blob.size)} ·{" "}
                {extFor(mime).toUpperCase()}
              </p>
              <DownloadBar
                url={resultUrl}
                filename={file ? filenameFor(file, mime) : `rotated.${extFor(mime)}`}
                toolSlug={TOOL}
                outputType={mime}
                secondaryActions={
                  <Button variant="soft" size="lg" onClick={() => setResult(null)}>
                    Adjust again
                  </Button>
                }
              />
            </>
          )}
        </CardContent>
      </Card>
    </ShellChrome>
  );
}

function filenameFor(source: File, mime: OutputMime): string {
  const base = source.name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}-rotated.${extFor(mime)}`;
}
