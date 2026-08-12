"use client";

import { useCallback, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { durationBucket, fire, sizeBucket } from "@/lib/analytics";
import { useConsumePipelineFile, usePipeline } from "@/lib/pipeline";
import { cropImage, outputFormatFor } from "@/lib/processing/image-crop";
import { formatKb, type CropRegionPx } from "@/lib/processing/image";
import { useBlobUrl } from "@/lib/processing/kernel";
import { getToolBySlug } from "@/lib/tools";
import { DownloadBar, ShellChrome } from "@/components/tool-shells/primitives";

const TOOL = "image-crop";
const MAX_BYTES = 25 * 1024 * 1024;

interface AspectOption {
  id: string;
  label: string;
  /** undefined = free crop. */
  ratio?: number;
  note?: string;
}

const ASPECTS: AspectOption[] = [
  { id: "free", label: "Free" },
  { id: "1-1", label: "1:1", ratio: 1, note: "Square — profile pictures, UPI QR posters." },
  { id: "3-4", label: "3:4", ratio: 3 / 4, note: "Portrait." },
  { id: "4-3", label: "4:3", ratio: 4 / 3, note: "Landscape — most phone cameras." },
  {
    id: "35-45",
    label: "3.5:4.5",
    ratio: 35 / 45,
    note: "Passport / ID photo proportion (3.5 cm × 4.5 cm).",
  },
  { id: "16-9", label: "16:9", ratio: 16 / 9, note: "Widescreen." },
];

export function ImageCropForm() {
  const tool = getToolBySlug(TOOL)!;
  const { set: setPipeline } = usePipeline();

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [aspectId, setAspectId] = useState("free");
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; width: number; height: number } | null>(null);
  // Displayed-pixel → source-pixel factor, captured when the image loads. Kept
  // in state (not read off the ref during render) so the live "selection is N×M
  // px" readout re-renders correctly as the crop box moves.
  const [sourceScale, setSourceScale] = useState({ x: 1, y: 1 });

  const fileUrl = useBlobUrl(file);
  const resultUrl = useBlobUrl(result?.blob ?? null);

  const aspect = ASPECTS.find((a) => a.id === aspectId);

  const adoptFile = useCallback(
    (next: File | null) => {
      setFile(next);
      setResult(null);
      setCrop(undefined);
      setCompletedCrop(null);
      if (next) {
        fire("file_added", {
          tool_id: TOOL,
          file_count: 1,
          file_size_bucket: sizeBucket(next.size),
          file_type: next.type || "unknown",
        });
      }
    },
    [],
  );

  useConsumePipelineFile({ accept: "image/*", onFile: adoptFile, hasFile: file !== null });

  // Seeds a starting selection. ReactCrop's onComplete only fires after the
  // user drags, so the pixel crop has to be derived here too — otherwise
  // "Crop image" stays disabled until the box is nudged.
  const seedCrop = (width: number, height: number, ratio?: number) => {
    const next = ratio
      ? centerCrop(makeAspectCrop({ unit: "%", width: 80 }, ratio, width, height), width, height)
      : centerCrop({ unit: "%" as const, width: 80, height: 80, x: 0, y: 0 }, width, height);
    setCrop(next);
    setCompletedCrop(convertToPixelCrop(next, width, height));
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setSourceScale({
      x: img.naturalWidth / img.width,
      y: img.naturalHeight / img.height,
    });
    seedCrop(img.width, img.height, aspect?.ratio);
  };

  const selectAspect = (id: string) => {
    setAspectId(id);
    fire("preset_selected", { tool_id: TOOL, preset_id: id });
    const img = imgRef.current;
    if (img) seedCrop(img.width, img.height, ASPECTS.find((a) => a.id === id)?.ratio);
  };

  const submit = useCallback(async () => {
    const img = imgRef.current;
    if (!img || !file || !completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) {
      toast.error("Drag a crop box on the photo first.");
      return;
    }
    if (result) fire("process_retry", { tool_id: TOOL, after: "complete" });
    setSubmitting(true);
    setResult(null);

    try {
      const cropped = await performCrop({ img, file, crop: completedCrop, aspectId });
      setResult({ blob: cropped.blob, width: cropped.width, height: cropped.height });
      setPipeline({
        blob: cropped.blob,
        meta: {
          name: outputFilename(file, cropped.format),
          type: cropped.format,
          dims: { w: cropped.width, h: cropped.height },
        },
        fromTool: TOOL,
        createdAt: cropped.finishedAt,
      });
      toast.success(`Cropped to ${cropped.width}×${cropped.height} px.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not crop this image.");
      fire("process_error", {
        tool_id: TOOL,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  }, [file, completedCrop, result, aspectId, setPipeline]);

  const format = file ? outputFormatFor(file.type) : "image/jpeg";

  return (
    <ShellChrome tool={tool}>
      <Card variant="outline">
        <CardHeader>
          <CardTitle>
            {result ? "Done · download below" : fileUrl ? "Drag the crop box" : "Upload a photo"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!fileUrl && (
            <FileUpload
              accept="image/*"
              maxSize={MAX_BYTES}
              onFiles={(files) => adoptFile(files[0] ?? null)}
              label="Drop a photo here"
              sublabel="JPG, PNG or WebP up to 25 MB"
            />
          )}

          {fileUrl && !result && (
            <>
              <div className="space-y-2">
                <Label className="block">Aspect ratio</Label>
                <div className="flex flex-wrap gap-2">
                  {ASPECTS.map((a) => (
                    <Button
                      key={a.id}
                      variant={a.id === aspectId ? "solid" : "soft"}
                      size="compact-sm"
                      onClick={() => selectAspect(a.id)}
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
                <p className="text-body-xs text-surface-fg-muted">
                  {aspect?.note ?? "Drag any edge — width and height move independently."}
                </p>
              </div>

              <div className="rounded-md border border-surface-border-subtle bg-surface-1 p-3">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percent) => setCrop(percent)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect?.ratio}
                  keepSelection
                  minWidth={20}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
                  <img
                    ref={imgRef}
                    src={fileUrl}
                    alt="Source"
                    onLoad={onImageLoad}
                    className="mx-auto block w-auto max-w-full"
                    // react-image-crop's stylesheet forces `max-height: inherit`
                    // on the child image, which beats a max-h-* utility. Inline
                    // style is the only thing that reliably caps a tall photo.
                    style={{ maxHeight: "60vh" }}
                  />
                </ReactCrop>
                {completedCrop && (
                  <p className="mt-3 text-body-xs text-surface-fg-muted">
                    Selection: {Math.round(completedCrop.width * sourceScale.x)}×
                    {Math.round(completedCrop.height * sourceScale.y)} px of the original
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" loading={submitting} disabled={!completedCrop || submitting} onClick={submit}>
                  Crop image
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
                <img src={resultUrl} alt="Cropped result" className="max-h-[50vh] w-auto max-w-full" />
              </div>
              <p className="text-body-xs text-surface-fg-muted">
                {result.width}×{result.height} px · {formatKb(result.blob.size)} ·{" "}
                {format.replace("image/", "").toUpperCase()}
              </p>
              <DownloadBar
                url={resultUrl}
                filename={file ? outputFilename(file, format) : "cropped.jpg"}
                toolSlug={TOOL}
                outputType={format}
                secondaryActions={
                  <Button variant="soft" size="lg" onClick={() => setResult(null)}>
                    Edit crop again
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

// The crop itself, plus its timing and analytics, lives outside the component.
// Clock reads are impure, and a component body — including the callbacks
// defined in it — has to stay pure for React's compiler to reason about it.
async function performCrop({
  img,
  file,
  crop,
  aspectId,
}: {
  img: HTMLImageElement;
  file: File;
  crop: PixelCrop;
  aspectId: string;
}) {
  fire("process_start", { tool_id: TOOL, preset: aspectId });
  const t0 = performance.now();

  // The crop box is in displayed-image coordinates; scale to the source.
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;
  const cropPx: CropRegionPx = {
    x: crop.x * scaleX,
    y: crop.y * scaleY,
    width: crop.width * scaleX,
    height: crop.height * scaleY,
  };

  const format = outputFormatFor(file.type);
  const cropped = await cropImage(img, cropPx, format);

  fire("process_complete", {
    tool_id: TOOL,
    duration_bucket: durationBucket(performance.now() - t0),
    input_size_bucket: sizeBucket(file.size),
    output_size_bucket: sizeBucket(cropped.bytes),
  });

  return { ...cropped, format, finishedAt: Date.now() };
}

function outputFilename(source: File, format: string): string {
  const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
  const base = source.name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}-cropped.${ext}`;
}
