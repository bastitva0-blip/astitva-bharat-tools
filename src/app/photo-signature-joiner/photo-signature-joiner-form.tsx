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
import { joinerPresets, type JoinerLayout } from "@/lib/presets/joiner";
import { joinPhotoAndSignature } from "@/lib/processing/joiner";
import { formatKb } from "@/lib/processing/image";

export function PhotoSignatureJoinerForm() {
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
      toast.error("Upload both a photo and a signature.");
      return;
    }
    setSubmitting(true);
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
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
      toast.success(`Joined image ready - ${formatKb(r.bytes)}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to combine images.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. Inputs &amp; layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="block">Photo</Label>
            <FileUpload
              accept="image/*"
              maxSize={25 * 1024 * 1024}
              onFiles={(files) => setPhoto(files[0] ?? null)}
              label="Drop a portrait here"
              sublabel="JPG or PNG"
            />
            {photoUrl && (
              <div className="flex items-center gap-3 rounded-md border border-surface-border-subtle p-3">
                <img src={photoUrl} alt="Photo" className="h-20 w-20 rounded object-cover object-top" />
                <div className="flex-1 truncate text-body-sm">
                  <div className="truncate font-medium">{photo?.name}</div>
                  <div className="text-surface-fg-muted">{photo ? formatKb(photo.size) : null}</div>
                </div>
                <Button variant="ghost" size="compact-sm" onClick={() => setPhoto(null)}>
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="block">Signature</Label>
            <FileUpload
              accept="image/*"
              maxSize={10 * 1024 * 1024}
              onFiles={(files) => setSignature(files[0] ?? null)}
              label="Drop a signature here"
              sublabel="JPG or PNG on white paper"
            />
            {sigUrl && (
              <div className="flex items-center gap-3 rounded-md border border-surface-border-subtle p-3">
                <img src={sigUrl} alt="Signature" className="h-12 w-24 rounded bg-white object-contain" />
                <div className="flex-1 truncate text-body-sm">
                  <div className="truncate font-medium">{signature?.name}</div>
                  <div className="text-surface-fg-muted">
                    {signature ? formatKb(signature.size) : null}
                  </div>
                </div>
                <Button variant="ghost" size="compact-sm" onClick={() => setSignature(null)}>
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="block">Output size</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                ...joinerPresets.map((p) => ({ id: p.id, text: p.label })),
                { id: "custom", text: "Custom" },
              ]}
              selectedId={presetId}
              onSelect={setPresetId}
            />
          </div>

          {isCustom && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cw" className="block">
                  Width (px)
                </Label>
                <NumberInput id="cw" value={customW} onValueChange={setCustomW} min={50} max={2000} />
              </div>
              <div>
                <Label htmlFor="ch" className="block">
                  Height (px)
                </Label>
                <NumberInput id="ch" value={customH} onValueChange={setCustomH} min={50} max={2000} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="block">Layout</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                { id: "side-by-side", text: "Side-by-side" },
                { id: "stacked", text: "Stacked" },
              ]}
              selectedId={layout}
              onSelect={(id) => setLayout(id as JoinerLayout)}
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border border-surface-border-subtle p-3">
            <div>
              <Label htmlFor="trim-toggle" className="block font-medium">
                Auto-trim signature
              </Label>
              <p className="mt-1 text-body-xs text-surface-fg-muted">
                Crops the white margin around the signature so it fills its half cleanly.
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
            Combine
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
              <div className="rounded-md border border-surface-fg bg-surface-2 p-4">
                <img
                  src={result.url}
                  alt="Joined photo and signature"
                  className="mx-auto block max-h-[60vh] w-auto"
                />
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="font-semibold">
                  {dims.widthPx}×{dims.heightPx} px
                </span>
                <span className="text-surface-fg-muted">{formatKb(result.bytes)}</span>
              </div>
              <Button asChild variant="solid" fullWidth size="lg">
                <a href={result.url} download="bharattools-photo-signature.jpg">
                  Download JPG
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Combine photo and signature to see the result here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
