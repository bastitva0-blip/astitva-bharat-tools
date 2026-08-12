import { canvasToBlob } from "./image";

// The drawing surface is defined in abstract units rather than pixels so the
// same stroke data drives both the on-screen SVG pad and the exported raster
// at whatever resolution we choose. 350×150 is the 3.5 cm × 1.5 cm signature
// box most Indian form portals specify, at 100 units per centimetre.
export const PAD_WIDTH = 350;
export const PAD_HEIGHT = 150;

/** Export at 4× the pad so a 3.5 cm signature lands near 400 DPI. */
const EXPORT_SCALE = 4;

/** Breathing room left around the ink after trimming, in pad units. */
const TRIM_PADDING = 8;

export interface StrokePoint {
  x: number;
  y: number;
}

export type Stroke = StrokePoint[];

export type PenColor = "black" | "blue";

export const PEN_HEX: Record<PenColor, string> = {
  black: "#101010",
  blue: "#12309b",
};

export interface SignatureOutput {
  blob: Blob;
  bytes: number;
  width: number;
  height: number;
}

export interface RenderSignatureOptions {
  strokes: Stroke[];
  penWidth: number;
  penColor: PenColor;
  /** PNG keeps the paper see-through; JPG flattens onto white. */
  transparent: boolean;
}

export function isBlank(strokes: Stroke[]): boolean {
  return !strokes.some((s) => s.length > 0);
}

/**
 * Bounding box of the ink in pad units, already padded and clamped to the pad.
 * Derived from the stroke points rather than by scanning pixels — the points
 * are the ground truth and reading them avoids a getImageData pass that some
 * mobile browsers make expensive.
 */
function inkBounds(strokes: Stroke[], penWidth: number) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stroke of strokes) {
    for (const p of stroke) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }

  if (!Number.isFinite(minX)) {
    return { x: 0, y: 0, width: PAD_WIDTH, height: PAD_HEIGHT };
  }

  const grow = penWidth / 2 + TRIM_PADDING;
  const x = Math.max(0, minX - grow);
  const y = Math.max(0, minY - grow);
  const right = Math.min(PAD_WIDTH, maxX + grow);
  const bottom = Math.min(PAD_HEIGHT, maxY + grow);

  return {
    x,
    y,
    // A single dot would otherwise produce a zero-area crop.
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y),
  };
}

export async function renderSignature(opts: RenderSignatureOptions): Promise<SignatureOutput> {
  if (isBlank(opts.strokes)) {
    throw new Error("Draw your signature in the box first.");
  }

  const bounds = inkBounds(opts.strokes, opts.penWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bounds.width * EXPORT_SCALE);
  canvas.height = Math.round(bounds.height * EXPORT_SCALE);

  const ctx = canvas.getContext("2d", { alpha: opts.transparent });
  if (!ctx) {
    throw new Error(
      "Your browser couldn't create the canvas needed to export this. Try updating your browser.",
    );
  }

  if (!opts.transparent) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Move the origin to the trimmed corner and scale up, so stroke points can
  // be drawn in pad units without converting each one.
  ctx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, -bounds.x * EXPORT_SCALE, -bounds.y * EXPORT_SCALE);
  ctx.strokeStyle = PEN_HEX[opts.penColor];
  ctx.lineWidth = opts.penWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stroke of opts.strokes) {
    if (stroke.length === 0) continue;
    ctx.beginPath();
    if (stroke.length === 1) {
      // A tap — draw it as a dot, otherwise the stroke would be invisible.
      const p = stroke[0]!;
      ctx.arc(p.x, p.y, opts.penWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = PEN_HEX[opts.penColor];
      ctx.fill();
      continue;
    }
    ctx.moveTo(stroke[0]!.x, stroke[0]!.y);
    for (let i = 1; i < stroke.length; i += 1) {
      ctx.lineTo(stroke[i]!.x, stroke[i]!.y);
    }
    ctx.stroke();
  }

  const type = opts.transparent ? "image/png" : "image/jpeg";
  const blob = await canvasToBlob(canvas, type, opts.transparent ? undefined : 0.92);
  return { blob, bytes: blob.size, width: canvas.width, height: canvas.height };
}

/** SVG path data for one stroke — shared by the pad and the live preview. */
export function strokeToPath(stroke: Stroke): string {
  if (stroke.length === 0) return "";
  if (stroke.length === 1) {
    const p = stroke[0]!;
    // Zero-length segment; `stroke-linecap: round` renders it as a dot.
    return `M ${p.x} ${p.y} L ${p.x} ${p.y}`;
  }
  return stroke.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}
