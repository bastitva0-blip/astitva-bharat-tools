// HEIC/HEIF → JPG conversion via the heic2any library.
//
// Why a separate module: Safari decodes HEIC natively via the standard image
// pipeline, but Chrome/Firefox don't — so the Canvas-based format-convert
// helper can't reach the iPhone audience without this dedicated decoder.
// heic2any pulls in libheif-js (~1.5 MB), so we keep it isolated behind a
// dynamic import to avoid loading it on tools that don't need HEIC support.

export interface HeicConvertOptions {
  /** JPEG quality 0..1. Default 0.92. */
  quality?: number;
}

export interface HeicConvertResult {
  blob: Blob;
  bytes: number;
}

export async function convertHeicToJpg(
  source: Blob,
  options: HeicConvertOptions = {},
): Promise<HeicConvertResult> {
  const { default: heic2any } = await import("heic2any");
  const quality = options.quality ?? 0.92;
  const out = await heic2any({ blob: source, toType: "image/jpeg", quality });
  const blob = Array.isArray(out) ? out[0] : out;
  return { blob, bytes: blob.size };
}
