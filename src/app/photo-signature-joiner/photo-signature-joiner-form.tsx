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
import { fmt } from "@/i18n/format";
import { useT } from "@/i18n/provider";
import { useConsumePipelineFile } from "@/lib/pipeline";
import { joinerPresets, type JoinerLayout } from "@/lib/presets/joiner";
import { joinPhotoAndSignature } from "@/lib/processing/joiner";
import { formatKb } from "@/lib/processing/image";
import { DownloadBar } from "@/components/tool-shells/primitives";

const TOOL = "photo-signature-joiner";

function fireFileAdded(file: File) {
  fire("file_added", {
    tool_id: TOOL,
    file_count: 1,
    file_size_bucket: sizeBucket(file.size),
    file_type: file.type || "unknown",
  });
}

export function PhotoSignatureJoinerForm() {
  useToolAnalytics(TOOL);
  const dict = useT();
  const t = dict.forms.photoSignatureJoiner;
  const [photo, setPhoto] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [sigUrl, setSigUrl] = useState<string | null>(null);

  const [presetId, setPresetId] = useState<string>("300x150");
  const [layout, setLayout] = useState<JoinerLayout>("side-by-side");
  const [customW, setCustomW] = useState(300);
  const [customH, setCustomH] = useState(150);
  const [autoTrim, setAutoTrim] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ url: string; bytes: number } | null>(null);

  // Pick up a photo handed off from a previous tool (e.g. Image Compressor,
  // Photo Resizer). Fills the photo slot; the signature still needs to be
  // uploaded separately.
  useConsumePipelineFile({
    accept: "image/*",
    onFile: (file) => {
      setPhoto(file);
      fireFileAdded(file);
    },
  });

  const isCustom = presetId === "custom";
  const preset = useMemo(
    () => joinerPresets.find((p) => p.id === presetId),
    [presetId],
  );

  const dims = isCustom
    ? { widthPx: customW, heightPx: customH }
    : { widthPx: preset?.widthPx ?? 300, heightPx: preset?.heightPx ?? 150 };

  useEffect(() => {
    if (preset) setLayout(preset.layout);
  }, [preset]);

  useEffect(() => {
    if (!photo) {
      setPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  useEffect(() => {
    if (!signature) {
      setSigUrl(null);
      return;
    }
    const url = URL.createObjectURL(signature);
    setSigUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [signature]);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  const generate = async () => {
    if (!photo || !signature) {
      toast.error(t.errors.noFiles);
      return;
    }
    setSubmitting(true);
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);

    fire("process_start", { tool_id: TOOL, preset: presetId });
    const t0 = performance.now();
    try {
      const r = await joinPhotoAndSignature({
        photo,
        signature,
        widthPx: dims.widthPx,
        heightPx: dims.heightPx,
        layout,
        autoTrimSignature: autoTrim,
      });
      setResult({ url: URL.createObjectURL(r.blob), bytes: r.bytes });
      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(photo.size + signature.size),
        output_size_bucket: sizeBucket(r.bytes),
      });
      toast.success(fmt(t.toasts.combinedTemplate, { size: formatKb(r.bytes) }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.errors.combineFailed);
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
          <CardTitle>{t.card1Title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="block">{t.photo.label}</Label>
            <FileUpload
              accept="image/*"
              maxSize={25 * 1024 * 1024}
              onFiles={(files) => {
                const f = files[0] ?? null;
                setPhoto(f);
                if (f) fireFileAdded(f);
              }}
              label={t.photo.dropLabel}
              sublabel={t.photo.dropSublabel}
            />
            {photoUrl && (
              <div className="flex items-center gap-3 rounded-md border border-surface-border-subtle p-3">
                <img src={photoUrl} alt={t.photo.alt} className="h-20 w-20 rounded object-cover object-top" />
                <div className="flex-1 truncate text-body-sm">
                  <div className="truncate font-medium">{photo?.name}</div>
                  <div className="text-surface-fg-muted">{photo ? formatKb(photo.size) : null}</div>
                </div>
                <Button variant="ghost" size="compact-sm" onClick={() => setPhoto(null)}>
                  {dict.common.remove}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="block">{t.signature.label}</Label>
            <FileUpload
              accept="image/*"
              maxSize={10 * 1024 * 1024}
              onFiles={(files) => {
                const f = files[0] ?? null;
                setSignature(f);
                if (f) fireFileAdded(f);
              }}
              label={t.signature.dropLabel}
              sublabel={t.signature.dropSublabel}
            />
            {sigUrl && (
              <div className="flex items-center gap-3 rounded-md border border-surface-border-subtle p-3">
                <img src={sigUrl} alt={t.signature.alt} className="h-12 w-24 rounded bg-white object-contain" />
                <div className="flex-1 truncate text-body-sm">
                  <div className="truncate font-medium">{signature?.name}</div>
                  <div className="text-surface-fg-muted">
                    {signature ? formatKb(signature.size) : null}
                  </div>
                </div>
                <Button variant="ghost" size="compact-sm" onClick={() => setSignature(null)}>
                  {dict.common.remove}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="block">{t.size.label}</Label>
            <SegmentedControl
              size="sm"
              variant="default"
              options={[
                ...joinerPresets.map((p) => ({ id: p.id, text: p.label })),
                { id: "custom", text: t.size.custom },
              ]}
              selectedId={presetId}
              onSelect={setPresetId}
            />
          </div>

          {isCustom && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cw" className="block">
                  {t.size.widthLabel}
                </Label>
                <NumberInput id="cw" value={customW} onValueChange={setCustomW} min={50} max={2000} />
              </div>
              <div>
                <Label htmlFor="ch" className="block">
                  {t.size.heightLabel}
                </Label>
                <NumberInput id="ch" value={customH} onValueChange={setCustomH} min={50} max={2000} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="block">{t.layout.label}</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                { id: "side-by-side", text: t.layout.sideBySide },
                { id: "stacked", text: t.layout.stacked },
              ]}
              selectedId={layout}
              onSelect={(id) => setLayout(id as JoinerLayout)}
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border border-surface-border-subtle p-3">
            <div>
              <Label htmlFor="trim-toggle" className="block font-medium">
                {t.trim.label}
              </Label>
              <p className="mt-1 text-body-xs text-surface-fg-muted">
                {t.trim.description}
              </p>
            </div>
            <Switch id="trim-toggle" checked={autoTrim} onCheckedChange={setAutoTrim} />
          </div>

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={!photo || !signature || submitting}
            onClick={generate}
          >
            {t.submit}
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>{t.card2Title}</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="rounded-md border border-surface-fg bg-surface-2 p-4">
                <img
                  src={result.url}
                  alt={t.result.joinedAlt}
                  className="mx-auto block max-h-[60vh] max-w-full w-auto"
                />
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="font-semibold">
                  {dims.widthPx}×{dims.heightPx} px
                </span>
                <span className="text-surface-fg-muted">{formatKb(result.bytes)}</span>
              </div>
              <DownloadBar
                url={result.url}
                filename="bharattools-photo-signature.jpg"
                toolSlug={TOOL}
                outputType="image/jpeg"
                label={t.result.downloadCta}
                fullWidth
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              {t.result.emptyState}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
