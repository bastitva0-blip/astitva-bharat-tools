import { PDFDocument, rgb } from "pdf-lib";
import { canvasToBlob, loadImage } from "@/lib/processing/image";
import {
  PRINT_SHEET_GAP_MM,
  PRINT_SHEET_MARGIN_MM,
  fitGrid,
  type PhotoSizePreset,
  type SheetPreset,
} from "@/lib/presets/print-sheet";

const mmToPt = (mm: number) => (mm / 25.4) * 72;
const mmToPx = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);

export async function buildPrintSheetPdf({
  image,
  sheet,
  photo,
}: {
  image: Blob;
  sheet: SheetPreset;
  photo: { widthMm: number; heightMm: number };
}): Promise<Uint8Array> {
  const photoBoxed: PhotoSizePreset = { id: "_", label: "_", widthMm: photo.widthMm, heightMm: photo.heightMm };
  const grid = fitGrid(sheet, photoBoxed);
  if (grid.total === 0) {
    throw new Error("Photo too large for the chosen sheet - pick a smaller photo size.");
  }

  const tilePxW = mmToPx(photo.widthMm, 300);
  const tilePxH = mmToPx(photo.heightMm, 300);
  const tileJpegBytes = await renderTileJpeg(image, tilePxW, tilePxH);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("BharatTools Print Sheet");
  pdfDoc.setProducer("BharatTools");

  const page = pdfDoc.addPage([mmToPt(sheet.widthMm), mmToPt(sheet.heightMm)]);
  const embedded = await pdfDoc.embedJpg(tileJpegBytes);

  const sheetWPt = mmToPt(sheet.widthMm);
  const sheetHPt = mmToPt(sheet.heightMm);
  const tileWPt = mmToPt(photo.widthMm);
  const tileHPt = mmToPt(photo.heightMm);
  const gapPt = mmToPt(PRINT_SHEET_GAP_MM);

  const gridWPt = grid.cols * tileWPt + (grid.cols - 1) * gapPt;
  const gridHPt = grid.rows * tileHPt + (grid.rows - 1) * gapPt;
  const offsetXPt = (sheetWPt - gridWPt) / 2;
  const offsetYTopPt = (sheetHPt - gridHPt) / 2;

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const x = offsetXPt + c * (tileWPt + gapPt);
      const yFromTop = offsetYTopPt + r * (tileHPt + gapPt);
      const y = sheetHPt - yFromTop - tileHPt;
      page.drawImage(embedded, { x, y, width: tileWPt, height: tileHPt });
      page.drawRectangle({
        x,
        y,
        width: tileWPt,
        height: tileHPt,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
      });
    }
  }

  return pdfDoc.save();
}

async function renderTileJpeg(image: Blob, tilePxW: number, tilePxH: number): Promise<Uint8Array> {
  const sourceUrl = URL.createObjectURL(image);
  try {
    const img = await loadImage(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = tilePxW;
    canvas.height = tilePxH;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, tilePxW, tilePxH);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const tileAspect = tilePxW / tilePxH;
    let sx: number, sy: number, sw: number, sh: number;
    if (imgAspect > tileAspect) {
      sh = img.naturalHeight;
      sw = sh * tileAspect;
      sx = (img.naturalWidth - sw) / 2;
      sy = 0;
    } else {
      sw = img.naturalWidth;
      sh = sw / tileAspect;
      sx = 0;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tilePxW, tilePxH);

    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
