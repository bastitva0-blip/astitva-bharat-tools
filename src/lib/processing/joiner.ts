import { canvasToBlob, loadImage } from "@/lib/processing/image";
import type { JoinerLayout } from "@/lib/presets/joiner";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function detectContentBounds(img: HTMLImageElement, whiteThreshold = 240): BoundingBox {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight };
  }
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 16) continue;
      if (r < whiteThreshold || g < whiteThreshold || b < whiteThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight };
  }
  const pad = Math.round(Math.max(width, height) * 0.02);
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  const w = Math.min(width - x, maxX - minX + 1 + pad * 2);
  const h = Math.min(height - y, maxY - minY + 1 + pad * 2);
  return { x, y, width: w, height: h };
}

function drawCoverFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  source: BoundingBox,
  dest: { x: number; y: number; width: number; height: number },
) {
  const sourceAspect = source.width / source.height;
  const destAspect = dest.width / dest.height;
  let sx: number, sy: number, sw: number, sh: number;
  if (sourceAspect > destAspect) {
    sh = source.height;
    sw = sh * destAspect;
    sx = source.x + (source.width - sw) / 2;
    sy = source.y;
  } else {
    sw = source.width;
    sh = sw / destAspect;
    sx = source.x;
    sy = source.y + (source.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dest.x, dest.y, dest.width, dest.height);
}

function drawContainFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  source: BoundingBox,
  dest: { x: number; y: number; width: number; height: number },
) {
  const sourceAspect = source.width / source.height;
  const destAspect = dest.width / dest.height;
  let dw: number, dh: number;
  if (sourceAspect > destAspect) {
    dw = dest.width;
    dh = dw / sourceAspect;
  } else {
    dh = dest.height;
    dw = dh * sourceAspect;
  }
  const dx = dest.x + (dest.width - dw) / 2;
  const dy = dest.y + (dest.height - dh) / 2;
  ctx.drawImage(img, source.x, source.y, source.width, source.height, dx, dy, dw, dh);
}

export interface JoinOptions {
  photo: Blob;
  signature: Blob;
  widthPx: number;
  heightPx: number;
  layout: JoinerLayout;
  autoTrimSignature: boolean;
  jpegQuality?: number;
}

export interface JoinResult {
  blob: Blob;
  bytes: number;
}

export async function joinPhotoAndSignature(opts: JoinOptions): Promise<JoinResult> {
  const photoUrl = URL.createObjectURL(opts.photo);
  const sigUrl = URL.createObjectURL(opts.signature);
  try {
    const [photoImg, sigImg] = await Promise.all([loadImage(photoUrl), loadImage(sigUrl)]);

    const canvas = document.createElement("canvas");
    canvas.width = opts.widthPx;
    canvas.height = opts.heightPx;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let photoBox: { x: number; y: number; width: number; height: number };
    let signatureBox: { x: number; y: number; width: number; height: number };
    if (opts.layout === "side-by-side") {
      const half = Math.floor(opts.widthPx / 2);
      photoBox = { x: 0, y: 0, width: half, height: opts.heightPx };
      signatureBox = { x: half, y: 0, width: opts.widthPx - half, height: opts.heightPx };
    } else {
      const half = Math.floor(opts.heightPx / 2);
      photoBox = { x: 0, y: 0, width: opts.widthPx, height: half };
      signatureBox = { x: 0, y: half, width: opts.widthPx, height: opts.heightPx - half };
    }

    const photoSource: BoundingBox = {
      x: 0,
      y: 0,
      width: photoImg.naturalWidth,
      height: photoImg.naturalHeight,
    };
    drawCoverFit(ctx, photoImg, photoSource, photoBox);

    const sigSource = opts.autoTrimSignature
      ? detectContentBounds(sigImg)
      : { x: 0, y: 0, width: sigImg.naturalWidth, height: sigImg.naturalHeight };
    drawContainFit(ctx, sigImg, sigSource, signatureBox);

    const blob = await canvasToBlob(canvas, "image/jpeg", opts.jpegQuality ?? 0.92);
    return { blob, bytes: blob.size };
  } finally {
    URL.revokeObjectURL(photoUrl);
    URL.revokeObjectURL(sigUrl);
  }
}
