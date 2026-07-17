"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Download, Image as ImageIcon, RotateCcw } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { Progress } from "@devalok/shilp-sutra/ui/progress";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { Textarea } from "@devalok/shilp-sutra/ui/textarea";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics";
import { imageToText, type OcrLanguage, type OcrProgress } from "@/lib/processing/image-to-text";

const LANGUAGE_OPTIONS: { id: OcrLanguage; text: string }[] = [
  { id: "eng", text: "English" },
  { id: "hin", text: "Hindi" },
  { id: "hin+eng", text: "Both" },
];

interface Extracted {
  text: string;
  confidence: number;
}

export function ImageToTextForm() {
  const [language, setLanguage] = useState<OcrLanguage>("eng");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [result, setResult] = useState<Extracted | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = progress !== null;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);
      setProgress({ stage: "preparing", percent: 0 });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      fire("tool_open", { tool_id: "image-to-text", locale: "en" });
      try {
        const out = await imageToText(file, {
          language,
          onProgress: (p) => setProgress(p),
        });
        if (!out.text) {
          setError("No text found in that image. Try a sharper, higher-contrast photo of the text.");
        } else {
          setResult(out);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong reading the image.");
      } finally {
        setProgress(null);
      }
    },
    [language, previewUrl],
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (busy) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-ds-05">
      <div className="space-y-ds-02">
        <p className="text-body-sm font-medium text-surface-fg">Language</p>
        <SegmentedControl
          size="md"
          variant="default"
          options={LANGUAGE_OPTIONS.map((o) => ({ id: o.id, text: o.text }))}
          selectedId={language}
          onSelect={(id) => setLanguage(id as OcrLanguage)}
        />
      </div>

      <Card variant="outline">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <ImageIcon className="size-4 text-accent-11" aria-hidden />
            Read text from an image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-ds-03">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => !busy && inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-border-subtle bg-surface-1 px-ds-04 py-ds-08 text-center transition-colors hover:border-accent-7 hover:bg-accent-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
            aria-disabled={busy}
          >
            <ImageIcon className="size-6 text-surface-fg-subtle" aria-hidden />
            <p className="text-body-sm font-medium text-surface-fg">
              Drop an image with text
            </p>
            <p className="text-body-xs text-surface-fg-muted">
              JPG, PNG or WebP. We read it on your device — nothing is uploaded.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onChange}
              disabled={busy}
            />
          </div>

          {previewUrl && (
            <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-ds-03">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL, on-device only */}
              <img
                src={previewUrl}
                alt="Image being read"
                className="mx-auto block max-h-[300px] w-auto max-w-full"
              />
            </div>
          )}

          {progress && (
            <div className="space-y-ds-02">
              <p className="text-body-sm text-surface-fg-muted">
                {progress.stage === "preparing"
                  ? "Preparing the recognizer (first run downloads a small language model)…"
                  : `Reading text… ${progress.percent}%`}
              </p>
              <Progress
                value={progress.stage === "recognizing" ? progress.percent : undefined}
                size="sm"
              />
            </div>
          )}

          {error && <p className="text-body-sm text-error-11">{error}</p>}
        </CardContent>
      </Card>

      {result && <ResultCard result={result} onReset={reset} />}
    </div>
  );
}

function ResultCard({ result, onReset }: { result: Extracted; onReset: () => void }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy. Select and copy manually.");
    }
  };

  const download = () => {
    const blob = new Blob([result.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(url);
    fire("download_click", { tool_id: "image-to-text", output_type: "txt" });
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Extracted text</CardTitle>
      </CardHeader>
      <CardContent className="space-y-ds-04">
        <Textarea
          value={result.text}
          readOnly
          size="lg"
          rows={10}
          className="font-mono"
          aria-label="Extracted text"
        />
        <p className="text-body-xs text-surface-fg-muted">
          Recognition confidence: {result.confidence}%. Low-contrast or handwritten text may need a
          quick manual fix.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copy} variant="solid">
            <Copy className="size-4" aria-hidden />
            Copy
          </Button>
          <Button onClick={download} variant="soft">
            <Download className="size-4" aria-hidden />
            Download .txt
          </Button>
          <Button onClick={onReset} variant="ghost">
            <RotateCcw className="size-4" aria-hidden />
            Read another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
