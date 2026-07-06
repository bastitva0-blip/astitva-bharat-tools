export interface CropRegionPx {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

export function cropAndResize(
  source: HTMLImageElement,
  crop: CropRegionPx,
  targetW: number,
  targetH: number,
  background: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, targetW, targetH);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))),
      type,
      quality,
    );
  });
}

export interface CompressToTargetOptions {
  minBytes: number;
  maxBytes: number;
  type?: "image/jpeg";
  qualityHigh?: number;
  qualityLow?: number;
  iterations?: number;
}

export interface CompressResult {
  blob: Blob;
  quality: number;
  bytes: number;
  hitTarget: boolean;
}

export async function compressToTarget(
  canvas: HTMLCanvasElement,
  opts: CompressToTargetOptions,
): Promise<CompressResult> {
  const type = opts.type ?? "image/jpeg";
  let lo = opts.qualityLow ?? 0.3;
  let hi = opts.qualityHigh ?? 0.95;
  const iterations = opts.iterations ?? 8;

  let best: { blob: Blob; quality: number } | null = null;
  let bestDistance = Infinity;

  for (let i = 0; i < iterations; i++) {
    const q = (lo + hi) / 2;
    const blob = await canvasToBlob(canvas, type, q);
    const size = blob.size;

    const targetMid = (opts.minBytes + opts.maxBytes) / 2;
    const distance =
      size > opts.maxBytes ? size - opts.maxBytes : size < opts.minBytes ? opts.minBytes - size : Math.abs(size - targetMid);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = { blob, quality: q };
    }

    if (size > opts.maxBytes) hi = q;
    else if (size < opts.minBytes) lo = q;
    else return { blob, quality: q, bytes: size, hitTarget: true };
  }

  const result = best ?? {
    blob: await canvasToBlob(canvas, type, hi),
    quality: hi,
  };
  return {
    blob: result.blob,
    quality: result.quality,
    bytes: result.blob.size,
    hitTarget: result.blob.size >= opts.minBytes && result.blob.size <= opts.maxBytes,
  };
}

// Minimum edge length we'll downscale to before giving up — keeps us from
// shrinking a tiny thumbnail into a useless sliver chasing an unreachable
// target (e.g. a 20 KB target on a source that's already mostly noise).
const MIN_DOWNSCALE_EDGE_PX = 100;

// Max downscale rounds. Each round shrinks by DOWNSCALE_FACTOR, so this
// caps how far we chase an aggressive target (e.g. 20 KB) before accepting
// the closest result we've found. Kept generous (vs. the old cap of 3) so
// the loop — not the user re-uploading its own output — does the work of
// repeatedly shrinking until we're actually under budget.
const MAX_DOWNSCALE_ATTEMPTS = 12;
const DOWNSCALE_FACTOR = 0.85;

export async function compressWithDownscale(
  source: HTMLImageElement,
  crop: CropRegionPx,
  targetW: number,
  targetH: number,
  background: string,
  opts: CompressToTargetOptions,
): Promise<CompressResult & { width: number; height: number }> {
  let w = targetW;
  let h = targetH;

  let best: (CompressResult & { width: number; height: number }) | null = null;

  for (let attempt = 0; attempt < MAX_DOWNSCALE_ATTEMPTS; attempt++) {
    const canvas = cropAndResize(source, crop, w, h, background);
    const result = await compressToTarget(canvas, opts);

    // Track the best (smallest-over-target, else largest-under-target)
    // result seen so far, so we always have a sane fallback even if we
    // bail out early or never hit the band.
    if (
      !best ||
      isBetterCompression(result.bytes, best.bytes, opts.minBytes, opts.maxBytes)
    ) {
      best = { ...result, width: w, height: h };
    }

    if (result.hitTarget || result.bytes <= opts.maxBytes) {
      return { ...result, width: w, height: h };
    }

    const nextW = Math.round(w * DOWNSCALE_FACTOR);
    const nextH = Math.round(h * DOWNSCALE_FACTOR);
    // Stop shrinking once we'd cross the minimum useful edge length —
    // further downscaling would produce a degenerate image without
    // meaningfully helping hit the target.
    if (Math.min(nextW, nextH) < MIN_DOWNSCALE_EDGE_PX) break;
    w = nextW;
    h = nextH;
  }

  // Exhausted our downscale budget without landing under maxBytes — return
  // the closest result we ever produced instead of silently accepting
  // whatever the last binary search attempt happened to land on.
  return best ?? { ...(await compressToTarget(cropAndResize(source, crop, targetW, targetH, background), opts)), width: targetW, height: targetH };
}

// True if `candidateBytes` is a strictly better fit for [minBytes, maxBytes]
// than `currentBytes`: prefer being inside the band; among two out-of-band
// sizes prefer the smaller "overage" (closer to maxBytes from above, or
// closer to minBytes from below, either way minimizing distance to the band).
function isBetterCompression(
  candidateBytes: number,
  currentBytes: number,
  minBytes: number,
  maxBytes: number,
): boolean {
  const dist = (bytes: number) =>
    bytes > maxBytes ? bytes - maxBytes : bytes < minBytes ? minBytes - bytes : 0;
  return dist(candidateBytes) < dist(currentBytes);
}

export function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export interface CompressImageOptions {
  targetKb: number;
  toleranceKb: number;
}

export interface CompressImageResult {
  blob: Blob;
  bytes: number;
  width: number;
  height: number;
  hitTarget: boolean;
}

export async function compressImageToTargetKb(
  source: Blob,
  opts: CompressImageOptions,
): Promise<CompressImageResult> {
  const url = URL.createObjectURL(source);
  try {
    const img = await loadImage(url);
    const cropFull: CropRegionPx = {
      x: 0,
      y: 0,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
    const result = await compressWithDownscale(
      img,
      cropFull,
      img.naturalWidth,
      img.naturalHeight,
      "#ffffff",
      {
        minBytes: Math.max(0, (opts.targetKb - opts.toleranceKb) * 1024),
        maxBytes: opts.targetKb * 1024,
      },
    );
    return {
      blob: result.blob,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      hitTarget: result.hitTarget,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
