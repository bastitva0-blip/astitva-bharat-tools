"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, ChevronUp, SwitchCamera, Trash2, Upload } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

const TOOL = "scan-to-pdf";

type Mode = "camera" | "upload";

interface Page {
  id: string;
  dataUrl: string;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

export function ScanToPdfForm() {
  const [mode, setMode] = useState<Mode>("camera");
  const [pages, setPages] = useState<Page[]>([]);
  const [converting, setConverting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasAnalyticsFired, setHasAnalyticsFired] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Camera access denied. Use Upload tab instead.");
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopStream();
    }
    return () => {
      if (mode === "camera") stopStream();
    };
  }, [mode, startCamera, stopStream]);

  // Restart camera when facingMode changes
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    }
  }, [facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  const fireOnce = useCallback(() => {
    if (!hasAnalyticsFired) {
      fire("process_start", { tool_id: TOOL });
      setHasAnalyticsFired(true);
    }
  }, [hasAnalyticsFired]);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setPages((prev) => [...prev, { id: uid(), dataUrl }]);
    fireOnce();
    toast.success("Page captured.");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    let fired = false;
    files.forEach((file) => {
      if (file.type === "application/pdf") {
        toast.error("PDF files cannot be added as pages. Please select image files.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPages((prev) => [...prev, { id: uid(), dataUrl }]);
        if (!fired) {
          fireOnce();
          fired = true;
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same files can be re-selected
    e.target.value = "";
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const movePage = (id: string, dir: -1 | 1) => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const convertToPdf = async () => {
    if (pages.length === 0) {
      toast.error("Add at least one page first.");
      return;
    }
    setConverting(true);
    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const doc = await PDFDocument.create();

      for (const page of pages) {
        const isJpg =
          page.dataUrl.startsWith("data:image/jpeg") ||
          page.dataUrl.startsWith("data:image/jpg");
        const base64 = page.dataUrl.split(",")[1];
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        let embedded;
        if (isJpg) {
          embedded = await doc.embedJpg(bytes.buffer as ArrayBuffer);
        } else {
          embedded = await doc.embedPng(bytes.buffer as ArrayBuffer);
        }

        const { width, height } = embedded;
        const pdfPage = doc.addPage([width, height]);
        pdfPage.drawImage(embedded, { x: 0, y: 0, width, height });
      }

      const saved = await doc.save();
      const blob = new Blob([saved.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scan-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      fire("download_click", { tool_id: TOOL, output_type: "application/pdf" });
      toast.success("PDF downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to convert to PDF.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex gap-2 border-b border-surface-border-subtle">
        <button
          type="button"
          onClick={() => setMode("camera")}
          className={[
            "flex items-center gap-2 px-4 py-2 text-body-sm font-medium transition-colors",
            mode === "camera"
              ? "border-b-2 border-brand-primary text-brand-primary"
              : "text-surface-fg-muted hover:text-surface-fg",
          ].join(" ")}
        >
          <Camera size={16} />
          Camera
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={[
            "flex items-center gap-2 px-4 py-2 text-body-sm font-medium transition-colors",
            mode === "upload"
              ? "border-b-2 border-brand-primary text-brand-primary"
              : "text-surface-fg-muted hover:text-surface-fg",
          ].join(" ")}
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <div className="space-y-4">
          {mode === "camera" ? (
            <div className="space-y-3">
              {cameraError ? (
                <div className="flex min-h-[240px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle bg-surface-2 p-6 text-center text-body-sm text-surface-fg-muted">
                  {cameraError}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-md border border-surface-border-subtle bg-black"
                  style={{ maxHeight: "360px", objectFit: "cover" }}
                />
              )}
              <div className="flex gap-2">
                <Button fullWidth size="lg" onClick={capture} disabled={!!cameraError}>
                  <Camera size={18} />
                  Capture
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  aria-label="Switch camera"
                  onClick={() =>
                    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
                  }
                  disabled={!!cameraError}
                >
                  <SwitchCamera size={18} />
                </Button>
              </div>
            </div>
          ) : (
            <label className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-surface-border-subtle bg-surface-2 p-6 text-center hover:bg-surface-3 transition-colors">
              <Upload size={32} className="text-surface-fg-muted" />
              <span className="text-body-sm font-medium">Click to select images</span>
              <span className="text-body-xs text-surface-fg-muted">JPG, PNG, WebP — multiple allowed</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleUpload}
              />
            </label>
          )}
        </div>

        {/* Pages list + actions */}
        <div className="space-y-4">
          <div className="text-body-sm font-medium">
            Pages ({pages.length})
          </div>

          {pages.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              No pages yet. Capture or upload to add pages.
            </div>
          ) : (
            <ul className="divide-y divide-surface-border-subtle rounded-md border border-surface-border-subtle max-h-[400px] overflow-y-auto">
              {pages.map((page, idx) => (
                <li key={page.id} className="flex items-center gap-3 p-3">
                  <span className="w-6 shrink-0 text-body-sm text-surface-fg-muted">{idx + 1}.</span>
                  <img
                    src={page.dataUrl}
                    alt={`Page ${idx + 1}`}
                    className="h-14 w-14 shrink-0 rounded border border-surface-border-subtle object-cover"
                  />
                  <div className="flex-1 min-w-0 text-body-sm text-surface-fg-muted truncate">
                    Page {idx + 1}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move up"
                    disabled={idx === 0}
                    onClick={() => movePage(page.id, -1)}
                  >
                    <ChevronUp size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move down"
                    disabled={idx === pages.length - 1}
                    onClick={() => movePage(page.id, 1)}
                  >
                    <ChevronDown size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete page"
                    onClick={() => removePage(page.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button
            fullWidth
            size="lg"
            loading={converting}
            disabled={pages.length === 0 || converting}
            onClick={convertToPdf}
          >
            Convert to PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
