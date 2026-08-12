import { degrees, PDFDocument } from "pdf-lib";

/** Clockwise turn applied on top of whatever rotation the page already has. */
export type RotationDelta = 0 | 90 | 180 | 270;

/**
 * Applies a per-page clockwise rotation and returns the rewritten PDF.
 *
 * `deltas` is indexed by page (0-based) and is *additive*: a page that a
 * scanner already stored at 90° and that the user turns another 90° ends up
 * at 180°. Rewriting the rotation entry leaves the page content untouched,
 * so nothing is re-encoded and no quality is lost.
 */
export async function rotatePdf(source: Blob, deltas: RotationDelta[]): Promise<Uint8Array> {
  const bytes = new Uint8Array(await source.arrayBuffer());
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  doc.setProducer("BharatTools");
  doc.setCreator("BharatTools");

  const pages = doc.getPages();
  pages.forEach((page, index) => {
    const delta = deltas[index] ?? 0;
    if (delta === 0) return;
    const current = page.getRotation().angle;
    page.setRotation(degrees(normalizeAngle(current + delta)));
  });

  return doc.save({ useObjectStreams: true });
}

// PDF readers only honour rotations that are multiples of 90 in [0, 360).
// Scanners occasionally write negative angles, so normalise rather than
// assuming the stored value is already in range.
function normalizeAngle(angle: number): number {
  const snapped = Math.round(angle / 90) * 90;
  return ((snapped % 360) + 360) % 360;
}
