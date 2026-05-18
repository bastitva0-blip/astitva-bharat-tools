import { PDFDocument, PDFName, PDFRawStream, PDFRef } from "pdf-lib";

export type CompressPreset = "light" | "recommended" | "stronger";

interface PresetConfig {
  jpegQuality: number;
  maxImageDim: number | null;
}

const PRESETS: Record<CompressPreset, PresetConfig> = {
  light: { jpegQuality: 0.85, maxImageDim: null },
  recommended: { jpegQuality: 0.72, maxImageDim: 1500 },
  stronger: { jpegQuality: 0.55, maxImageDim: 1000 },
};

export interface CompressPdfOptions {
  preset: CompressPreset;
}

export interface CompressPdfResult {
  bytes: Uint8Array;
  originalBytes: number;
  resultBytes: number;
  imagesRecompressed: number;
  imagesSkipped: number;
}

async function recompressJpegBytes(
  jpegBytes: Uint8Array,
  jpegQuality: number,
  maxDim: number | null,
): Promise<Uint8Array | null> {
  const blob = new Blob([new Uint8Array(jpegBytes)], { type: "image/jpeg" });
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return null;
  }
  try {
    let w = bitmap.width;
    let h = bitmap.height;
    if (maxDim && Math.max(w, h) > maxDim) {
      const scale = maxDim / Math.max(w, h);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    const out = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", jpegQuality),
    );
    if (!out) return null;
    return new Uint8Array(await out.arrayBuffer());
  } finally {
    bitmap.close?.();
  }
}

function isJpegStream(stream: PDFRawStream): boolean {
  const dict = stream.dict;
  const subtype = dict.lookup(PDFName.of("Subtype"));
  if (!subtype || String(subtype) !== "/Image") return false;
  const filter = dict.lookup(PDFName.of("Filter"));
  if (!filter) return false;
  const filterStr = String(filter);
  return filterStr === "/DCTDecode" || filterStr.includes("DCTDecode");
}

export async function compressPdf(
  file: File,
  opts: CompressPdfOptions,
): Promise<CompressPdfResult> {
  const cfg = PRESETS[opts.preset];
  const original = new Uint8Array(await file.arrayBuffer());

  const pdfDoc = await PDFDocument.load(original, {
    updateMetadata: false,
    ignoreEncryption: true,
  });

  let recompressed = 0;
  let skipped = 0;
  const targets: { ref: PDFRef; stream: PDFRawStream }[] = [];
  for (const [ref, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream && isJpegStream(obj)) {
      targets.push({ ref, stream: obj });
    }
  }

  for (const { ref, stream } of targets) {
    const raw = stream.contents;
    const next = await recompressJpegBytes(raw, cfg.jpegQuality, cfg.maxImageDim);
    if (!next || next.length >= raw.length) {
      skipped += 1;
      continue;
    }
    const replacement = PDFRawStream.of(stream.dict, next);
    pdfDoc.context.assign(ref, replacement);
    recompressed += 1;
  }

  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("BharatTools");
  pdfDoc.setCreator("BharatTools");

  const out = await pdfDoc.save({ useObjectStreams: true });

  return {
    bytes: out,
    originalBytes: original.length,
    resultBytes: out.length,
    imagesRecompressed: recompressed,
    imagesSkipped: skipped,
  };
}
