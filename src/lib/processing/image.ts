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

  for (let attempt = 0; attempt < 3; attempt++) {
    const canvas = cropAndResize(source, crop, w, h, background);
    const result = await compressToTarget(canvas, opts);
    if (result.hitTarget || result.bytes <= opts.maxBytes || attempt === 2) {
      return { ...result, width: w, height: h };
    }
    w = Math.round(w * 0.9);
    h = Math.round(h * 0.9);
  }

  const fallbackCanvas = cropAndResize(source, crop, targetW, targetH, background);
  const result = await compressToTarget(fallbackCanvas, opts);
  return { ...result, width: targetW, height: targetH };
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
