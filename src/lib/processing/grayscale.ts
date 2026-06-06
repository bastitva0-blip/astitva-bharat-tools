// Convert an image to grayscale via Canvas. ITU-R BT.709 luma weights — the
// standard perceptual luminance formula. Encodes as JPG by default; portals
// don't accept grayscale PNGs any differently, and JPG is smaller.

import { loadImageBoundedBySize } from "./kernel/decodedPixelGuard";

export interface GrayscaleResult {
  blob: Blob;
  bytes: number;
  width: number;
  height: number;
}

export async function convertToGrayscale(
  source: Blob,
  options: { mime?: "image/jpeg" | "image/png"; quality?: number } = {},
): Promise<GrayscaleResult> {
  const mime = options.mime ?? "image/jpeg";
  const quality = mime === "image/png" ? undefined : options.quality ?? 0.92;

  const { bitmap, width, height } = await loadImageBoundedBySize(source);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: mime !== "image/jpeg" });
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas 2D context unavailable");
  }
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const img = ctx.getImageData(0, 0, width, height);
  const px = img.data;
  for (let i = 0; i < px.length; i += 4) {
    // BT.709 luma — closest to perceived brightness.
    const luma = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
    px[i] = luma;
    px[i + 1] = luma;
    px[i + 2] = luma;
  }
  ctx.putImageData(img, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
      mime,
      quality,
    );
  });
  return { blob, bytes: blob.size, width, height };
}
