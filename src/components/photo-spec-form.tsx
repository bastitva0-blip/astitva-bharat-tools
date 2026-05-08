"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { compressWithDownscale, formatKb, type CropRegionPx } from "@/lib/processing/image";
import type { PhotoSpecPreset } from "@/lib/presets/photo-spec";

interface Props {
  preset: PhotoSpecPreset;
  /** Prefix for the downloaded filename (e.g. "upsc" or "aadhaar"). */
  downloadSlug: string;
  /** Display name used in the CTA button text. */
  ctaLabel?: string;
}

export function PhotoSpecForm({ preset, downloadSlug, ctaLabel }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<number | null>(null);
  const [hitTarget, setHitTarget] = useState<boolean | null>(null);

  const aspect = preset.dimensions.widthPx / preset.dimensions.heightPx;
  const ctaText = ctaLabel ?? `Generate ${preset.name} photo`;

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setCrop(undefined);
    setCompletedCrop(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
      width,
      height,
    );
    setCrop(initial);
  };

  const generate = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error("Adjust the crop area first.");
      return;
    }
    if (completedCrop.width <= 0 || completedCrop.height <= 0) {
      toast.error("Crop must have a positive size.");
      return;
    }

    setSubmitting(true);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResultBytes(null);
    setHitTarget(null);

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

      const result = await compressWithDownscale(
        img,
        cropPx,
        preset.dimensions.widthPx,
        preset.dimensions.heightPx,
        "#ffffff",
        {
          minBytes: preset.kbRange.min * 1024,
          maxBytes: preset.kbRange.max * 1024,
        },
      );

      setResultUrl(URL.createObjectURL(result.blob));
      setResultBytes(result.bytes);
      setHitTarget(result.hitTarget);

      if (result.hitTarget) {
        toast.success(`Saved at ${formatKb(result.bytes)}.`);
      } else if (result.bytes <= preset.kbRange.max * 1024) {
        toast.success(`Saved at ${formatKb(result.bytes)} (under upper limit).`);
      } else {
        toast.error(`Could not hit the KB target — closest was ${formatKb(result.bytes)}.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not process the image.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadName = `bharattools-${downloadSlug}.jpg`;

  return (
    <div className="space-y-6">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. Upload &amp; crop</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="image/*"
            maxSize={25 * 1024 * 1024}
            onFiles={(files) => setFile(files[0] ?? null)}
            label="Drop a photo here"
            sublabel="JPG or PNG up to 25MB"
          />

          {fileUrl && (
            <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-3">
              <ReactCrop
                crop={crop}
                onChange={(_, percent) => setCrop(percent)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                keepSelection
                minWidth={50}
              >
                <img
                  ref={imgRef}
                  src={fileUrl}
                  alt="Source"
                  onLoad={onImageLoad}
                  className="mx-auto block max-h-[60vh] w-auto"
                />
              </ReactCrop>
              <p className="mt-3 text-body-xs text-surface-fg-muted">
                Drag the corners to adjust. Aspect is locked to the {preset.name} spec
                ({preset.dimensions.widthPx}×{preset.dimensions.heightPx} px).
              </p>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={!fileUrl || !completedCrop || submitting}
            onClick={generate}
          >
            {ctaText}
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>2. Result</CardTitle>
        </CardHeader>
        <CardContent>
          {resultUrl ? (
            <div className="space-y-4">
              <div className="rounded-md border border-surface-fg bg-surface-2 p-4">
                <img
                  src={resultUrl}
                  alt="Generated photo"
                  className="mx-auto block max-h-[60vh] w-auto"
                />
              </div>
              {(() => {
                const max = preset.kbRange.max * 1024;
                const min = preset.kbRange.min * 1024;
                const bytes = resultBytes ?? 0;
                const overLimit = bytes > max;
                let label: string;
                let cls: string;
                if (hitTarget) {
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
                      <span>{resultBytes !== null ? formatKb(resultBytes) : "—"}</span>
                    </span>
                    <span className={cls}>{label}</span>
                  </div>
                );
              })()}
              <Button asChild variant="solid" fullWidth size="lg">
                <a href={resultUrl} download={downloadName}>
                  Download JPG
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Process the photo to see the result here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
