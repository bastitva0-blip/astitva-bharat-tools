import { canvasToBlob, type CropRegionPx } from "./image";

// Free-form crop. Distinct from `cropAndResize` in image.ts, which always
// composites onto an opaque background because it exists to hit a portal's
// exact pixel spec. Here the user is trimming an image and keeping its own
// dimensions, so transparency has to survive when the output is PNG or WebP.

export type CropOutputFormat = "image/jpeg" | "image/png" | "image/webp";

export interface CropImageResult {
  blob: Blob;
  bytes: number;
  width: number;
  height: number;
}

export async function cropImage(
  source: CanvasImageSource,
  crop: CropRegionPx,
  format: CropOutputFormat,
  quality = 0.92,
): Promise<CropImageResult> {
  const width = Math.max(1, Math.round(crop.width));
  const height = Math.max(1, Math.round(crop.height));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const opaque = format === "image/jpeg";
  const ctx = canvas.getContext("2d", { alpha: !opaque });
  if (!ctx) {
    throw new Error(
      "Your browser couldn't create the image canvas needed for this. Try updating your browser or switching devices.",
    );
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // JPEG has no alpha channel, so anything transparent would encode as black.
  if (opaque) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, format, opaque ? quality : undefined);
  return { blob, bytes: blob.size, width, height };
}

/**
 * Output format for a given input. JPEG stays JPEG, PNG/WebP keep their
 * transparency, and anything else (HEIC, BMP, an unknown type) becomes JPEG —
 * the format Indian government portals actually accept.
 */
export function outputFormatFor(inputType: string): CropOutputFormat {
  if (inputType === "image/png") return "image/png";
  if (inputType === "image/webp") return "image/webp";
  return "image/jpeg";
}
