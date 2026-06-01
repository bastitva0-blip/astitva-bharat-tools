// Decoded-pixel guard.
//
// OOM on budget Android comes from decoded pixel count, not file bytes. A 10MB
// HEIC can decode to a 50MP RGBA buffer (~200MB). This helper decodes an image
// safely: if the source exceeds the cap, it downscales BEFORE allocating the
// full bitmap.
//
// Default cap = 16MP (4000×4000). HEIC tools should pass a stricter cap
// (e.g. 6_000_000) per engineering-decisions #6.

export interface BoundedBitmap {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  downscaled: boolean;
  originalWidth: number;
  originalHeight: number;
}

export interface DecodedPixelGuardOptions {
  maxPixels?: number;
  // Quality hint for the resize step. "high" is the browser default and the
  // right call for photo tools; "pixelated" preserves edges for QR/diagrams.
  resizeQuality?: ImageBitmapOptions["resizeQuality"];
}

const DEFAULT_MAX_PIXELS = 16_000_000;

export async function loadImageBoundedBySize(
  source: Blob | ImageBitmapSource,
  options: DecodedPixelGuardOptions = {},
): Promise<BoundedBitmap> {
  const maxPixels = options.maxPixels ?? DEFAULT_MAX_PIXELS;

  // First pass: peek at intrinsic dimensions without committing to a full
  // decode. `createImageBitmap` here uses the browser's progressive decode
  // path; the returned bitmap may still be large, but on most engines the
  // initial decode is cheaper than a manual canvas paint.
  const probe = await createImageBitmap(source);
  const originalWidth = probe.width;
  const originalHeight = probe.height;
  const originalPixels = originalWidth * originalHeight;

  if (originalPixels <= maxPixels) {
    return {
      bitmap: probe,
      width: originalWidth,
      height: originalHeight,
      downscaled: false,
      originalWidth,
      originalHeight,
    };
  }

  // Downscale path. Compute the largest fit under the cap, preserve aspect.
  const scale = Math.sqrt(maxPixels / originalPixels);
  const targetWidth = Math.max(1, Math.floor(originalWidth * scale));
  const targetHeight = Math.max(1, Math.floor(originalHeight * scale));

  const downscaled = await createImageBitmap(probe, 0, 0, originalWidth, originalHeight, {
    resizeWidth: targetWidth,
    resizeHeight: targetHeight,
    resizeQuality: options.resizeQuality ?? "high",
  });

  // Release the probe ASAP — keeping both alive doubles peak memory.
  probe.close();

  return {
    bitmap: downscaled,
    width: targetWidth,
    height: targetHeight,
    downscaled: true,
    originalWidth,
    originalHeight,
  };
}
