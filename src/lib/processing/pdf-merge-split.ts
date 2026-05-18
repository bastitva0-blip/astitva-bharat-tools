import { PDFDocument } from "pdf-lib";

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) throw new Error("Add at least one PDF.");
  const out = await PDFDocument.create();
  out.setProducer("BharatTools");
  out.setCreator("BharatTools");

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const indices = src.getPageIndices();
    const copied = await out.copyPages(src, indices);
    copied.forEach((p) => out.addPage(p));
  }

  return out.save({ useObjectStreams: true });
}

export interface PageRange {
  /** 1-based inclusive. */
  start: number;
  /** 1-based inclusive. */
  end: number;
}

export function parseRanges(input: string, totalPages: number): PageRange[] {
  const cleaned = input.trim();
  if (!cleaned) throw new Error("Enter at least one page range.");
  const parts = cleaned.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) throw new Error("Enter at least one page range.");

  const ranges: PageRange[] = [];
  for (const part of parts) {
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error(`Could not read "${part}". Use "1-3, 5, 7-9".`);
    const start = Number.parseInt(m[1]!, 10);
    const end = m[2] ? Number.parseInt(m[2]!, 10) : start;
    if (start < 1 || end < 1) throw new Error(`Pages start at 1 - got "${part}".`);
    if (start > totalPages || end > totalPages) {
      throw new Error(`PDF only has ${totalPages} pages - "${part}" is out of range.`);
    }
    if (start > end) throw new Error(`"${part}" runs backwards - start must be ≤ end.`);
    ranges.push({ start, end });
  }
  return ranges;
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return src.getPageCount();
}

export interface SplitResult {
  label: string;
  bytes: Uint8Array;
}

export async function splitPdfByRanges(file: File, ranges: PageRange[]): Promise<SplitResult[]> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const results: SplitResult[] = [];

  for (const range of ranges) {
    const out = await PDFDocument.create();
    out.setProducer("BharatTools");
    out.setCreator("BharatTools");
    const indices: number[] = [];
    for (let p = range.start; p <= range.end; p += 1) indices.push(p - 1);
    const copied = await out.copyPages(src, indices);
    copied.forEach((p) => out.addPage(p));
    const data = await out.save({ useObjectStreams: true });
    const label = range.start === range.end
      ? `page-${range.start}`
      : `pages-${range.start}-${range.end}`;
    results.push({ label, bytes: data });
  }
  return results;
}

export async function splitPdfEveryPage(file: File): Promise<SplitResult[]> {
  const total = await getPdfPageCount(file);
  const ranges: PageRange[] = [];
  for (let p = 1; p <= total; p += 1) ranges.push({ start: p, end: p });
  return splitPdfByRanges(file, ranges);
}
