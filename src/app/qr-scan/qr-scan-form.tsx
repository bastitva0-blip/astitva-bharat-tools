"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Camera, Copy, ExternalLink, Image as ImageIcon, RotateCcw } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics";

type Mode = "camera" | "image";

interface Decoded {
  text: string;
  isUrl: boolean;
  url?: URL;
}

function parseDecoded(text: string): Decoded {
  try {
    const url = new URL(text);
    if (/^https?:$/.test(url.protocol) || /^upi:$/.test(url.protocol) || /^tel:$/.test(url.protocol) || /^mailto:$/.test(url.protocol)) {
      return { text, isUrl: true, url };
    }
  } catch {
    // not a URL
  }
  return { text, isUrl: false };
}

export function QrScanForm() {
  const [mode, setMode] = useState<Mode>("camera");
  const [decoded, setDecoded] = useState<Decoded | null>(null);

  const onDecoded = useCallback((text: string) => {
    setDecoded(parseDecoded(text));
    fire("tool_open", { tool_id: "qr-scan", locale: "en" });
  }, []);

  const reset = () => setDecoded(null);

  return (
    <div className="space-y-ds-05">
      <SegmentedControl
        size="md"
        variant="soft"
        options={[
          { id: "camera", text: "Camera" },
          { id: "image", text: "From image" },
        ]}
        value={mode}
        onValueChange={(id) => {
          setMode(id as Mode);
          setDecoded(null);
        }}
      />

      <Card variant="outline">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            {mode === "camera" ? (
              <>
                <Camera className="size-4 text-accent-11" aria-hidden />
                Scan with camera
              </>
            ) : (
              <>
                <ImageIcon className="size-4 text-accent-11" aria-hidden />
                Scan from an image
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mode === "camera" ? (
            <CameraScanner onDecoded={onDecoded} />
          ) : (
            <ImageScanner onDecoded={onDecoded} />
          )}
        </CardContent>
      </Card>

      {decoded && <ResultCard decoded={decoded} onReset={reset} />}
    </div>
  );
}

function CameraScanner({ onDecoded }: { onDecoded: (text: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let scanner: QrScanner | null = null;
    let cancelled = false;
    let handled = false;

    (async () => {
      try {
        const hasCam = await QrScanner.hasCamera();
        if (!hasCam) {
          setError("No camera available on this device. Switch to 'From image' to upload a QR.");
          return;
        }
        scanner = new QrScanner(
          video,
          (result) => {
            if (handled) return;
            handled = true;
            onDecoded(result.data);
            scanner?.stop();
            setRunning(false);
          },
          {
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
            returnDetailedScanResult: true,
          },
        );
        await scanner.start();
        if (cancelled) {
          scanner.destroy();
          return;
        }
        setRunning(true);
      } catch (e) {
        setError(
          e instanceof Error && e.name === "NotAllowedError"
            ? "Camera permission denied. Allow camera access or switch to 'From image'."
            : e instanceof Error
              ? e.message
              : "Could not start the camera.",
        );
      }
    })();

    return () => {
      cancelled = true;
      scanner?.destroy();
    };
  }, [onDecoded]);

  return (
    <div className="space-y-ds-03">
      <div className="overflow-hidden rounded-md border border-surface-border-subtle bg-black">
        <video
          ref={videoRef}
          className="block aspect-square w-full object-cover"
          playsInline
          muted
        />
      </div>
      {error ? (
        <p className="text-body-sm text-error-11">{error}</p>
      ) : (
        <p className="text-body-sm text-surface-fg-muted">
          {running
            ? "Hold the QR code inside the frame. We'll detect it automatically."
            : "Starting camera…"}
        </p>
      )}
    </div>
  );
}

function ImageScanner({ onDecoded }: { onDecoded: (text: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setBusy(true);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      try {
        const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
        onDecoded(result.data);
      } catch {
        setError("No QR code found in that image. Try a clearer photo or a different image.");
      } finally {
        setBusy(false);
      }
    },
    [onDecoded, previewUrl],
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="space-y-ds-03">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-border-subtle bg-surface-1 px-ds-04 py-ds-08 text-center transition-colors hover:border-accent-7 hover:bg-accent-2"
      >
        <ImageIcon className="size-6 text-surface-fg-subtle" aria-hidden />
        <p className="text-body-sm font-medium text-surface-fg">
          Drop an image with a QR code
        </p>
        <p className="text-body-xs text-surface-fg-muted">
          JPG, PNG or WebP. We decode it on your device.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onChange}
        />
      </div>
      {previewUrl && (
        <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-ds-03">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
          <img
            src={previewUrl}
            alt="Scanned image preview"
            className="mx-auto block max-h-[300px] max-w-full w-auto"
          />
        </div>
      )}
      {busy && (
        <p className="text-body-sm text-surface-fg-muted">Decoding…</p>
      )}
      {error && <p className="text-body-sm text-error-11">{error}</p>}
    </div>
  );
}

function ResultCard({ decoded, onReset }: { decoded: Decoded; onReset: () => void }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(decoded.text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy. Select and copy manually.");
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Decoded</CardTitle>
      </CardHeader>
      <CardContent className="space-y-ds-04">
        <div className="break-all rounded-md border border-surface-border-subtle bg-surface-2 p-ds-04 text-body-sm font-mono text-surface-fg">
          {decoded.text}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copy} variant="solid">
            <Copy className="size-4" aria-hidden />
            Copy
          </Button>
          {decoded.isUrl && decoded.url && (
            <Button asChild variant="soft">
              <a href={decoded.url.toString()} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" aria-hidden />
                Open {decoded.url.protocol === "upi:" ? "in UPI app" : "link"}
              </a>
            </Button>
          )}
          <Button onClick={onReset} variant="ghost">
            <RotateCcw className="size-4" aria-hidden />
            Scan another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
