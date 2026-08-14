"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Check, PenLine, Type, Image, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

// ─── Types ───────────────────────────────────────────────────────────────────

type SignatureTab = "draw" | "type" | "upload";
type TypeStyle = "cursive" | "print";

interface Placement {
  page: number;
  x: number;
  y: number;
  width: number;
  pdfX: number;
  pdfY: number;
  pdfWidth: number;
  pdfHeight: number;
}

interface RenderedPage {
  pageNum: number;
  dataUrl: string;
  displayWidth: number;
  displayHeight: number;
  pdfWidth: number;
  pdfHeight: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function textToDataUrl(text: string, fontSize: number, style: TypeStyle): string {
  const font = style === "cursive" ? `${fontSize}px cursive` : `${fontSize}px sans-serif`;
  const offscreen = document.createElement("canvas");
  const ctx = offscreen.getContext("2d")!;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const width = Math.ceil(metrics.width) + 20;
  const height = fontSize + 20;
  offscreen.width = width;
  offscreen.height = height;
  ctx.font = font;
  ctx.fillStyle = "#111";
  ctx.fillText(text, 10, fontSize + 5);
  return offscreen.toDataURL("image/png");
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DrawTab({ onDone }: { onDone: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const doDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const done = () => {
    const dataUrl = canvasRef.current!.toDataURL("image/png");
    onDone(dataUrl);
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="w-full touch-none rounded-lg border border-surface-border bg-white"
        onMouseDown={startDraw}
        onMouseMove={doDraw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={doDraw}
        onTouchEnd={endDraw}
      />
      <div className="flex gap-2">
        <Button variant="soft" size="sm" onClick={clear}>
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Clear
        </Button>
        <Button size="sm" onClick={done}>
          <Check className="mr-1 h-3.5 w-3.5" />
          Use this signature
        </Button>
      </div>
    </div>
  );
}

function TypeTab({ onDone }: { onDone: (dataUrl: string) => void }) {
  const [name, setName] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [style, setStyle] = useState<TypeStyle>("cursive");

  const preview = name.trim()
    ? { text: name, font: style === "cursive" ? "cursive" : "sans-serif", size: fontSize }
    : null;

  const done = () => {
    if (!name.trim()) {
      toast.error("Enter your name first.");
      return;
    }
    onDone(textToDataUrl(name.trim(), fontSize, style));
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-body-sm font-medium">Font size</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value={24}>24</option>
            <option value={32}>32</option>
            <option value={48}>48</option>
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-body-sm font-medium">Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as TypeStyle)}
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="cursive">Cursive</option>
            <option value="print">Print</option>
          </select>
        </div>
      </div>
      {preview && (
        <div
          className="rounded-lg border border-surface-border bg-white px-4 py-3 text-center"
          style={{ fontFamily: preview.font, fontSize: `${preview.size}px`, color: "#111" }}
        >
          {preview.text}
        </div>
      )}
      <Button size="sm" onClick={done} disabled={!name.trim()}>
        <Check className="mr-1 h-3.5 w-3.5" />
        Use this signature
      </Button>
    </div>
  );
}

function UploadTab({ onDone }: { onDone: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a PNG or JPG image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onDone(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop signature image here or click to browse"
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors ${
        isDragging
          ? "border-accent bg-accent/5"
          : "border-surface-border bg-surface-2 hover:border-accent/60"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0] ?? null);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      <Image className="h-8 w-8 text-surface-fg-muted" />
      <p className="text-body-sm font-medium">Drop PNG / JPG here</p>
      <p className="text-body-sm text-surface-fg-muted">or click to browse</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PdfSignForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Step 2: signature creation
  const [tab, setTab] = useState<SignatureTab>("draw");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Step 3: page rendering + placement
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [sigWidth, setSigWidth] = useState(150);
  const [loadingPages, setLoadingPages] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handlePdfFile = useCallback((incoming: File | null) => {
    if (!incoming) return;
    if (incoming.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }
    setFile(incoming);
  }, []);

  const onPdfDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handlePdfFile(e.dataTransfer.files[0] ?? null);
    },
    [handlePdfFile],
  );

  const goToStep2 = () => {
    if (!file) { toast.error("Please select a PDF first."); return; }
    setStep(2);
  };

  const onSignatureDone = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
  };

  // Render pages when moving to step 3
  useEffect(() => {
    if (step !== 3 || !file || renderedPages.length > 0) return;
    let cancelled = false;
    setLoadingPages(true);

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/_next/static/chunks/pdf.worker.min.mjs";
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: RenderedPage[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          pages.push({
            pageNum: i,
            dataUrl: canvas.toDataURL("image/png"),
            displayWidth: viewport.width,
            displayHeight: viewport.height,
            pdfWidth: page.getViewport({ scale: 1 }).width,
            pdfHeight: page.getViewport({ scale: 1 }).height,
          });
        }
        if (!cancelled) {
          setRenderedPages(pages);
          setLoadingPages(false);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          toast.error(`Failed to render PDF: ${msg}`);
          setLoadingPages(false);
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const goToStep3 = () => {
    if (!signatureDataUrl) { toast.error("Please create a signature first."); return; }
    setStep(3);
  };

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rp = renderedPages[currentPage];
    if (!rp) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Scale from display coords to PDF coords
    const scaleX = rp.pdfWidth / rp.displayWidth;
    const scaleY = rp.pdfHeight / rp.displayHeight;

    // PDF Y is measured from bottom
    const pdfX = clickX * scaleX;
    const pdfY = rp.pdfHeight - clickY * scaleY;

    // Approximate signature dimensions in PDF space
    const pdfWidth = sigWidth * scaleX;
    // Assume 4:1 aspect ratio for the signature
    const pdfHeight = pdfWidth / 4;

    const placement: Placement = {
      page: rp.pageNum,
      x: clickX,
      y: clickY,
      width: sigWidth,
      pdfX,
      pdfY,
      pdfWidth,
      pdfHeight,
    };

    setPlacements((prev) => [...prev.filter((p) => p.page !== rp.pageNum), placement]);
  };

  const removePlacement = (pageNum: number) => {
    setPlacements((prev) => prev.filter((p) => p.page !== pageNum));
  };

  const handleApply = async () => {
    if (!file || !signatureDataUrl || placements.length === 0) {
      toast.error("Place the signature on at least one page first.");
      return;
    }
    fire("process_start", { tool_id: "pdf-sign" });
    setIsApplying(true);
    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Convert data URL to bytes
      const sigResponse = await fetch(signatureDataUrl);
      const sigBytes = await sigResponse.arrayBuffer();
      const isPng = signatureDataUrl.startsWith("data:image/png");

      let embeddedSig: Awaited<ReturnType<typeof pdfDoc.embedPng>>;
      if (isPng) {
        embeddedSig = await pdfDoc.embedPng(sigBytes);
      } else {
        embeddedSig = await pdfDoc.embedJpg(sigBytes);
      }

      const pages = pdfDoc.getPages();
      for (const pl of placements) {
        const page = pages[pl.page - 1];
        if (!page) continue;
        page.drawImage(embeddedSig, {
          x: pl.pdfX,
          y: pl.pdfY - pl.pdfHeight,
          width: pl.pdfWidth,
          height: pl.pdfHeight,
        });
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `signed-${file.name}`;

      fire("download_click", { tool_id: "pdf-sign", output_type: "application/pdf" });
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setStep(4);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to sign PDF: ${msg}`);
    } finally {
      setIsApplying(false);
    }
  };

  const startOver = () => {
    setFile(null);
    setSignatureDataUrl(null);
    setRenderedPages([]);
    setCurrentPage(0);
    setPlacements([]);
    setSigWidth(150);
    setStep(1);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  // ─── Step 4: done ─────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border border-surface-border bg-surface-2 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="h-8 w-8" />
        </div>
        <div>
          <p className="text-body-lg font-semibold">PDF signed and downloaded</p>
          <p className="mt-1 text-body-sm text-surface-fg-muted">Your file never left your device.</p>
        </div>
        <Button variant="soft" onClick={startOver}>
          Sign another PDF
        </Button>
      </div>
    );
  }

  // ─── Step 3: place signature ───────────────────────────────────────────────
  if (step === 3) {
    const rp = renderedPages[currentPage];
    const currentPlacement = rp ? placements.find((p) => p.page === rp.pageNum) : undefined;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-body-sm font-medium text-surface-fg-muted">
            Step 3 — Click on a page to place your signature
          </p>
          <div className="flex items-center gap-2">
            <label className="text-body-sm font-medium">Width (px)</label>
            <input
              type="number"
              min={50}
              max={400}
              value={sigWidth}
              onChange={(e) => setSigWidth(Math.min(400, Math.max(50, parseInt(e.target.value, 10) || 150)))}
              className="w-20 rounded-md border border-surface-border bg-surface px-2 py-1 text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {loadingPages ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-surface-border bg-surface-2">
            <p className="text-body-sm text-surface-fg-muted">Rendering pages…</p>
          </div>
        ) : rp ? (
          <div className="space-y-2">
            {/* Page image with signature overlay */}
            <div
              className="relative cursor-crosshair overflow-hidden rounded-lg border border-surface-border shadow"
              style={{ width: rp.displayWidth, maxWidth: "100%" }}
              onClick={handlePageClick}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rp.dataUrl}
                alt={`Page ${rp.pageNum}`}
                className="block w-full"
                draggable={false}
              />
              {currentPlacement && signatureDataUrl && (
                <div
                  className="absolute border-2 border-accent"
                  style={{
                    left: currentPlacement.x,
                    top: currentPlacement.y,
                    width: currentPlacement.width,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureDataUrl} alt="Signature preview" className="block w-full" draggable={false} />
                </div>
              )}
            </div>

            {/* Page navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="soft"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-body-sm text-surface-fg-muted">
                Page {rp.pageNum} of {renderedPages.length}
              </span>
              <Button
                variant="soft"
                size="sm"
                disabled={currentPage === renderedPages.length - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {/* Placement summary */}
        {placements.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-body-sm font-medium">Placements</p>
            {placements.map((pl) => (
              <div
                key={pl.page}
                className="flex items-center justify-between rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-body-sm"
              >
                <span>Page {pl.page}</span>
                <button
                  onClick={() => removePlacement(pl.page)}
                  className="text-surface-fg-muted hover:text-error"
                  aria-label={`Remove signature from page ${pl.page}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="soft" onClick={() => setStep(2)}>
            Back
          </Button>
          <Button
            disabled={placements.length === 0 || isApplying}
            onClick={handleApply}
          >
            <Check className="mr-2 h-4 w-4" />
            {isApplying ? "Applying…" : "Apply & Download"}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Step 2: create signature ──────────────────────────────────────────────
  if (step === 2) {
    const tabs: { id: SignatureTab; label: string; icon: React.ReactNode }[] = [
      { id: "draw", label: "Draw", icon: <PenLine className="h-4 w-4" /> },
      { id: "type", label: "Type", icon: <Type className="h-4 w-4" /> },
      { id: "upload", label: "Upload", icon: <Upload className="h-4 w-4" /> },
    ];

    return (
      <div className="space-y-4">
        <p className="text-body-sm font-medium text-surface-fg-muted">Step 2 — Create your signature</p>

        {signatureDataUrl && (
          <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-3">
            <Check className="h-5 w-5 shrink-0 text-success" />
            <div className="flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatureDataUrl} alt="Your signature" className="max-h-10 object-contain" />
            </div>
            <button
              className="text-body-sm text-surface-fg-muted underline"
              onClick={() => setSignatureDataUrl(null)}
            >
              Change
            </button>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 rounded-lg border border-surface-border bg-surface-2 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-body-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-surface text-surface-fg shadow-sm"
                  : "text-surface-fg-muted hover:text-surface-fg"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "draw" && <DrawTab onDone={onSignatureDone} />}
        {tab === "type" && <TypeTab onDone={onSignatureDone} />}
        {tab === "upload" && <UploadTab onDone={onSignatureDone} />}

        <div className="flex gap-3">
          <Button variant="soft" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button disabled={!signatureDataUrl} onClick={goToStep3}>
            Place on PDF
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Step 1: upload PDF ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop PDF here or click to browse"
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
          isDragging
            ? "border-accent bg-accent/5"
            : "border-surface-border bg-surface-2 hover:border-accent/60"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onPdfDrop}
        onClick={() => pdfInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") pdfInputRef.current?.click(); }}
      >
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => handlePdfFile(e.target.files?.[0] ?? null)}
        />
        <Upload className="h-10 w-10 text-surface-fg-muted" />
        {file ? (
          <div className="text-center">
            <p className="font-medium">{file.name}</p>
            <p className="text-body-sm text-surface-fg-muted">{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium">Drop your PDF here</p>
            <p className="text-body-sm text-surface-fg-muted">or click to browse</p>
          </div>
        )}
      </div>

      <Button disabled={!file} onClick={goToStep2} className="w-full sm:w-auto">
        <PenLine className="mr-2 h-4 w-4" />
        Create Signature
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
