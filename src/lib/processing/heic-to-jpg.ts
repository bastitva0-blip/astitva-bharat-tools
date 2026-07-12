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
  let heic2any: typeof import("heic2any").default;
  try {
    ({ default: heic2any } = await import("heic2any"));
  } catch {
    throw new Error(
      "Couldn't load the HEIC converter. Check your internet connection and try again.",
    );
  }

  const quality = options.quality ?? 0.92;
  let out: Blob | Blob[];
  try {
    out = await heic2any({ blob: source, toType: "image/jpeg", quality });
  } catch {
    throw new Error(
      "This HEIC photo couldn't be converted — it may be corrupted or an unusual variant. Try re-exporting it as JPG from your phone's Photos app.",
    );
  }
  const blob = Array.isArray(out) ? out[0] : out;
  return { blob, bytes: blob.size };
}
