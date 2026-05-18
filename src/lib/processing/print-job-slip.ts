import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

export type ColorMode = "color" | "bw";
export type Sides = "single" | "double";
export type PaperSize = "a4" | "a3" | "letter" | "legal";

export interface PrintJobItem {
  fileName: string;
  fileKind: "pdf" | "image";
  copies: number;
  colorMode: ColorMode;
  sides: Sides;
  paperSize: PaperSize;
  pageRanges: string;
  /** For PDFs: total pages in source. For images: 1. */
  sourcePages: number;
  /** Source bytes. */
  bytes: Uint8Array;
  /** For images, the original MIME type so we choose the right embed path. */
  mimeType?: string;
}

export interface PrintJobInput {
  items: PrintJobItem[];
  notes: string;
}

const PAPER_LABEL: Record<PaperSize, string> = {
  a4: "A4",
  a3: "A3",
  letter: "Letter",
  legal: "Legal",
};

const COLOR_LABEL: Record<ColorMode, string> = {
  color: "Color",
  bw: "B&W",
};

const SIDES_LABEL: Record<Sides, string> = {
  single: "Single",
  double: "Double",
};

const A4_PT = { w: 595.276, h: 841.89 };

function effectivePagesForItem(item: PrintJobItem): number {
  const ranges = item.pageRanges.trim();
  if (!ranges) return item.sourcePages;
  let total = 0;
  for (const part of ranges.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) return item.sourcePages;
    const start = Number.parseInt(m[1]!, 10);
    const end = m[2] ? Number.parseInt(m[2]!, 10) : start;
    if (start < 1 || end < start) return item.sourcePages;
    total += end - start + 1;
  }
  return Math.max(1, total);
}

interface DrawCtx {
  page: PDFPage;
  cursorY: number;
}

function drawText(
  ctx: DrawCtx,
  text: string,
  opts: { x: number; size: number; font: PDFFont; color?: ReturnType<typeof rgb> },
) {
  ctx.page.drawText(text, {
    x: opts.x,
    y: ctx.cursorY,
    size: opts.size,
    font: opts.font,
    color: opts.color ?? rgb(0.12, 0.13, 0.15),
  });
}

function safeAscii(input: string): string {
  // StandardFonts (Helvetica) only handle WinAnsi. Drop anything else so the
  // PDF doesn't blow up when the shop staff has only English on the slip.
  return input.replace(/[^\x20-\x7E\n]/g, "?");
}

function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const raw of text.split(/\n/)) {
    const words = raw.split(/\s+/);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }
  return lines;
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = d.toLocaleString("en-IN", { month: "short" });
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd} ${mm} ${yyyy} · ${hh}:${min}`;
}

async function buildCoverSheet(pdfDoc: PDFDocument, input: PrintJobInput): Promise<void> {
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([A4_PT.w, A4_PT.h]);
  const marginX = 48;
  const contentWidth = A4_PT.w - marginX * 2;

  let cursorY = A4_PT.h - 56;
  const ctx: DrawCtx = { page, cursorY };

  // Brand strip
  page.drawRectangle({
    x: 0,
    y: A4_PT.h - 18,
    width: A4_PT.w,
    height: 18,
    color: rgb(0.95, 0.6, 0.15),
  });

  // Header
  drawText(ctx, "PRINT JOB", { x: marginX, size: 26, font: helveticaBold });
  ctx.cursorY -= 22;
  drawText(ctx, "BharatTools · Print Job Slip", {
    x: marginX,
    size: 10,
    font: helvetica,
    color: rgb(0.4, 0.42, 0.48),
  });
  drawText(ctx, formatDate(new Date()), {
    x: A4_PT.w - marginX - helvetica.widthOfTextAtSize(formatDate(new Date()), 10),
    size: 10,
    font: helvetica,
    color: rgb(0.4, 0.42, 0.48),
  });
  ctx.cursorY -= 28;

  // Summary
  const totalFiles = input.items.length;
  const totalPrintedPages = input.items.reduce(
    (sum, it) => sum + effectivePagesForItem(it) * it.copies,
    0,
  );
  const totalSources = input.items.reduce((sum, it) => sum + effectivePagesForItem(it), 0);
  const summaryLine = `${totalFiles} file${totalFiles === 1 ? "" : "s"}  ·  ${totalSources} source page${totalSources === 1 ? "" : "s"}  ·  ${totalPrintedPages} printed page${totalPrintedPages === 1 ? "" : "s"} (after copies)`;
  drawText(ctx, summaryLine, { x: marginX, size: 12, font: helveticaBold });
  ctx.cursorY -= 24;

  // Table header
  const colX = {
    idx: marginX,
    name: marginX + 22,
    copies: marginX + 280,
    color: marginX + 320,
    sides: marginX + 360,
    paper: marginX + 410,
    pages: marginX + 450,
  };
  const headerY = ctx.cursorY;
  page.drawRectangle({
    x: marginX - 6,
    y: headerY - 6,
    width: contentWidth + 12,
    height: 18,
    color: rgb(0.96, 0.96, 0.97),
  });
  const headerOpts = { size: 9, font: helveticaBold, color: rgb(0.3, 0.32, 0.38) };
  drawText(ctx, "#", { x: colX.idx, ...headerOpts });
  drawText(ctx, "FILE", { x: colX.name, ...headerOpts });
  drawText(ctx, "COPIES", { x: colX.copies, ...headerOpts });
  drawText(ctx, "COLOR", { x: colX.color, ...headerOpts });
  drawText(ctx, "SIDES", { x: colX.sides, ...headerOpts });
  drawText(ctx, "PAPER", { x: colX.paper, ...headerOpts });
  drawText(ctx, "PAGES", { x: colX.pages, ...headerOpts });
  ctx.cursorY -= 22;

  // Rows
  input.items.forEach((item, idx) => {
    if (ctx.cursorY < 140) return; // simple overflow guard; cover sheet is one A4
    const namePrintable = safeAscii(item.fileName);
    const maxNameWidth = colX.copies - colX.name - 8;
    let displayName = namePrintable;
    while (
      helvetica.widthOfTextAtSize(displayName, 10) > maxNameWidth &&
      displayName.length > 6
    ) {
      displayName = displayName.slice(0, -2);
    }
    if (displayName !== namePrintable) displayName = `${displayName.slice(0, -1)}…`;

    const rowOpts = { size: 10, font: helvetica };
    drawText(ctx, String(idx + 1), { x: colX.idx, ...rowOpts });
    drawText(ctx, displayName, { x: colX.name, ...rowOpts });
    drawText(ctx, `${item.copies}×`, { x: colX.copies, size: 10, font: helveticaBold });
    drawText(ctx, COLOR_LABEL[item.colorMode], { x: colX.color, ...rowOpts });
    drawText(ctx, SIDES_LABEL[item.sides], { x: colX.sides, ...rowOpts });
    drawText(ctx, PAPER_LABEL[item.paperSize], { x: colX.paper, ...rowOpts });
    const pagesLabel = item.pageRanges.trim() || `1-${item.sourcePages}`;
    drawText(ctx, pagesLabel, { x: colX.pages, ...rowOpts });
    ctx.cursorY -= 18;
  });

  // Notes
  ctx.cursorY -= 12;
  if (input.notes.trim()) {
    drawText(ctx, "NOTES FOR PRINT SHOP", {
      x: marginX,
      size: 9,
      font: helveticaBold,
      color: rgb(0.3, 0.32, 0.38),
    });
    ctx.cursorY -= 14;
    const wrapped = wrapLines(safeAscii(input.notes.trim()), helvetica, 11, contentWidth);
    for (const line of wrapped) {
      if (ctx.cursorY < 80) break;
      drawText(ctx, line, { x: marginX, size: 11, font: helvetica });
      ctx.cursorY -= 14;
    }
  }

  // Footer
  const footerY = 36;
  page.drawLine({
    start: { x: marginX, y: footerY + 14 },
    end: { x: A4_PT.w - marginX, y: footerY + 14 },
    color: rgb(0.85, 0.85, 0.87),
    thickness: 0.5,
  });
  page.drawText("Generated by BharatTools · bharattools.in", {
    x: marginX,
    y: footerY,
    size: 9,
    font: helvetica,
    color: rgb(0.5, 0.52, 0.58),
  });
  const sourcesNote = "Cover sheet · documents follow on next pages";
  page.drawText(sourcesNote, {
    x: A4_PT.w - marginX - helvetica.widthOfTextAtSize(sourcesNote, 9),
    y: footerY,
    size: 9,
    font: helvetica,
    color: rgb(0.5, 0.52, 0.58),
  });
}

function pageRangesToIndices(input: string, totalPages: number): number[] {
  const ranges = input.trim();
  if (!ranges) return Array.from({ length: totalPages }, (_, i) => i);
  const out: number[] = [];
  for (const part of ranges.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error(`Could not read page range "${part}". Use "1-3, 5".`);
    const start = Number.parseInt(m[1]!, 10);
    const end = m[2] ? Number.parseInt(m[2]!, 10) : start;
    if (start < 1 || end < start) throw new Error(`"${part}" is not a valid range.`);
    if (end > totalPages) {
      throw new Error(`"${part}" goes past page ${totalPages}.`);
    }
    for (let p = start; p <= end; p += 1) out.push(p - 1);
  }
  return out;
}

async function appendPdfItem(out: PDFDocument, item: PrintJobItem): Promise<void> {
  const src = await PDFDocument.load(item.bytes, { ignoreEncryption: true });
  const indices = pageRangesToIndices(item.pageRanges, src.getPageCount());
  const copied = await out.copyPages(src, indices);
  copied.forEach((p) => out.addPage(p));
}

async function appendImageItem(out: PDFDocument, item: PrintJobItem): Promise<void> {
  const mime = item.mimeType ?? "";
  let embedded;
  if (mime === "image/jpeg" || mime === "image/jpg") {
    embedded = await out.embedJpg(item.bytes);
  } else if (mime === "image/png") {
    embedded = await out.embedPng(item.bytes);
  } else {
    // Fallback: render to JPEG via canvas in the browser before this lib is called.
    // If we receive an unknown type, try JPEG embed which will throw helpfully.
    embedded = await out.embedJpg(item.bytes);
  }
  const page = out.addPage([A4_PT.w, A4_PT.h]);
  const marginPt = 24;
  const innerW = A4_PT.w - marginPt * 2;
  const innerH = A4_PT.h - marginPt * 2;
  const aspect = embedded.width / embedded.height;
  const innerAspect = innerW / innerH;
  let drawW: number;
  let drawH: number;
  if (aspect > innerAspect) {
    drawW = innerW;
    drawH = drawW / aspect;
  } else {
    drawH = innerH;
    drawW = drawH * aspect;
  }
  const x = (A4_PT.w - drawW) / 2;
  const y = (A4_PT.h - drawH) / 2;
  page.drawImage(embedded, { x, y, width: drawW, height: drawH });
}

export async function buildPrintJobPdf(input: PrintJobInput): Promise<Uint8Array> {
  if (input.items.length === 0) throw new Error("Add at least one file.");

  const out = await PDFDocument.create();
  out.setTitle("BharatTools - Print Job");
  out.setProducer("BharatTools");
  out.setCreator("BharatTools");

  await buildCoverSheet(out, input);

  for (const item of input.items) {
    if (item.fileKind === "pdf") {
      await appendPdfItem(out, item);
    } else {
      await appendImageItem(out, item);
    }
  }

  return out.save({ useObjectStreams: true });
}

export async function readPdfPageCount(bytes: Uint8Array): Promise<number> {
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return src.getPageCount();
}
