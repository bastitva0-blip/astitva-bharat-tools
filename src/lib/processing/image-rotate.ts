import { canvasToBlob } from "./image";
import { loadImageBoundedBySize } from "./kernel/decodedPixelGuard";

// Rotate and flip via canvas. Unlike a PDF, an image has no orientation flag a
// viewer can be trusted to honour — EXIF orientation is routinely ignored by
// government portals — so the pixels themselves have to be rewritten.

/** Clockwise, in degrees. */
export type ImageRotation = 0 | 90 | 180 | 270;

export interface ImageRotateOptions {
  rotation: ImageRotation;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  /** Defaults to JPEG, which is what portals accept. */
  mime?: "image/jpeg" | "image/png" | "image/webp";
  quality?: number;
}

export interface ImageRotateResult {
  blob: Blob;
  bytes: number;
  width: number;
  height: number;
}

export async function rotateImage(
  source: Blob,
  options: ImageRotateOptions,
): Promise<ImageRotateResult> {
  const mime = options.mime ?? "image/jpeg";
  const opaque = mime === "image/jpeg";
  const { bitmap, width, height } = await loadImageBoundedBySize(source);

  // A quarter turn swaps the canvas dimensions.
  const swapped = options.rotation === 90 || options.rotation === 270;
  const outWidth = swapped ? height : width;
  const outHeight = swapped ? width : height;

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;

  const ctx = canvas.getContext("2d", { alpha: !opaque });
  if (!ctx) {
    bitmap.close();
    throw new Error(
      "Your browser couldn't create the image canvas needed for this. Try updating your browser or switching devices.",
    );
  }

  if (opaque) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outWidth, outHeight);
  }

  // Work from the centre of the output so rotation and mirroring compose
  // without having to track where each transform moved the origin.
  ctx.translate(outWidth / 2, outHeight / 2);
  if (options.rotation !== 0) ctx.rotate((options.rotation * Math.PI) / 180);
  ctx.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, -width / 2, -height / 2, width, height);
  bitmap.close();

  const blob = await canvasToBlob(canvas, mime, opaque ? (options.quality ?? 0.92) : undefined);
  return { blob, bytes: blob.size, width: outWidth, height: outHeight };
}
