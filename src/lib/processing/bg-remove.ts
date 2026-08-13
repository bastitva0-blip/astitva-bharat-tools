// Background removal using @imgly/background-removal.
// Runs entirely in the browser (WASM + ONNX model loaded lazily from CDN).
// First call ~3-5 s (model download); subsequent calls ~0.5-1 s (model cached).

export interface BgRemoveResult {
  blob: Blob;
  bytes: number;
  /** Whether the result carries an alpha channel (always true here). */
  hasAlpha: true;
}

let removeBackgroundFn: ((src: Blob, cfg?: object) => Promise<Blob>) | null = null;

async function getRemoveFn() {
  if (!removeBackgroundFn) {
    const mod = await import("@imgly/background-removal");
    removeBackgroundFn = mod.removeBackground;
  }
  return removeBackgroundFn;
}

export async function removeBg(
  file: File,
  options: { bgColor?: string | null } = {},
): Promise<BgRemoveResult> {
  const remove = await getRemoveFn();

  // Remove background — output is always PNG with alpha.
  const transparent = await remove(file, {
    model: "small",
    output: { format: "image/png", quality: 1 },
  });

  if (!options.bgColor) {
    return { blob: transparent, bytes: transparent.size, hasAlpha: true };
  }

  // Composite onto a solid colour via OffscreenCanvas if available, else canvas.
  const img = await createImageBitmap(transparent);
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(img.width, img.height)
      : Object.assign(document.createElement("canvas"), { width: img.width, height: img.height });

  const ctx = (canvas as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = options.bgColor;
  ctx.fillRect(0, 0, img.width, img.height);
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob>((res, rej) => {
    if (canvas instanceof HTMLCanvasElement) {
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("canvas toBlob failed"))), "image/jpeg", 0.92);
    } else {
      (canvas as OffscreenCanvas).convertToBlob({ type: "image/jpeg", quality: 0.92 }).then(res).catch(rej);
    }
  });

  return { blob, bytes: blob.size, hasAlpha: true };
}
