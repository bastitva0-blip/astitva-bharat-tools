import { PDFDocument } from "pdf-lib";
import { canvasToBlob, loadImage } from "@/lib/processing/image";

export type PageSize = "a4" | "letter";
export type Orientation = "portrait" | "landscape";

const mmToPt = (mm: number) => (mm / 25.4) * 72;

const PAGE_BASE_PT: Record<PageSize, { widthPt: number; heightPt: number }> = {
  a4: { widthPt: 595.276, heightPt: 841.89 },
  letter: { widthPt: 612, heightPt: 792 },
};

export interface PdfImageItem {
  blob: Blob;
  /** Rotation in degrees, 0 / 90 / 180 / 270. */
  rotation: 0 | 90 | 180 | 270;
}

export interface BuildPdfOptions {
  items: PdfImageItem[];
  pageSize: PageSize;
  orientation: Orientation;
  marginMm?: number;
  jpegQuality?: number;
}

async function rasterToJpeg(item: PdfImageItem, jpegQuality: number): Promise<Uint8Array> {
  const url = URL.createObjectURL(item.blob);
  try {
    const img = await loadImage(url);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const swap = item.rotation === 90 || item.rotation === 270;
    const canvas = document.createElement("canvas");
    canvas.width = swap ? h : w;
    canvas.height = swap ? w : h;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.drawImage(img, -w / 2, -h / 2);
    const blob = await canvasToBlob(canvas, "image/jpeg", jpegQuality);
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function buildPdfFromImages(opts: BuildPdfOptions): Promise<Uint8Array> {
  if (opts.items.length === 0) throw new Error("Add at least one image.");

  const base = PAGE_BASE_PT[opts.pageSize];
  const pageW = opts.orientation === "portrait" ? base.widthPt : base.heightPt;
  const pageH = opts.orientation === "portrait" ? base.heightPt : base.widthPt;
  const marginPt = mmToPt(opts.marginMm ?? 5);
  const innerW = pageW - 2 * marginPt;
  const innerH = pageH - 2 * marginPt;
  const quality = opts.jpegQuality ?? 0.85;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("BharatTools - Images to PDF");
  pdfDoc.setProducer("BharatTools");

  for (const item of opts.items) {
    const jpegBytes = await rasterToJpeg(item, quality);
    const embedded = await pdfDoc.embedJpg(jpegBytes);
    const imgAspect = embedded.width / embedded.height;
    const innerAspect = innerW / innerH;
    let drawW: number, drawH: number;
    if (imgAspect > innerAspect) {
      drawW = innerW;
      drawH = drawW / imgAspect;
    } else {
      drawH = innerH;
      drawW = drawH * imgAspect;
    }
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;
    const page = pdfDoc.addPage([pageW, pageH]);
    page.drawImage(embedded, { x, y, width: drawW, height: drawH });
  }

  return pdfDoc.save();
}
