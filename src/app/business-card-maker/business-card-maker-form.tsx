"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { fire } from "@/lib/analytics/events";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Template = "minimal" | "classic" | "modern";

interface CardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
}

// ---------------------------------------------------------------------------
// Constants — card dimensions at 96 DPI
// 3.5in × 2in = 336px × 192px, rendered at 3x = 1008×576
// ---------------------------------------------------------------------------
const CARD_W_PX = 336;
const CARD_H_PX = 192;
const SCALE = 3;
const CANVAS_W = CARD_W_PX * SCALE;
const CANVAS_H = CARD_H_PX * SCALE;

// ---------------------------------------------------------------------------
// Canvas drawing helpers
// ---------------------------------------------------------------------------

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
}

function drawCard(
  canvas: HTMLCanvasElement,
  data: CardData,
  template: Template,
  bgColor: string,
  textColor: string,
  logoImg: HTMLImageElement | null
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  const s = SCALE;
  const accent = textColor;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (template === "minimal") {
    // Clean left-aligned layout
    const padX = 28 * s;
    const padY = 22 * s;

    // Optional thin top accent bar
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.12;
    ctx.fillRect(0, 0, CANVAS_W, 4 * s);
    ctx.globalAlpha = 1;

    let y = padY;

    // Logo (top-right)
    if (logoImg) {
      const lh = 28 * s;
      const lw = (logoImg.width / logoImg.height) * lh;
      ctx.drawImage(logoImg, CANVAS_W - padX - lw, padY - 4 * s, lw, lh);
    }

    // Name
    ctx.font = `bold ${11 * s}px system-ui, sans-serif`;
    ctx.fillStyle = accent;
    ctx.fillText(data.name, padX, y + 8 * s);
    y += 14 * s;

    // Title
    if (data.title) {
      ctx.font = `${8 * s}px system-ui, sans-serif`;
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.7;
      ctx.fillText(data.title, padX, y + 4 * s);
      ctx.globalAlpha = 1;
      y += 11 * s;
    }

    // Company
    if (data.company) {
      ctx.font = `bold ${8 * s}px system-ui, sans-serif`;
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.55;
      ctx.fillText(data.company.toUpperCase(), padX, y + 4 * s);
      ctx.globalAlpha = 1;
      y += 12 * s;
    }

    // Separator
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(padX, y, (CANVAS_W - padX * 2), 1 * s);
    ctx.globalAlpha = 1;
    y += 10 * s;

    // Contact details
    ctx.font = `${7 * s}px system-ui, sans-serif`;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.8;
    const details = [data.phone, data.email, data.website, data.address].filter(Boolean);
    for (const d of details) {
      ctx.fillText(d, padX, y + 4 * s);
      y += 10 * s;
    }
    ctx.globalAlpha = 1;
  } else if (template === "classic") {
    // Centered layout with top name block in accent color
    const headerH = 72 * s;
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, CANVAS_W, headerH);

    // Name — centered in header
    ctx.font = `bold ${12 * s}px Georgia, serif`;
    ctx.fillStyle = bgColor;
    ctx.textAlign = "center";
    ctx.fillText(data.name, CANVAS_W / 2, 26 * s);

    // Title in header
    if (data.title) {
      ctx.font = `italic ${8 * s}px Georgia, serif`;
      ctx.globalAlpha = 0.85;
      ctx.fillText(data.title, CANVAS_W / 2, 40 * s);
      ctx.globalAlpha = 1;
    }

    // Company in header
    if (data.company) {
      ctx.font = `${7.5 * s}px Georgia, serif`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(data.company, CANVAS_W / 2, 54 * s);
      ctx.globalAlpha = 1;
    }

    // Logo — top right of header
    if (logoImg) {
      const lh = 30 * s;
      const lw = (logoImg.width / logoImg.height) * lh;
      ctx.drawImage(logoImg, CANVAS_W - 20 * s - lw, (headerH - lh) / 2, lw, lh);
    }

    // Contact details — centered below header
    ctx.fillStyle = accent;
    ctx.font = `${7 * s}px Georgia, serif`;
    ctx.globalAlpha = 0.85;
    const details = [data.phone, data.email, data.website, data.address].filter(Boolean);
    let y = headerH + 18 * s;
    for (const d of details) {
      ctx.fillText(d, CANVAS_W / 2, y);
      y += 11 * s;
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  } else {
    // Modern — left accent bar + two-column feel
    const barW = 6 * s;
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, barW, CANVAS_H);

    const padL = barW + 22 * s;
    const padY = 20 * s;
    let y = padY;

    // Logo top-right
    if (logoImg) {
      const lh = 32 * s;
      const lw = (logoImg.width / logoImg.height) * lh;
      ctx.drawImage(logoImg, CANVAS_W - 20 * s - lw, padY, lw, lh);
    }

    // Name
    ctx.font = `900 ${12 * s}px system-ui, sans-serif`;
    ctx.fillStyle = accent;
    ctx.fillText(data.name, padL, y + 10 * s);
    y += 16 * s;

    // Title + company inline
    const sub = [data.title, data.company].filter(Boolean).join(" · ");
    if (sub) {
      ctx.font = `${7.5 * s}px system-ui, sans-serif`;
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.65;
      ctx.fillText(sub, padL, y + 4 * s);
      ctx.globalAlpha = 1;
      y += 14 * s;
    }

    // Dot separator
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(padL, y, CANVAS_W - padL - 20 * s, 1.5 * s);
    ctx.globalAlpha = 1;
    y += 12 * s;

    // Contact
    ctx.font = `${7 * s}px system-ui, sans-serif`;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.75;
    const details = [data.phone, data.email, data.website, data.address].filter(Boolean);
    for (const d of details) {
      ctx.fillText(d, padL, y + 4 * s);
      y += 10 * s;
    }
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
// Input field component
// ---------------------------------------------------------------------------

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-body-xs font-semibold text-surface-fg-muted uppercase tracking-wide mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function BusinessCardMakerForm() {
  const [data, setData] = useState<CardData>({
    name: "Priya Sharma",
    title: "Product Designer",
    company: "Devalok Studio",
    email: "priya@example.com",
    phone: "+91 98765 43210",
    website: "www.example.com",
    address: "Mumbai, India",
  });

  const [template, setTemplate] = useState<Template>("minimal");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#111827");
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [fired, setFired] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fireOnce = useCallback(() => {
    if (!fired) {
      fire("process_start", { tool_id: "business-card-maker" });
      setFired(true);
    }
  }, [fired]);

  const set = (field: keyof CardData) => (v: string) => {
    setData((prev) => ({ ...prev, [field]: v }));
    fireOnce();
  };

  // Load logo image element when src changes
  useEffect(() => {
    if (!logoSrc) {
      setLogoImg(null);
      return;
    }
    const img = new Image();
    img.onload = () => setLogoImg(img);
    img.onerror = () => setLogoImg(null);
    img.src = logoSrc;
  }, [logoSrc]);

  // Redraw canvas whenever anything changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCard(canvas, data, template, bgColor, textColor, logoImg);
  }, [data, template, bgColor, textColor, logoImg]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") setLogoSrc(ev.target.result);
    };
    reader.readAsDataURL(file);
    fireOnce();
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    fireOnce();
    fire("download_click", { tool_id: "business-card-maker", output_type: "image/png" });
    const link = document.createElement("a");
    link.download = "business-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      fireOnce();
      fire("download_click", { tool_id: "business-card-maker", output_type: "application/pdf" });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const pngDataUrl = canvas.toDataURL("image/png");
      const base64 = pngDataUrl.split(",")[1];
      const binStr = atob(base64);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);

      // Dynamically import pdf-lib (available as @cantoo/pdf-lib)
      const { PDFDocument } = await import("@cantoo/pdf-lib");

      const pdfDoc = await PDFDocument.create();
      // 3.5in × 2in at 72pt/in = 252pt × 144pt
      const page = pdfDoc.addPage([252, 144]);
      const pngImage = await pdfDoc.embedPng(bytes.buffer as ArrayBuffer);
      page.drawImage(pngImage, { x: 0, y: 0, width: 252, height: 144 });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "business-card.pdf";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try PNG download instead.");
    } finally {
      setDownloading(false);
    }
  };

  const TEMPLATES: { key: Template; label: string; desc: string }[] = [
    { key: "minimal", label: "Minimal", desc: "Clean, modern, left-aligned" },
    { key: "classic", label: "Classic", desc: "Centered serif, traditional" },
    { key: "modern", label: "Modern", desc: "Bold accent bar, sans-serif" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: form */}
        <div className="space-y-5">
          {/* Details */}
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6 space-y-4">
            <h2 className="text-heading-sm font-semibold text-surface-fg">Card Details</h2>
            <Field label="Full Name *" value={data.name} onChange={set("name")} placeholder="Priya Sharma" />
            <Field label="Title / Designation" value={data.title} onChange={set("title")} placeholder="Product Designer" />
            <Field label="Company" value={data.company} onChange={set("company")} placeholder="Acme Inc." />
            <Field label="Email" value={data.email} onChange={set("email")} placeholder="you@company.com" type="email" />
            <Field label="Phone" value={data.phone} onChange={set("phone")} placeholder="+91 98765 43210" type="tel" />
            <Field label="Website" value={data.website} onChange={set("website")} placeholder="www.yoursite.com" />
            <Field label="Address" value={data.address} onChange={set("address")} placeholder="City, Country" />
          </div>

          {/* Design */}
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6 space-y-5">
            <h2 className="text-heading-sm font-semibold text-surface-fg">Design</h2>

            {/* Template picker */}
            <div>
              <label className="block text-body-xs font-semibold text-surface-fg-muted uppercase tracking-wide mb-2">
                Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => { setTemplate(t.key); fireOnce(); }}
                    className={`rounded-lg border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      template === t.key
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-surface-border bg-surface-1 text-surface-fg hover:bg-surface-2"
                    }`}
                  >
                    <span className="block text-body-sm font-semibold">{t.label}</span>
                    <span className="block text-body-xs text-surface-fg-muted mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-xs font-semibold text-surface-fg-muted uppercase tracking-wide mb-1">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => { setBgColor(e.target.value); fireOnce(); }}
                    className="h-10 w-10 cursor-pointer rounded-md border border-surface-border p-0.5 bg-surface-1"
                    aria-label="Background color"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => { setBgColor(e.target.value); fireOnce(); }}
                    className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                    maxLength={7}
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-xs font-semibold text-surface-fg-muted uppercase tracking-wide mb-1">
                  Text / Accent
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => { setTextColor(e.target.value); fireOnce(); }}
                    className="h-10 w-10 cursor-pointer rounded-md border border-surface-border p-0.5 bg-surface-1"
                    aria-label="Text color"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => { setTextColor(e.target.value); fireOnce(); }}
                    className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Color presets */}
            <div>
              <label className="block text-body-xs font-semibold text-surface-fg-muted uppercase tracking-wide mb-2">
                Color Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { bg: "#ffffff", text: "#111827", label: "White / Dark" },
                  { bg: "#111827", text: "#f9fafb", label: "Dark / Light" },
                  { bg: "#1d4ed8", text: "#ffffff", label: "Blue / White" },
                  { bg: "#047857", text: "#ffffff", label: "Green / White" },
                  { bg: "#7c3aed", text: "#ffffff", label: "Purple / White" },
                  { bg: "#f59e0b", text: "#1c1917", label: "Amber / Dark" },
                  { bg: "#0f172a", text: "#38bdf8", label: "Navy / Sky" },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    title={p.label}
                    onClick={() => { setBgColor(p.bg); setTextColor(p.text); fireOnce(); }}
                    className="h-7 w-7 rounded-full border-2 border-surface-border focus:outline-none focus:ring-2 focus:ring-primary-500 hover:scale-110 transition-transform"
                    style={{ backgroundColor: p.bg }}
                    aria-label={p.label}
                  />
                ))}
              </div>
            </div>

            {/* Logo upload */}
            <div>
              <label className="block text-body-xs font-semibold text-surface-fg-muted uppercase tracking-wide mb-1">
                Logo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-body-sm text-surface-fg file:mr-3 file:rounded-md file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:text-body-sm file:font-medium file:text-primary-700 hover:file:bg-primary-200"
              />
              {logoSrc && (
                <button
                  type="button"
                  onClick={() => { setLogoSrc(null); setLogoImg(null); }}
                  className="mt-1.5 text-body-xs text-error-600 hover:underline"
                >
                  Remove logo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: preview + download */}
        <div className="space-y-5">
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
            <h2 className="text-heading-sm font-semibold text-surface-fg mb-4">Preview</h2>

            {/* Preview div — shows the canvas rendered as img for display */}
            <div
              ref={previewRef}
              className="mx-auto overflow-hidden rounded-lg shadow-lg border border-surface-border"
              style={{ width: "100%", maxWidth: CARD_W_PX * 1.5, aspectRatio: `${CARD_W_PX} / ${CARD_H_PX}` }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                style={{ width: "100%", height: "100%", display: "block" }}
                aria-label="Business card preview"
              />
            </div>

            <p className="mt-3 text-center text-body-xs text-surface-fg-muted">
              Standard 3.5 × 2 inch business card
            </p>
          </div>

          {/* Download buttons */}
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6 space-y-3">
            <h2 className="text-heading-sm font-semibold text-surface-fg mb-2">Download</h2>
            <Button
              onClick={downloadPng}
              className="w-full"
              variant="outline"
            >
              Download as PNG
            </Button>
            <Button
              onClick={downloadPdf}
              className="w-full"
              disabled={downloading}
            >
              {downloading ? "Generating PDF…" : "Download as PDF"}
            </Button>
            <p className="text-body-xs text-surface-fg-muted text-center">
              PNG: high-resolution (3x). PDF: print-ready 3.5×2 in.
            </p>
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-surface-border bg-surface-2 p-5 space-y-2">
            <h3 className="text-body-sm font-semibold text-surface-fg">Tips</h3>
            <ul className="space-y-1 text-body-xs text-surface-fg-muted list-disc list-inside">
              <li>Use a PNG logo with transparent background for the cleanest result.</li>
              <li>For print, the PDF is the best format — hand it directly to a print shop.</li>
              <li>Keep the address field short (city + country) for cleaner card design.</li>
              <li>High contrast between background and text color improves readability.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
