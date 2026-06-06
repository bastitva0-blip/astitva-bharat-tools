// Image format conversion via Canvas. Re-encodes the decoded pixels into the
// target MIME — works for JPG ↔ PNG ↔ WebP in any modern browser.
//
// HEIC inputs decode if the browser supports them (Safari natively; Chrome on
// modern Macs/Android too). For broad HEIC coverage we'd add `heic2any` as
// a separate decoder upstream — out of scope for this helper.

import { loadImageBoundedBySize } from "./kernel/decodedPixelGuard";

export interface FormatConvertOptions {
  mime: "image/jpeg" | "image/png" | "image/webp";
  /** Quality 0..1 for lossy formats. Ignored for PNG. Default 0.92. */
  quality?: number;
  /** Background for transparency flattening when target is JPG. Default white. */
  background?: string;
}

export interface FormatConvertResult {
  blob: Blob;
  bytes: number;
  width: number;
  height: number;
}

export async function convertImageFormat(
  source: Blob,
  options: FormatConvertOptions,
): Promise<FormatConvertResult> {
  const { bitmap, width, height } = await loadImageBoundedBySize(source);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: options.mime !== "image/jpeg" });
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas 2D context unavailable");
  }
  // JPG has no alpha — paint the background first so transparency flattens
  // predictably (no black halos).
  if (options.mime === "image/jpeg") {
    ctx.fillStyle = options.background ?? "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const quality = options.mime === "image/png" ? undefined : options.quality ?? 0.92;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
      options.mime,
      quality,
    );
  });

  return { blob, bytes: blob.size, width, height };
}
