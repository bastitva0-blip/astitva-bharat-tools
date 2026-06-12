import { PDFDocument, rgb } from "pdf-lib";
import { canvasToBlob, loadImage } from "@/lib/processing/image";

export type CollagePageSize = "a4" | "letter";
export type CollageLayout = "vertical" | "horizontal";
export type CollageRotation = 0 | 90 | 180 | 270;

const mmToPt = (mm: number) => (mm / 25.4) * 72;

const PAGE_BASE_PT: Record<CollagePageSize, { widthPt: number; heightPt: number }> = {
  a4: { widthPt: 595.276, heightPt: 841.89 },
  letter: { widthPt: 612, heightPt: 792 },
};

export interface AadhaarCollageItem {
  blob: Blob;
  rotation?: CollageRotation;
}

export interface BuildCollageOptions {
  /** Front and back of the Aadhaar card, in display order. Exactly two items. */
  items: [AadhaarCollageItem, AadhaarCollageItem];
  pageSize?: CollagePageSize;
  layout?: CollageLayout;
  /** Outer page margin in mm. Default 12. */
  marginMm?: number;
  /** Gap between the two cards in mm. Default 10. */
  gapMm?: number;
  /** JPEG quality for the embedded images. Default 0.9. */
  jpegQuality?: number;
}

// Rasterize the source image to a JPEG, applying any rotation, on a white
// background. We always go via canvas so PNG transparency does not bleed
// through and rotation is baked into the embedded asset (pdf-lib's draw
// rotation is non-trivial to combine with our centred-contain layout).
async function rasterToJpeg(
  item: AadhaarCollageItem,
  jpegQuality: number,
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const url = URL.createObjectURL(item.blob);
  try {
    const img = await loadImage(url);
    const rotation = item.rotation ?? 0;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const swap = rotation === 90 || rotation === 270;
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
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -w / 2, -h / 2);
    const blob = await canvasToBlob(canvas, "image/jpeg", jpegQuality);
    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

interface Slot {
  x: number;
  y: number;
  width: number;
  height: number;
}

function computeSlots(
  pageW: number,
  pageH: number,
  marginPt: number,
  gapPt: number,
  layout: CollageLayout,
): [Slot, Slot] {
  const innerW = pageW - 2 * marginPt;
  const innerH = pageH - 2 * marginPt;
  if (layout === "horizontal") {
    const slotW = (innerW - gapPt) / 2;
    const left: Slot = { x: marginPt, y: marginPt, width: slotW, height: innerH };
    const right: Slot = {
      x: marginPt + slotW + gapPt,
      y: marginPt,
      width: slotW,
      height: innerH,
    };
    return [left, right];
  }
  // vertical — first item on top, second on bottom (PDF y-axis grows upward,
  // so the "top" slot has the larger y origin).
  const slotH = (innerH - gapPt) / 2;
  const top: Slot = {
    x: marginPt,
    y: marginPt + slotH + gapPt,
    width: innerW,
    height: slotH,
  };
  const bottom: Slot = { x: marginPt, y: marginPt, width: innerW, height: slotH };
  return [top, bottom];
}

/**
 * Build a single-page PDF that stacks the two sides of an Aadhaar card (or
 * any two-sided ID) on one sheet. Each image is rendered contain-fit and
 * centred inside its half-page slot — aspect ratio is preserved, so wide
 * landscape scans and narrow portrait scans both look right.
 */
export async function buildAadhaarCollage(opts: BuildCollageOptions): Promise<Uint8Array> {
  if (opts.items.length !== 2) {
    throw new Error("Aadhaar collage needs exactly two images.");
  }

  const pageSize = opts.pageSize ?? "a4";
  const layout = opts.layout ?? "vertical";
  const base = PAGE_BASE_PT[pageSize];
  // The page itself stays portrait. Horizontal layout means the cards sit
  // side-by-side within the portrait page — most ID-card aspect ratios
  // (~1.6:1) still fit comfortably that way.
  const pageW = base.widthPt;
  const pageH = base.heightPt;
  const marginPt = mmToPt(opts.marginMm ?? 12);
  const gapPt = mmToPt(opts.gapMm ?? 10);
  const quality = opts.jpegQuality ?? 0.9;

  const slots = computeSlots(pageW, pageH, marginPt, gapPt, layout);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("BharatTools — Aadhaar Front + Back Collage");
  pdfDoc.setProducer("BharatTools");

  const page = pdfDoc.addPage([pageW, pageH]);

  // Faint divider so the two sides read as distinct. Thin and grey — doesn't
  // print as a heavy line.
  const dividerColor = rgb(0.78, 0.78, 0.78);
  if (layout === "vertical") {
    const midY = marginPt + slots[1].height + gapPt / 2;
    page.drawLine({
      start: { x: marginPt, y: midY },
      end: { x: pageW - marginPt, y: midY },
      thickness: 0.4,
      color: dividerColor,
    });
  } else {
    const midX = marginPt + slots[0].width + gapPt / 2;
    page.drawLine({
      start: { x: midX, y: marginPt },
      end: { x: midX, y: pageH - marginPt },
      thickness: 0.4,
      color: dividerColor,
    });
  }

  for (let i = 0; i < 2; i++) {
    const item = opts.items[i];
    const slot = slots[i];
    const { bytes } = await rasterToJpeg(item, quality);
    const embedded = await pdfDoc.embedJpg(bytes);

    const imgAspect = embedded.width / embedded.height;
    const slotAspect = slot.width / slot.height;
    let drawW: number, drawH: number;
    if (imgAspect > slotAspect) {
      drawW = slot.width;
      drawH = drawW / imgAspect;
    } else {
      drawH = slot.height;
      drawW = drawH * imgAspect;
    }
    const x = slot.x + (slot.width - drawW) / 2;
    const y = slot.y + (slot.height - drawH) / 2;
    page.drawImage(embedded, { x, y, width: drawW, height: drawH });
  }

  return pdfDoc.save();
}
